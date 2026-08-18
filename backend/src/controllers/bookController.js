const crypto  = require('crypto');
const fs      = require('fs');
const path    = require('path');
const slugify = require('slugify');
const { admin } = require('../config/firebase');
const { getFirestore, toData, findUserById } = require('../config/firestore');
const { getPagination, paginationResponse, getMimeFileType, getClientIp } = require('../utils/helpers');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');
const { sendEmail, emailTemplates }      = require('../config/email');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
const increment = (n) => admin.firestore.FieldValue.increment(n);

const booksCol = () => getFirestore().collection('books');

const stripPublicIds = (book) => ({
  ...book,
  coverImage: book.coverImage ? { url: book.coverImage.url } : { url: '' },
  bookFile:   book.bookFile   ? { url: book.bookFile.url, fileType: book.bookFile.fileType, fileSize: book.bookFile.fileSize } : { url: '' },
});

const attachRefs = async (book) => {
  const db = getFirestore();
  const [categorySnap, uploader] = await Promise.all([
    book.category ? db.collection('categories').doc(book.category).get() : null,
    book.uploader ? findUserById(book.uploader) : null,
  ]);
  return {
    ...book,
    category: categorySnap?.exists
      ? (({ _id, name, slug, icon, color }) => ({ _id, name, slug, icon, color }))(toData(categorySnap))
      : book.category,
    uploader: uploader
      ? { _id: uploader._id, name: uploader.name, email: uploader.email, avatar: uploader.avatar }
      : book.uploader,
  };
};

const attachRefsMany = (books) => Promise.all(books.map(attachRefs));

const generateSlug = async (title, excludeId = null) => {
  const base = slugify(title, { lower: true, strict: true }) || 'book';
  let slug = base;
  let count = 1;
  for (;;) {
    const existing = await booksCol().where('slug', '==', slug).limit(1).get();
    if (existing.empty || (excludeId && existing.docs[0].id === excludeId)) return slug;
    slug = `${base}-${count++}`;
  }
};

const findBookByIdOrSlug = async (idOrSlug) => {
  const snap = await booksCol().doc(idOrSlug).get();
  if (snap.exists) return toData(snap);
  const bySlug = await booksCol().where('slug', '==', idOrSlug).limit(1).get();
  return bySlug.empty ? null : toData(bySlug.docs[0]);
};

const matchesSearch = (book, search) => {
  const q = search.toLowerCase();
  return [book.title, book.author, book.description, ...(book.tags || [])]
    .some((v) => typeof v === 'string' && v.toLowerCase().includes(q));
};

const toMillis = (v) => (v?.toMillis ? v.toMillis() : new Date(v || 0).getTime());

const sortBooks = (books, sort) => {
  const sorters = {
    oldest:          (a, b) => toMillis(a.createdAt) - toMillis(b.createdAt),
    most_downloaded: (a, b) => (b.downloadCount || 0) - (a.downloadCount || 0),
    highest_rated:   (a, b) => (b.averageRating || 0) - (a.averageRating || 0),
    az:              (a, b) => (a.title || '').localeCompare(b.title || ''),
    za:              (a, b) => (b.title || '').localeCompare(a.title || ''),
  };
  return books.sort(sorters[sort] || ((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)));
};

const paginate = (books, query) => {
  const { page, limit, skip } = getPagination(query);
  return { items: books.slice(skip, skip + limit), pagination: paginationResponse(books.length, page, limit) };
};

const getBooks = async (req, res, next) => {
  try {
    const { search, category, language, yearFrom, yearTo, minRating, fileType, sort, featured } = req.query;

    const snapshot = await booksCol().where('status', '==', 'approved').get();
    let books = snapshot.docs.map(toData);

    if (search)    books = books.filter((b) => matchesSearch(b, search));
    if (category)  books = books.filter((b) => b.category === category);
    if (language)  books = books.filter((b) => (b.language || '').toLowerCase() === language.toLowerCase());
    if (yearFrom)  books = books.filter((b) => (b.publishedYear || 0) >= +yearFrom);
    if (yearTo)    books = books.filter((b) => (b.publishedYear || 0) <= +yearTo);
    if (minRating) books = books.filter((b) => (b.averageRating || 0) >= +minRating);
    if (fileType)  books = books.filter((b) => b.bookFile?.fileType === fileType);
    if (featured === 'true') books = books.filter((b) => b.isFeatured);

    sortBooks(books, sort);
    const { items, pagination } = paginate(books, req.query);
    res.json({ success: true, books: await attachRefsMany(items.map(stripPublicIds)), pagination });
  } catch (err) { next(err); }
};

const getBook = async (req, res, next) => {
  try {
    const book = await findBookByIdOrSlug(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.status !== 'approved') {
      if (!req.user || (req.user.role !== 'admin' && book.uploader !== req.user._id))
        return res.status(404).json({ success: false, message: 'Book not found' });
    }
    await booksCol().doc(book._id).update({ viewCount: increment(1) });
    res.json({ success: true, book: await attachRefs(stripPublicIds(book)) });
  } catch (err) { next(err); }
};

const createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, publisher, publishedYear, category, language, description, tags, pages } = req.body;

    const categorySnap = await getFirestore().collection('categories').doc(category).get();
    if (!categorySnap.exists) return res.status(400).json({ success: false, message: 'Category not found' });

    let coverImage = { url: '', publicId: '' };
    let bookFile   = { url: '', publicId: '', fileType: 'pdf', fileSize: 0 };

    if (req.files?.coverImage?.[0]) {
      const f = req.files.coverImage[0];
      const r = await uploadToCloudinary(f.buffer, { folder: 'library/covers', resource_type: 'image', transformation: [{ width: 400, height: 600, crop: 'fill' }] });
      coverImage = { url: r.secure_url, publicId: r.public_id };
    }
    if (req.files?.bookFile?.[0]) {
      const f  = req.files.bookFile[0];
      const ft = getMimeFileType(f.mimetype);
      const safeName = f.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const r  = await uploadToCloudinary(f.buffer, { folder: 'library/books', resource_type: 'raw', public_id: `${Date.now()}_${safeName}` });
      bookFile = { url: r.secure_url, publicId: r.public_id, fileType: ft, fileSize: f.size };
    }

    const isAdmin = req.user.role === 'admin';
    const id  = crypto.randomUUID();
    const now = new Date();
    const book = {
      _id: id,
      title, author,
      slug: await generateSlug(title),
      isbn: isbn || '', publisher: publisher || '',
      publishedYear: publishedYear ? +publishedYear : null,
      category, language: language || 'English', description,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()).filter(Boolean)) : [],
      pages: pages ? +pages : 0,
      coverImage, bookFile,
      uploader: req.user._id,
      status: isAdmin ? 'approved' : 'pending',
      rejectionReason: '', reviewedBy: null, reviewedAt: null,
      downloadCount: 0, viewCount: 0, averageRating: 0, totalRatings: 0, isFeatured: false,
      createdAt: now, updatedAt: now,
    };

    await booksCol().doc(id).set(book);
    await getFirestore().collection('users').doc(req.user._id).update({ totalUploads: increment(1) }).catch(() => {});
    if (book.status === 'approved') await getFirestore().collection('categories').doc(category).update({ bookCount: increment(1) }).catch(() => {});

    res.status(201).json({ success: true, message: isAdmin ? 'Book added' : 'Book uploaded — pending review', book: await attachRefs(book) });
  } catch (err) { next(err); }
};

const updateBook = async (req, res, next) => {
  try {
    const snap = await booksCol().doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ success: false, message: 'Book not found' });
    const book = toData(snap);
    const update = { updatedAt: new Date() };

    if (req.files?.coverImage?.[0]) {
      if (book.coverImage?.publicId) await cloudinary.uploader.destroy(book.coverImage.publicId).catch(() => {});
      const r = await uploadToCloudinary(req.files.coverImage[0].buffer, { folder: 'library/covers', resource_type: 'image' });
      update.coverImage = { url: r.secure_url, publicId: r.public_id };
    }
    if (req.files?.bookFile?.[0]) {
      if (book.bookFile?.publicId) await cloudinary.uploader.destroy(book.bookFile.publicId, { resource_type: 'raw' }).catch(() => {});
      const f = req.files.bookFile[0];
      const safeName = f.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const r = await uploadToCloudinary(f.buffer, { folder: 'library/books', resource_type: 'raw', public_id: `${Date.now()}_${safeName}` });
      update.bookFile = { url: r.secure_url, publicId: r.public_id, fileType: getMimeFileType(f.mimetype), fileSize: f.size };
    }

    ['title', 'author', 'isbn', 'publisher', 'language', 'description'].forEach((k) => {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    });
    if (req.body.title) update.slug = await generateSlug(req.body.title, book._id);
    if (req.body.publishedYear) update.publishedYear = +req.body.publishedYear;
    if (req.body.pages) update.pages = +req.body.pages;
    if (req.body.tags)  update.tags  = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (req.body.isFeatured !== undefined) update.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
    if (req.body.category && req.body.category !== book.category) {
      if (book.status === 'approved') {
        await getFirestore().collection('categories').doc(book.category).update({ bookCount: increment(-1) }).catch(() => {});
        await getFirestore().collection('categories').doc(req.body.category).update({ bookCount: increment(1) }).catch(() => {});
      }
      update.category = req.body.category;
    }

    await booksCol().doc(book._id).update(update);
    const updated = toData(await booksCol().doc(book._id).get());
    res.json({ success: true, message: 'Book updated', book: await attachRefs(updated) });
  } catch (err) { next(err); }
};

const deleteBook = async (req, res, next) => {
  try {
    const snap = await booksCol().doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ success: false, message: 'Book not found' });
    const book = toData(snap);
    if (book.coverImage?.publicId) await cloudinary.uploader.destroy(book.coverImage.publicId).catch(() => {});
    if (book.bookFile?.publicId)   await cloudinary.uploader.destroy(book.bookFile.publicId, { resource_type: 'raw' }).catch(() => {});
    if (book.status === 'approved') await getFirestore().collection('categories').doc(book.category).update({ bookCount: increment(-1) }).catch(() => {});
    await booksCol().doc(book._id).delete();
    res.json({ success: true, message: 'Book deleted' });
  } catch (err) { next(err); }
};

