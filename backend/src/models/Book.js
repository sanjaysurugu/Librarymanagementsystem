const mongoose = require('mongoose');
const slugify  = require('slugify');

const bookSchema = new mongoose.Schema({
  title:         { type: String, required: true, trim: true, maxlength: 200 },
  slug:          { type: String, unique: true },
  author:        { type: String, required: true, trim: true, maxlength: 100 },
  isbn:          { type: String, trim: true, default: '' },
  publisher:     { type: String, trim: true, default: '' },
  publishedYear: { type: Number },
  category:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  language:      { type: String, default: 'English', trim: true },
  description:   { type: String, required: true, maxlength: 2000 },
  coverImage: {
    url:      { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  bookFile: {
    url:      { type: String, default: '' },
    publicId: { type: String, default: '' },
    fileType: { type: String, enum: ['pdf','epub','doc','docx'], default: 'pdf' },
    fileSize: { type: Number, default: 0 },
  },
  tags:     [{ type: String, trim: true }],
  pages:    { type: Number, default: 0 },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:   { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
  reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt:  { type: Date, default: null },
  downloadCount:  { type: Number, default: 0 },
  viewCount:      { type: Number, default: 0 },
  averageRating:  { type: Number, default: 0, min: 0, max: 5 },
  totalRatings:   { type: Number, default: 0 },
  isFeatured:     { type: Boolean, default: false },
}, { timestamps: true });

bookSchema.pre('save', async function () {
  if (!this.isModified('title')) return;
  let base  = slugify(this.title, { lower: true, strict: true });
  let slug  = base;
  let count = 1;
  while (await mongoose.model('Book').findOne({ slug, _id: { $ne: this._id } })) {
    slug = `${base}-${count++}`;
  }
  this.slug = slug;
});

bookSchema.index({ title: 'text', author: 'text', description: 'text', tags: 'text' });
bookSchema.index({ category: 1, status: 1 });
bookSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Book', bookSchema);
