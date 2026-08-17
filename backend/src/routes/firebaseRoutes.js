const express = require('express');
const router = express.Router();
const { isFirebaseInitialized, admin } = require('../config/firebase');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');

/**
 * @route   GET /api/firebase/status
 * @desc    Check Firebase Admin SDK initialization status
 * @access  Public
 */
router.get('/status', (req, res) => {
  const initialized = isFirebaseInitialized();
  res.json({
    success: true,
    firebaseInitialized: initialized,
    message: initialized
      ? '🔥 Firebase Admin SDK is initialized and ready.'
      : '⚠️ Firebase Admin SDK is not initialized. Add Firebase credentials to backend/.env',
    configMethods: {
      option1: 'FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json',
      option2: 'FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}',
      option3: 'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY',
    },
    timestamp: new Date(),
  });
});

/**
 * @route   GET /api/firebase/verify-token
 * @desc    Test endpoint to verify Firebase ID Token
 * @access  Protected (Firebase Auth)
 */
router.get('/verify-token', verifyFirebaseToken, (req, res) => {
  res.json({
    success: true,
    message: 'Firebase token verified successfully!',
    firebaseUser: {
      uid: req.firebaseUser.uid,
      email: req.firebaseUser.email,
      emailVerified: req.firebaseUser.email_verified,
      name: req.firebaseUser.name || null,
      picture: req.firebaseUser.picture || null,
    },
    syncedMongoUser: req.user ? {
      id: req.user._id,
      role: req.user.role,
      name: req.user.name,
    } : null,
  });
});

module.exports = router;
