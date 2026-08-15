const { body, validationResult } = require('express-validator');

const validateBookCreate = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('category').notEmpty().withMessage('Category is required').isMongoId().withMessage('Invalid category'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('language').optional().trim(),
  body('pages').optional().isInt({ min: 0 }).withMessage('Pages must be a positive number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

const validateBookUpdate = [
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('author').optional().trim().notEmpty().withMessage('Author cannot be empty'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('language').optional().trim(),
  body('pages').optional().isInt({ min: 0 }).withMessage('Pages must be a positive number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

const validateCategory = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('description').optional().trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateBookCreate, validateBookUpdate, validateCategory };
