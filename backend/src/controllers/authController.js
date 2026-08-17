const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateToken } = require('../utils/jwt');
const { hashToken } = require('../utils/helpers');
const { sendEmail, emailTemplates } = require('../config/email');
const { getFirestore, findUserByEmail, findUserById, withoutPassword } = require('../config/firestore');

const publicUser = (user) => {
  const { _id, name, email, role, avatar, isEmailVerified } = withoutPassword(user);
  return { _id, name, email, role, avatar, isEmailVerified };
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    if (await findUserByEmail(normalizedEmail)) return res.status(400).json({ success: false, message: 'Email already registered' });

    const id = crypto.randomUUID();
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = {
      _id: id, name, email: normalizedEmail, password: await bcrypt.hash(password, 12),
      role: 'user', avatar: '', bio: '', phone: '', isBlocked: false, isEmailVerified: false,
      emailVerificationToken: hashToken(verificationToken),
      emailVerificationExpires: Date.now() + Number(process.env.VERIFY_TOKEN_EXPIRE || 86400000),
      totalDownloads: 0, totalUploads: 0,
      preferences: { emailNotifications: true, theme: 'light' }, createdAt: new Date(), updatedAt: new Date(),
    };
    await getFirestore().collection('users').doc(id).set(user);
    const url = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({ to: user.email, ...emailTemplates.verifyEmail(user.name, url) });
    res.status(201).json({ success: true, message: 'Registered successfully.', token: generateToken(id), user: publicUser(user) });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const user = await findUserByEmail(req.body.email.toLowerCase());
    if (!user || !user.password || !(await bcrypt.compare(req.body.password, user.password))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account blocked. Contact support.' });
    await getFirestore().collection('users').doc(user._id).update({ lastLogin: new Date(), updatedAt: new Date() });
    res.json({ success: true, message: 'Login successful', token: generateToken(user._id), user: publicUser(user) });
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await findUserById(req.user._id);
    res.json({ success: true, user: withoutPassword(user) });
  } catch (err) { next(err); }
};

const verifyEmail = async (req, res, next) => {
  try {
    const result = await getFirestore().collection('users').where('emailVerificationToken', '==', hashToken(req.params.token)).limit(1).get();
    if (result.empty || result.docs[0].data().emailVerificationExpires < Date.now()) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    await result.docs[0].ref.update({ isEmailVerified: true, emailVerificationToken: null, emailVerificationExpires: null, updatedAt: new Date() });
    res.json({ success: true, message: 'Email verified!' });
  } catch (err) { next(err); }
};

const forgotPassword = async (req, res, next) => {
  try {
    const user = await findUserByEmail(req.body.email.toLowerCase());
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await getFirestore().collection('users').doc(user._id).update({ passwordResetToken: hashToken(token), passwordResetExpires: Date.now() + Number(process.env.RESET_TOKEN_EXPIRE || 3600000) });
      await sendEmail({ to: user.email, ...emailTemplates.resetPassword(user.name, `${process.env.FRONTEND_URL}/reset-password?token=${token}`) });
    }
    res.json({ success: true, message: 'If registered, a reset link has been sent.' });
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const result = await getFirestore().collection('users').where('passwordResetToken', '==', hashToken(req.params.token)).limit(1).get();
    if (result.empty || result.docs[0].data().passwordResetExpires < Date.now()) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    const snapshot = result.docs[0];
    await snapshot.ref.update({ password: await bcrypt.hash(req.body.password, 12), passwordResetToken: null, passwordResetExpires: null, updatedAt: new Date() });
    res.json({ success: true, message: 'Password reset successful', token: generateToken(snapshot.id) });
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const user = await findUserById(req.user._id);
    if (!user || !(await bcrypt.compare(req.body.currentPassword, user.password))) return res.status(400).json({ success: false, message: 'Current password incorrect' });
    await getFirestore().collection('users').doc(user._id).update({ password: await bcrypt.hash(req.body.newPassword, 12), updatedAt: new Date() });
    res.json({ success: true, message: 'Password changed' });
  } catch (err) { next(err); }
};

const googleAuth = async (req, res) => res.status(501).json({ success: false, message: 'Google sign-in is not configured for the Firestore migration.' });

module.exports = { register, login, getMe, verifyEmail, forgotPassword, resetPassword, changePassword, googleAuth };
