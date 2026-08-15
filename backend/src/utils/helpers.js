const crypto = require('crypto');

const getPagination = (query) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, parseInt(query.limit) || 12);
  return { page, limit, skip: (page - 1) * limit };
};

const paginationResponse = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages:  Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0] ||
  req.connection?.remoteAddress || '';

const getMimeFileType = (mimetype) => {
  const map = {
    'application/pdf': 'pdf',
    'application/epub+zip': 'epub',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  };
  return map[mimetype] || 'pdf';
};

module.exports = { getPagination, paginationResponse, hashToken, getClientIp, getMimeFileType };
