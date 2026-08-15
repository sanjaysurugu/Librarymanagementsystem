const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

// In-memory storage for Cloudinary upload (we'll upload to Cloudinary directly)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow images for cover
  if (file.fieldname === 'coverImage') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for cover'), false);
    }
  }
  // Allow documents for book files
  else if (file.fieldname === 'bookFile') {
    const allowedMimetypes = [
      'application/pdf',
      'application/epub+zip',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimetypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, EPUB, DOC, and DOCX files are allowed'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

const uploadBookFiles = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'bookFile', maxCount: 1 }
]);

const uploadAvatar = upload.single('avatar');

module.exports = { upload, uploadBookFiles, uploadAvatar };
