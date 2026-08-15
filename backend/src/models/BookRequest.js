const mongoose = require('mongoose');

const bookRequestSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:      { type: String, required: true, trim: true, maxlength: 200 },
  author:     { type: String, trim: true, default: '' },
  reason:     { type: String, maxlength: 500, default: '' },
  status:     { type: String, enum: ['pending','approved','rejected','completed'], default: 'pending' },
  adminNote:  { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true });

bookRequestSchema.index({ user: 1, createdAt: -1 });
bookRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('BookRequest', bookRequestSchema);
