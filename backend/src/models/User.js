const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 6, select: false },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar:   { type: String, default: '' },
  bio:      { type: String, maxlength: 300, default: '' },
  phone:    { type: String, default: '' },
  isEmailVerified: { type: Boolean, default: false },
  isBlocked:       { type: Boolean, default: false },
  googleId:        { type: String, default: '' },
  emailVerificationToken:   String,
  emailVerificationExpires: Date,
  passwordResetToken:       String,
  passwordResetExpires:     Date,
  lastLogin:      { type: Date, default: null },
  totalDownloads: { type: Number, default: 0 },
  totalUploads:   { type: Number, default: 0 },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken   = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + Number(process.env.VERIFY_TOKEN_EXPIRE || 86400000);
  return token;
};

userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken   = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + Number(process.env.RESET_TOKEN_EXPIRE || 3600000);
  return token;
};

module.exports = mongoose.model('User', userSchema);
