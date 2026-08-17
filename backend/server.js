require('dotenv').config();
const app = require('./src/app');
const { isFirebaseInitialized, db } = require('./src/config/firebase');

const PORT = process.env.PORT || 5000;

if (!isFirebaseInitialized() || !db) {
  console.error('Server startup failed: Firebase Firestore is not configured.');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
  process.exit(1);
});
