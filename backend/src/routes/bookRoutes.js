const express = require('express');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { uploadBookFiles } = require('../middleware/upload');
const { getBooks, getBook, createBook, updateBook, deleteBook, reviewBook, getPendingBooks, getMyUploads, adminGetAllBooks } = require('../controllers/bookController');
const { validateBookCreate, validateBookUpdate } = require('../validators/bookValidators');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getBooks);
router.get('/pending', protect, adminOnly, getPendingBooks);
router.get('/:id', optionalAuth, getBook);

// Protected routes - User
router.post('/', protect, uploadBookFiles, validateBookCreate, createBook);
router.get('/my-uploads', protect, getMyUploads);

// Protected routes - Admin
router.patch('/:id', protect, adminOnly, uploadBookFiles, validateBookUpdate, updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);
router.post('/:id/review', protect, adminOnly, reviewBook);
router.get('/admin/all', protect, adminOnly, adminGetAllBooks);

module.exports = router;
