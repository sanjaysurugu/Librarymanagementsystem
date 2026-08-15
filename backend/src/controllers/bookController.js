const Book         = require('../models/Book');
const Category     = require('../models/Category');
const Notification = require('../models/Notification');
const User         = require('../models/User');
const { getPagination, paginationResponse, getMimeFileType } = require('../utils/helpers');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');
const { sendEmail, emailTemplates }      = require('../config/email');

const getBooks = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, category, language, yearFrom, yearTo, minRating, fileType, sort, featured } = req.query;

    const filter = { status: 'approved' };
    if (search)   filter.$text = { $search: search };
    if (category) filter.category = category;
    if (language) filter.language = language;
    if (yearFrom || yearTo) { filter.publishedYear = {}; if (yearFrom) filter.publishedYear.$gte = +yearFrom; if (yearTo) filter.publishedYear.$lte = +yearTo; }
    if (minRating) filter.averageRating = { $gte: +minRating };
    if (fileType)  filter['bookFile.fileType'] = fileType;
    if (featured === 'true') filter.isFeatured = true;

    const sortMap = { oldest: { createdAt: 1 }, most_downloaded: { downloadCount: -1 }, highest_rated: { averageRating: -1 }, az: { title: 1 }, za: { title: -1 } };
    const sortOpt = sortMap[sort] || { createdAt: -1 };

    const [books, total] = await Promise.all([
      Book.find(filter).populate('category','name slug icon color').populate('uploader','name avatar')
        .select('-bookFile.publicId -coverImage.publicId').sort(sortOpt).skip(skip).limit(limit),
      Book.countDocuments(filter),
    ]);
    res.json({ success: true, books, pagination: paginationResponse(total, page, limit) });
  } catch (err) { next(err); }
};

const getBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }] })
      .populate('category','name slug icon color').populate('uploader','name avatar').populate('reviewedBy','name');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.status !== 'approved') {
      if (!req.user || (req.user.role !== 'admin' && book.uploader._id.toString() !== req.user._id.toString()))
        return res.status(404).json({ success: false, message: 'Book not found' });
    }
    await Book.findByIdAndUpdate(book._id, { $inc: { viewCount: 1 } });
    res.json({ success: true, book });
  } catch (err) { next(err); }
};

const createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, publisher, publishedYear, category, language, description, tags, pages } = req.body;

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
      const r  = await uploadToCloudinary(f.buffer, { folder: 'library/books', resource_type: 'raw', public_id: `${Date.now()}_${f.originalname}` });
      bookFile = { url: r.secure_url, publicId: r.public_id, fileType: ft, fileSize: f.size };
    }

    const isAdmin = req.user.role === 'admin';
    const book = await Book.create({
      title, author, isbn, publisher,
      publishedYear: publishedYear ? +publishedYear : undefined,
      category, language, description,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      pages: pages ? +pages : 0,
      coverImage, bookFile,
      uploader: req.user._id,
      status: isAdmin ? 'approved' : 'pending',
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { totalUploads: 1 } });
    if (book.status === 'approved') await Category.findByIdAndUpdate(category, { $inc: { bookCount: 1 } });
    await book.populate('category','name slug');

    res.status(201).json({ success: true, message: isAdmin ? 'Book added' : 'Book uploaded — pending review', book });
  } catch (err) { next(err); }
};

