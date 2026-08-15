const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const { getUsers, getUserById, updateProfile, toggleBlockUser, deleteUser, changeUserRole, getDashboardStats, updatePreferences } = require('../controllers/userController');

const router = express.Router();

// User routes
router.patch('/profile', protect, uploadAvatar, updateProfile);
router.get('/dashboard/stats', protect, getDashboardStats);
router.patch('/preferences', protect, updatePreferences);

// Admin routes
router.get('/', protect, adminOnly, getUsers);
router.get('/:id', protect, adminOnly, getUserById);
router.patch('/:id/toggle-block', protect, adminOnly, toggleBlockUser);
router.delete('/:id', protect, adminOnly, deleteUser);
router.patch('/:id/role', protect, adminOnly, changeUserRole);

module.exports = router;
