const mongoose = require('mongoose');

const readingHistorySchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book:        { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  currentPage: { type: Number, default: 1 },
  totalPages:  { type: Number, default: 0 },
  progress:    { type: Number, default: 0, min: 0, max: 100 },
  zoomLevel:   { type: Number, default: 100 },
  lastReadAt:  { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

readingHistorySchema.index({ user: 1, book: 1 }, { unique: true });
readingHistorySchema.index({ user: 1, lastReadAt: -1 });

module.exports = mongoose.model('ReadingHistory', readingHistorySchema);