const reviewBook = async (req, res, next) => {
  try {
    const { action, reason } = req.body;
    const snap = await booksCol().doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ success: false, message: 'Book not found' });
    const book = toData(snap);
    if (book.status !== 'pending') return res.status(400).json({ success: false, message: 'Already reviewed' });

    const uploader = await findUserById(book.uploader);
    const update = { reviewedBy: req.user._id, reviewedAt: new Date(), updatedAt: new Date() };
    const notification = { _id: crypto.randomUUID(), recipient: book.uploader, relatedBook: book._id, isRead: false, createdAt: new Date() };

    if (action === 'approve') {
      update.status = 'approved';
      await getFirestore().collection('categories').doc(book.category).update({ bookCount: increment(1) }).catch(() => {});
      Object.assign(notification, { type: 'book_approved', title: 'Book Approved!', message: `Your book "${book.title}" is now live.` });
      if (uploader?.email) await sendEmail({ to: uploader.email, ...emailTemplates.bookApproved(uploader.name, book.title) });
    } else if (action === 'reject') {
      update.status = 'rejected';
      update.rejectionReason = reason || '';
      Object.assign(notification, { type: 'book_rejected', title: 'Book Not Approved', message: `Your book "${book.title}" was not approved.${reason ? ` Reason: ${reason}` : ''}` });
      if (uploader?.email) await sendEmail({ to: uploader.email, ...emailTemplates.bookRejected(uploader.name, book.title, reason) });
    } else return res.status(400).json({ success: false, message: 'action must be approve or reject' });

    await booksCol().doc(book._id).update(update);
    await getFirestore().collection('notifications').doc(notification._id).set(notification).catch(() => {});
    res.json({ success: true, message: `Book ${action}d`, book: await attachRefs({ ...book, ...update }) });
  } catch (err) { next(err); }
};

const downloadBook = async (req, res, next) => {
  try {
    const book = await findBookByIdOrSlug(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.status !== 'approved') {
      if (!req.user || (req.user.role !== 'admin' && book.uploader !== req.user._id))
        return res.status(404).json({ success: false, message: 'Book not found' });
    }
    if (!book.bookFile?.url) return res.status(404).json({ success: false, message: 'This book has no file to download' });

    await booksCol().doc(book._id).update({ downloadCount: increment(1) }).catch(() => {});
    if (req.user) {
      const id = crypto.randomUUID();
      await getFirestore().collection('downloads').doc(id).set({
        _id: id, user: req.user._id, book: book._id,
        fileType: book.bookFile.fileType || 'pdf', ipAddress: getClientIp(req), createdAt: new Date(),
      }).catch(() => {});
      await getFirestore().collection('users').doc(req.user._id).update({ totalDownloads: increment(1) }).catch(() => {});
    }

    const publicId = book.bookFile.publicId || '';
    const localPath = path.join(uploadsDir, publicId);
    if (publicId && !publicId.includes('/') && !publicId.includes('..') && fs.existsSync(localPath)) {
      const filename = `${slugify(book.title, { lower: true, strict: true }) || 'book'}.${book.bookFile.fileType || 'pdf'}`;
      return res.download(localPath, filename);
    }
    return res.redirect(book.bookFile.url.replace('/upload/', '/upload/fl_attachment/'));
  } catch (err) { next(err); }
};

const getPendingBooks = async (req, res, next) => {
  try {
    const snapshot = await booksCol().where('status', '==', 'pending').get();
    const books = sortBooks(snapshot.docs.map(toData), undefined);
    const { items, pagination } = paginate(books, req.query);
    res.json({ success: true, books: await attachRefsMany(items), pagination });
  } catch (err) { next(err); }
};

const getMyUploads = async (req, res, next) => {
  try {
    const snapshot = await booksCol().where('uploader', '==', req.user._id).get();
    let books = snapshot.docs.map(toData);
    if (req.query.status) books = books.filter((b) => b.status === req.query.status);
    sortBooks(books, undefined);
    const { items, pagination } = paginate(books, req.query);
    res.json({ success: true, books: await attachRefsMany(items), pagination });
  } catch (err) { next(err); }
};

const adminGetAllBooks = async (req, res, next) => {
  try {
    const snapshot = await booksCol().get();
    let books = snapshot.docs.map(toData);
    if (req.query.status)   books = books.filter((b) => b.status === req.query.status);
    if (req.query.category) books = books.filter((b) => b.category === req.query.category);
    if (req.query.search)   books = books.filter((b) => matchesSearch(b, req.query.search));
    sortBooks(books, undefined);
    const { items, pagination } = paginate(books, req.query);
    res.json({ success: true, books: await attachRefsMany(items), pagination });
  } catch (err) { next(err); }
};

module.exports = { getBooks, getBook, createBook, updateBook, deleteBook, reviewBook, downloadBook, getPendingBooks, getMyUploads, adminGetAllBooks };
