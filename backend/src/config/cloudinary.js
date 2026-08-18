const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const hasCloudinaryConfig = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
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
  { name: 'bookFile', maxCount: 1 },
]);

const uploadAvatar = upload.single('avatar');

const getLocalUploadUrl = (filename) => {
  const baseUrl = process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl.replace(/\/$/, '')}/uploads/${filename}`;
};

const uploadToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    if (!hasCloudinaryConfig) {
      const extension = options.resource_type === 'raw' ? path.extname(options.public_id || 'upload.bin') || '.bin' : '.png';
      const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${extension}`;
      const filePath = path.join(uploadDir, filename);

      fs.writeFile(filePath, buffer, (err) => {
        if (err) return reject(err);
        const url = getLocalUploadUrl(filename);
        resolve({
          secure_url: url,
          url,
          public_id: filename,
        });
      });
      return;
    }

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

module.exports = { cloudinary: { uploader: { destroy: async () => {} } }, uploadFields, uploadAvatar, uploadToCloudinary, getMimeFileType };
