const crypto = require('crypto');
const slugify = require('slugify');
const { getFirestore, toData } = require('../config/firestore');

const DEFAULT_CATEGORIES = [
  { name: 'Fiction', description: 'Novels, short stories, and literary works.' },
  { name: 'Non-Fiction', description: 'Informative and factual books.' },
  { name: 'Science & Technology', description: 'Science, computing, and technology resources.' },
  { name: 'History', description: 'Historical books and biographies.' },
  { name: 'Education', description: 'Academic and learning materials.' },
  { name: 'Children & Young Adult', description: 'Books for children and young readers.' },
  { name: 'Self-Help', description: 'Personal growth and wellness books.' },
  { name: 'Arts & Literature', description: 'Art, poetry, and literary criticism.' },
];

const ensureDefaultCategories = async () => {
  const db = getFirestore();
  const batch = db.batch();
  for (const category of DEFAULT_CATEGORIES) {
    const existing = await db.collection('categories').where('name', '==', category.name).limit(1).get();
    if (existing.empty) {
      const ref = db.collection('categories').doc(crypto.randomUUID());
      batch.set(ref, { ...category, slug: slugify(category.name, { lower: true, strict: true }), icon: '📚', color: '#4F46E5', image: '', bookCount: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() });
    }
  }
  await batch.commit();
};

const getCategories = async (req, res, next) => {
  try {
    await ensureDefaultCategories();
    const snapshot = await getFirestore().collection('categories').where('isActive', '==', true).get();
    const categories = snapshot.docs.map(toData).sort((a, b) => a.name.localeCompare(b.name));
    res.json({ success: true, categories });
  } catch (err) { next(err); }
};

const createCategory = async (req, res, next) => {
  try {
    const id = crypto.randomUUID();
    const category = { _id: id, name: req.body.name.trim(), description: req.body.description || '', slug: slugify(req.body.name, { lower: true, strict: true }), icon: '📚', color: '#4F46E5', image: '', bookCount: 0, isActive: true, createdBy: req.user._id, createdAt: new Date(), updatedAt: new Date() };
    const duplicate = await getFirestore().collection('categories').where('name', '==', category.name).limit(1).get();
    if (!duplicate.empty) return res.status(400).json({ success: false, message: 'Category already exists' });
    await getFirestore().collection('categories').doc(id).set(category);
    res.status(201).json({ success: true, message: 'Category created', category });
  } catch (err) { next(err); }
};

const updateCategory = async (req, res, next) => {
  try {
    const ref = getFirestore().collection('categories').doc(req.params.id);
    if (!(await ref.get()).exists) return res.status(404).json({ success: false, message: 'Category not found' });
    const update = { ...req.body, updatedAt: new Date() };
    if (update.name) update.slug = slugify(update.name, { lower: true, strict: true });
    await ref.update(update);
    res.json({ success: true, message: 'Category updated', category: toData(await ref.get()) });
  } catch (err) { next(err); }
};

const deleteCategory = async (req, res, next) => {
  try {
    const ref = getFirestore().collection('categories').doc(req.params.id);
    const category = await ref.get();
    if (!category.exists) return res.status(404).json({ success: false, message: 'Category not found' });
    if (category.data().bookCount > 0) return res.status(400).json({ success: false, message: 'Cannot delete a category with books' });
    await ref.delete();
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
};

const adminGetCategories = async (req, res, next) => {
  try {
    await ensureDefaultCategories();
    const snapshot = await getFirestore().collection('categories').get();
    res.json({ success: true, categories: snapshot.docs.map(toData).sort((a, b) => a.name.localeCompare(b.name)) });
  } catch (err) { next(err); }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory, adminGetCategories };
