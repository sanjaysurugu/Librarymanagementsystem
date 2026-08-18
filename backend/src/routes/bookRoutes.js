const express = require('express');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { uploadBookFiles } = require('../middleware/upload');
const { getBooks, getBook, createBook, updateBook, deleteBook, reviewBook, downloadBook, getPendingBooks, getMyUploads, adminGetAllBooks } = require('../controllers/bookController');
const { validateBookCreate, validateBookUpdate } = require('../validators/bookValidators');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getBooks);

// Protected routes - User (must be registered before '/:id')
router.get('/my-uploads', protect, getMyUploads);
router.post('/', protect, uploadBookFiles, validateBookCreate, createBook);

// Protected routes - Admin
router.get('/pending', protect, adminOnly, getPendingBooks);
router.get('/admin/all', protect, adminOnly, adminGetAllBooks);

// Public routes with ':id' (kept last so named routes are not shadowed)
router.get('/:id/download', optionalAuth, downloadBook);
router.get('/:id', optionalAuth, getBook);
router.patch('/:id', protect, adminOnly, uploadBookFiles, validateBookUpdate, updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);
router.post('/:id/review', protect, adminOnly, reviewBook);

module.exports = router;
