require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB().catch((err) => {
  console.warn('⚠️ MongoDB connection warning:', err.message);
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📚 Library API: http://localhost:${PORT}/api`);
  console.log(`🔥 Firebase status: http://localhost:${PORT}/api/firebase/status`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});
