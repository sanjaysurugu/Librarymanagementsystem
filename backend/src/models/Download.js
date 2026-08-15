const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  book:      { type: mongoose.Schema.Types.ObjectId, ref: 'Book',  required: true },
  fileType:  { type: String, enum: ['pdf','epub','doc','docx'], default: 'pdf' },
  ipAddress: { type: String, default: '' },
}, { timestamps: true });

downloadSchema.index({ user: 1, createdAt: -1 });
downloadSchema.index({ book: 1, createdAt: -1 });

module.exports = mongoose.model('Download', downloadSchema);
