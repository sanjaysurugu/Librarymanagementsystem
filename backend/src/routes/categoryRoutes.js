const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { getCategories, createCategory, updateCategory, deleteCategory, adminGetCategories } = require('../controllers/categoryController');
const { validateCategory } = require('../validators/bookValidators');

const router = express.Router();

// Public routes
router.get('/', getCategories);

// Admin routes
router.get('/admin/all', protect, adminOnly, adminGetCategories);
router.post('/', protect, adminOnly, validateCategory, createCategory);
router.patch('/:id', protect, adminOnly, validateCategory, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
