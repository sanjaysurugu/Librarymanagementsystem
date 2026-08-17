const jwt = require('jsonwebtoken');
const { findUserById, withoutPassword } = require('../config/firestore');

const loadUser = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await findUserById(decoded.id);
  return user ? withoutPassword(user) : null;
};

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  try {
    const user = await loadUser(auth.split(' ')[1]);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account blocked' });
    req.user = user;
    next();
  } catch (err) {
    next(err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' ? Object.assign(err, { statusCode: 401 }) : err);
  }
};

const adminOnly = (req, res, next) => req.user?.role === 'admin'
  ? next()
  : res.status(403).json({ success: false, message: 'Admins only' });

const optionalAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) { req.user = null; return next(); }
  try { req.user = await loadUser(auth.split(' ')[1]); } catch { req.user = null; }
  next();
};

module.exports = { protect, adminOnly, optionalAuth };
