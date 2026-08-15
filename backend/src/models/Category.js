const mongoose = require('mongoose');
const slugify  = require('slugify');

const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true, maxlength: 50 },
  slug:        { type: String, unique: true },
  description: { type: String, maxlength: 300, default: '' },
  icon:        { type: String, default: '📚' },
  color:       { type: String, default: '#4F46E5' },
  image:       { type: String, default: '' },
  bookCount:   { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
