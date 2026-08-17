require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let isInitialized = false;
let auth = null;
let db = null;
let storage = null;

function getCert(serviceAccountObj) {
  if (typeof admin.cert === 'function') {
    return admin.cert(serviceAccountObj);
  }
  if (admin.credential && typeof admin.credential.cert === 'function') {
    return admin.credential.cert(serviceAccountObj);
  }
  return admin.credential?.cert ? admin.credential.cert(serviceAccountObj) : admin.cert(serviceAccountObj);
}

function getAppDefault() {
  if (typeof admin.applicationDefault === 'function') {
    return admin.applicationDefault();
  }
  if (admin.credential && typeof admin.credential.applicationDefault === 'function') {
    return admin.credential.applicationDefault();
  }
  return null;
}

function initFirebase() {
  if (admin && admin.apps && admin.apps.length > 0) {
    isInitialized = true;
    auth = admin.auth ? admin.auth() : null;
    db = admin.firestore ? admin.firestore() : null;
    storage = admin.storage ? admin.storage() : null;
    return;
  }

  try {
    let credential = null;

    // 1. Check for Service Account File Path
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
    if (serviceAccountPath) {
      const resolvedPath = path.isAbsolute(serviceAccountPath)
        ? serviceAccountPath
        : path.join(process.cwd(), serviceAccountPath);

      if (fs.existsSync(resolvedPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
        credential = getCert(serviceAccount);
        console.log(`🔥 Firebase initialized using service account file at: ${resolvedPath}`);
      } else {
        console.warn(`⚠️ Firebase service account file not found at: ${resolvedPath}`);
      }
    }

    // 2. Check for Service Account JSON string in Env
    if (!credential) {
      const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT;
      if (jsonEnv) {
        let serviceAccount;
        try {
          const rawString = jsonEnv.trim().startsWith('{')
            ? jsonEnv
            : Buffer.from(jsonEnv, 'base64').toString('utf8');
          serviceAccount = JSON.parse(rawString);
          credential = getCert(serviceAccount);
          console.log('🔥 Firebase initialized using FIREBASE_SERVICE_ACCOUNT_JSON env variable');
        } catch (jsonErr) {
          console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', jsonErr.message);
        }
      }
    }

    // 3. Check for Individual Credentials in Env
    if (!credential && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      credential = getCert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      });
      console.log('🔥 Firebase initialized using individual Firebase environment variables');
    }

    // 4. Try Default Application Credentials
    if (!credential) {
      try {
        credential = getAppDefault();
        if (credential) {
          console.log('🔥 Firebase attempting initialization with applicationDefault()');
        }
      } catch {
        // Fallback
      }
    }

    if (credential) {
      admin.initializeApp({
        credential,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
        databaseURL: process.env.FIREBASE_DATABASE_URL || undefined,
      });

      isInitialized = true;
      auth = admin.auth ? admin.auth() : null;
      db = admin.firestore ? admin.firestore() : null;
      storage = admin.storage ? admin.storage() : null;
    } else {
      console.warn('⚠️ Firebase Admin SDK is NOT initialized. Please set FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_SERVICE_ACCOUNT_JSON, or individual Firebase env variables in .env');
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);
    isInitialized = false;
  }
}

// Auto-initialize on module import
initFirebase();

module.exports = {
  admin,
  get auth() { return auth || (isInitialized && admin.auth ? admin.auth() : null); },
  get db() { return db || (isInitialized && admin.firestore ? admin.firestore() : null); },
  get storage() { return storage || (isInitialized && admin.storage ? admin.storage() : null); },
  isFirebaseInitialized: () => isInitialized,
  reinitializeFirebase: initFirebase,
};
