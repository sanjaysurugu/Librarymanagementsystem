const User             = require('../models/User');
const { generateToken} = require('../utils/jwt');
const { hashToken }    = require('../utils/helpers');
const { sendEmail, emailTemplates } = require('../config/email');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user  = await User.create({ name, email, password });
    const vt    = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const url  = `${process.env.FRONTEND_URL}/verify-email?token=${vt}`;
    const tmpl = emailTemplates.verifyEmail(user.name, url);
    await sendEmail({ to: user.email, ...tmpl });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Registered! Check your email to verify.',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isEmailVerified: user.isEmailVerified },
    });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (user.isBlocked)
      return res.status(403).json({ success: false, message: 'Account blocked. Contact support.' });

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({
      success: true, message: 'Login successful', token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isEmailVerified: user.isEmailVerified },
    });
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

const verifyEmail = async (req, res, next) => {
  try {
    const hashed = hashToken(req.params.token);
    const user   = await User.findOne({ emailVerificationToken: hashed, emailVerificationExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.isEmailVerified          = true;
    user.emailVerificationToken   = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Email verified!' });
  } catch (err) { next(err); }
};

const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const rt  = user.generatePasswordResetToken();
      await user.save({ validateBeforeSave: false });
      const url  = `${process.env.FRONTEND_URL}/reset-password?token=${rt}`;
      const tmpl = emailTemplates.resetPassword(user.name, url);
      await sendEmail({ to: user.email, ...tmpl });
    }
    res.json({ success: true, message: 'If registered, a reset link has been sent.' });
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const hashed = hashToken(req.params.token);
    const user   = await User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.password           = req.body.password;
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successful', token: generateToken(user._id) });
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(req.body.currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed' });
  } catch (err) { next(err); }
};

const googleAuth = async (req, res, next) => {
  try {
    const { name, email, googleId, avatar } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      if (!user.googleId) { user.googleId = googleId; if (!user.avatar) user.avatar = avatar; await user.save({ validateBeforeSave: false }); }
    } else {
      user = await User.create({ name, email, googleId, avatar, isEmailVerified: true });
    }
    if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account blocked' });
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });
    const token = generateToken(user._id);
    res.json({
      success: true, message: 'Google auth successful', token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isEmailVerified: user.isEmailVerified },
    });
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe, verifyEmail, forgotPassword, resetPassword, changePassword, googleAuth };
