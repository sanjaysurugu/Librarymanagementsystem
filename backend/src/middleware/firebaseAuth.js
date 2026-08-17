const { auth, isFirebaseInitialized } = require('../config/firebase');
const User = require('../models/User');

/**
 * Express middleware to verify Firebase ID tokens.
 * Header format: Authorization: Bearer <Firebase_ID_Token>
 */
const verifyFirebaseToken = async (req, res, next) => {
  if (!isFirebaseInitialized()) {
    return res.status(503).json({
      success: false,
      message: 'Firebase Admin SDK is not configured on the server.',
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.',
    });
  }

  const idToken = authHeader.split('Bearer ')[1].trim();

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.firebaseUser = decodedToken;

    // Sync with local MongoDB User model if email exists
    if (decodedToken.email) {
      const user = await User.findOne({ email: decodedToken.email.toLowerCase() }).select('-password');
      if (user) {
        if (user.isBlocked) {
          return res.status(403).json({ success: false, message: 'Account blocked' });
        }
        req.user = user;
      }
    }

    next();
  } catch (error) {
    console.error('Firebase token verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired Firebase ID token.',
      error: error.message,
    });
  }
};

/**
 * Optional Firebase Auth middleware.
 * Attaches req.firebaseUser if token is present and valid, but does not block request if absent.
 */
const optionalFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!isFirebaseInitialized() || !authHeader || !authHeader.startsWith('Bearer ')) {
    req.firebaseUser = null;
    return next();
  }

  const idToken = authHeader.split('Bearer ')[1].trim();
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.firebaseUser = decodedToken;
    if (decodedToken.email) {
      const user = await User.findOne({ email: decodedToken.email.toLowerCase() }).select('-password');
      if (user && !user.isBlocked) {
        req.user = user;
      }
    }
  } catch {
    req.firebaseUser = null;
  }
  next();
};

module.exports = {
  verifyFirebaseToken,
  optionalFirebaseToken,
};
