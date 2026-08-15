const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memoryStorage; upload to Cloudinary manually in controllers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'coverImage') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Cover must be an image file'));
      }
    }
    if (file.fieldname === 'bookFile') {
      const allowed = [
        'application/pdf',
        'application/epub+zip',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowed.includes(file.mimetype)) {
        return cb(new Error('Book file must be PDF, EPUB, DOC, or DOCX'));
      }
    }
    if (file.fieldname === 'avatar') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Avatar must be an image file'));
      }
    }
    cb(null, true);
  },
});

const uploadFields = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'bookFile',   maxCount: 1 },
]);

const uploadAvatar = upload.single('avatar');

const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    stream.end(buffer);
  });

const getMimeFileType = (mimetype) => {
  const map = {
    'application/pdf': 'pdf',
    'application/epub+zip': 'epub',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  };
  return map[mimetype] || 'pdf';
};

module.exports = { cloudinary, uploadFields, uploadAvatar, uploadToCloudinary, getMimeFileType };
