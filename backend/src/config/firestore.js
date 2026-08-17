const { db, isFirebaseInitialized } = require('./firebase');

const getFirestore = () => {
  if (!isFirebaseInitialized() || !db) {
    const error = new Error('Firebase Firestore is not configured');
    error.statusCode = 503;
    throw error;
  }
  return db;
};

const toData = (snapshot) => ({ _id: snapshot.id, ...snapshot.data() });

const findUserByEmail = async (email) => {
  const result = await getFirestore().collection('users')
    .where('email', '==', email.toLowerCase()).limit(1).get();
  return result.empty ? null : toData(result.docs[0]);
};

const findUserById = async (id) => {
  const snapshot = await getFirestore().collection('users').doc(id).get();
  return snapshot.exists ? toData(snapshot) : null;
};

const withoutPassword = ({ password, ...user }) => user;

module.exports = { getFirestore, toData, findUserByEmail, findUserById, withoutPassword };