const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    if (req.files?.coverImage?.[0]) {
      if (book.coverImage.publicId) await cloudinary.uploader.destroy(book.coverImage.publicId);
      const r = await uploadToCloudinary(req.files.coverImage[0].buffer, { folder: 'library/covers', resource_type: 'image' });
      book.coverImage = { url: r.secure_url, publicId: r.public_id };
    }
    if (req.files?.bookFile?.[0]) {
      if (book.bookFile.publicId) await cloudinary.uploader.destroy(book.bookFile.publicId, { resource_type: 'raw' });
      const f  = req.files.bookFile[0];
      const r  = await uploadToCloudinary(f.buffer, { folder: 'library/books', resource_type: 'raw' });
      book.bookFile = { url: r.secure_url, publicId: r.public_id, fileType: getMimeFileType(f.mimetype), fileSize: f.size };
    }

    const fields = ['title','author','isbn','publisher','language','description'];
    fields.forEach(k => { if (req.body[k] !== undefined) book[k] = req.body[k]; });
    if (req.body.publishedYear) book.publishedYear = +req.body.publishedYear;
    if (req.body.pages)  book.pages = +req.body.pages;
    if (req.body.tags)   book.tags  = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim());
    if (req.body.isFeatured !== undefined) book.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
    if (req.body.category && req.body.category !== book.category.toString()) {
      if (book.status === 'approved') {
        await Category.findByIdAndUpdate(book.category, { $inc: { bookCount: -1 } });
        await Category.findByIdAndUpdate(req.body.category, { $inc: { bookCount: 1 } });
      }
      book.category = req.body.category;
    }
    await book.save();
    await book.populate('category','name slug');
    res.json({ success: true, message: 'Book updated', book });
  } catch (err) { next(err); }
};

const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.coverImage.publicId) await cloudinary.uploader.destroy(book.coverImage.publicId).catch(() => {});
    if (book.bookFile.publicId)   await cloudinary.uploader.destroy(book.bookFile.publicId, { resource_type: 'raw' }).catch(() => {});
    if (book.status === 'approved') await Category.findByIdAndUpdate(book.category, { $inc: { bookCount: -1 } });
    await book.deleteOne();
    res.json({ success: true, message: 'Book deleted' });
  } catch (err) { next(err); }
};

const reviewBook = async (req, res, next) => {
  try {
    const { action, reason } = req.body;
    const book = await Book.findById(req.params.id).populate('uploader','name email');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.status !== 'pending') return res.status(400).json({ success: false, message: 'Already reviewed' });

    if (action === 'approve') {
      book.status = 'approved'; book.reviewedBy = req.user._id; book.reviewedAt = new Date();
      await Category.findByIdAndUpdate(book.category, { $inc: { bookCount: 1 } });
      await Notification.create({ recipient: book.uploader._id, type: 'book_approved', title: 'Book Approved!', message: `Your book "${book.title}" is now live.`, relatedBook: book._id });
      const tmpl = emailTemplates.bookApproved(book.uploader.name, book.title);
      await sendEmail({ to: book.uploader.email, ...tmpl });
    } else if (action === 'reject') {
      book.status = 'rejected'; book.rejectionReason = reason || ''; book.reviewedBy = req.user._id; book.reviewedAt = new Date();
      await Notification.create({ recipient: book.uploader._id, type: 'book_rejected', title: 'Book Not Approved', message: `Your book "${book.title}" was not approved.${reason ? ` Reason: ${reason}` : ''}`, relatedBook: book._id });
      const tmpl = emailTemplates.bookRejected(book.uploader.name, book.title, reason);
      await sendEmail({ to: book.uploader.email, ...tmpl });
    } else return res.status(400).json({ success: false, message: 'action must be approve or reject' });

    await book.save();
    res.json({ success: true, message: `Book ${action}d`, book });
  } catch (err) { next(err); }
};

const getPendingBooks = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [books, total] = await Promise.all([
      Book.find({ status: 'pending' }).populate('category','name').populate('uploader','name email avatar').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Book.countDocuments({ status: 'pending' }),
    ]);
    res.json({ success: true, books, pagination: paginationResponse(total, page, limit) });
  } catch (err) { next(err); }
};

const getMyUploads = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { uploader: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const [books, total] = await Promise.all([
      Book.find(filter).populate('category','name slug').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Book.countDocuments(filter),
    ]);
    res.json({ success: true, books, pagination: paginationResponse(total, page, limit) });
  } catch (err) { next(err); }
};

const adminGetAllBooks = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search)   filter.$text    = { $search: req.query.search };
    const [books, total] = await Promise.all([
      Book.find(filter).populate('category','name slug').populate('uploader','name email')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Book.countDocuments(filter),
    ]);
    res.json({ success: true, books, pagination: paginationResponse(total, page, limit) });
  } catch (err) { next(err); }
};

module.exports = { getBooks, getBook, createBook, updateBook, deleteBook, reviewBook, getPendingBooks, getMyUploads, adminGetAllBooks };
