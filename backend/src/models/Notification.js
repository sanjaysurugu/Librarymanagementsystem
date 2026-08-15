const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['book_approved','book_rejected','request_approved','request_rejected',
           'request_completed','new_book','announcement','system','account_blocked','account_unblocked'],
    required: true,
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  isRead:  { type: Boolean, default: false },
  link:    { type: String, default: '' },
  relatedBook:    { type: mongoose.Schema.Types.ObjectId, ref: 'Book',        default: null },
  relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'BookRequest', default: null },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
