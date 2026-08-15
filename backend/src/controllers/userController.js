const User         = require('../models/User');
const Book         = require('../models/Book');
const Download     = require('../models/Download');
const Favorite     = require('../models/Favorite');
const Notification = require('../models/Notification');
const { getPagination, paginationResponse } = require('../utils/helpers');
const { cloudinary, uploadToCloudinary }    = require('../config/cloudinary');

const getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.search) filter.$or = [{ name: { $regex: req.query.search, $options: 'i' } }, { email: { $regex: req.query.search, $options: 'i' } }];
    if (req.query.role)   filter.role = req.query.role;
    if (req.query.status === 'blocked') filter.isBlocked = true;
    if (req.query.status === 'active')  filter.isBlocked = false;
    const [users, total] = await Promise.all([User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit), User.countDocuments(filter)]);
    res.json({ success: true, users, pagination: paginationResponse(total, page, limit) });
  } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const [uploadedBooks, downloads] = await Promise.all([Book.countDocuments({ uploader: user._id }), Download.countDocuments({ user: user._id })]);
    res.json({ success: true, user, stats: { uploadedBooks, downloads } });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.file) {
      const r = await uploadToCloudinary(req.file.buffer, { folder: 'library/avatars', resource_type: 'image', transformation: [{ width: 200, height: 200, crop: 'fill' }] });
      user.avatar = r.secure_url;
    }
    const fields = ['name','bio','phone'];
    fields.forEach(k => { if (req.body[k] !== undefined) user[k] = req.body[k]; });
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Profile updated', user });
  } catch (err) { next(err); }
};

const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot block admin' });
    user.isBlocked = !user.isBlocked;
    await user.save({ validateBeforeSave: false });
    await Notification.create({ recipient: user._id, type: user.isBlocked ? 'account_blocked' : 'account_unblocked', title: user.isBlocked ? 'Account Blocked' : 'Account Restored', message: user.isBlocked ? 'Your account has been blocked. Contact support.' : 'Your account has been restored.' });
    res.json({ success: true, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, user });
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin' });
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};

const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user','admin'].includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Role updated', user });
  } catch (err) { next(err); }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const uid = req.user._id;
    const [totalDownloads, totalUploads, totalFavorites, recentDownloads, recentUploads] = await Promise.all([
      Download.countDocuments({ user: uid }),
      Book.countDocuments({ uploader: uid }),
      Favorite.countDocuments({ user: uid }),
      Download.find({ user: uid }).populate({ path: 'book', select: 'title author coverImage category', populate: { path: 'category', select: 'name' } }).sort({ createdAt: -1 }).limit(5),
      Book.find({ uploader: uid }).populate('category','name').sort({ createdAt: -1 }).limit(5),
    ]);
    res.json({ success: true, stats: { totalDownloads, totalUploads, totalFavorites }, recentDownloads, recentUploads });
  } catch (err) { next(err); }
};

const updatePreferences = async (req, res, next) => {
  try {
    const update = {};
    if (req.body.emailNotifications !== undefined) update['preferences.emailNotifications'] = req.body.emailNotifications;
    if (req.body.theme) update['preferences.theme'] = req.body.theme;
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
    res.json({ success: true, message: 'Preferences updated', user });
  } catch (err) { next(err); }
};

module.exports = { getUsers, getUserById, updateProfile, toggleBlockUser, deleteUser, changeUserRole, getDashboardStats, updatePreferences };
