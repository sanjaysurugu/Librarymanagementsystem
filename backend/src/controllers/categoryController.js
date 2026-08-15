const Category = require('../models/Category');

const getCategories = async (req, res, next) => {
  try {
    const cats = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, categories: cats });
  } catch (err) { next(err); }
};

const createCategory = async (req, res, next) => {
  try {
    const cat = await Category.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Category created', category: cat });
  } catch (err) { next(err); }
};

const updateCategory = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category updated', category: cat });
  } catch (err) { next(err); }
};

const deleteCategory = async (req, res, next) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    if (cat.bookCount > 0) return res.status(400).json({ success: false, message: `Cannot delete: ${cat.bookCount} books in this category` });
    await cat.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
};

const adminGetCategories = async (req, res, next) => {
  try {
    const cats = await Category.find().populate('createdBy','name').sort({ name: 1 });
    res.json({ success: true, categories: cats });
  } catch (err) { next(err); }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory, adminGetCategories };
