const express = require('express');
const { register, login, getMe, verifyEmail, forgotPassword, resetPassword, changePassword, googleAuth } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin, validateResetPassword } = require('../validators/authValidators');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', validateResetPassword, resetPassword);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);
router.post('/google-auth', googleAuth);

module.exports = router;
