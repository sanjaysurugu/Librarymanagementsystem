const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"LibraryMS" <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email error:', err.message);
    return { success: false };
  }
};

const emailTemplates = {
  verifyEmail: (name, url) => ({
    subject: 'Verify Your Email – LibraryMS',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#4f46e5">📚 LibraryMS</h2>
      <h3>Hello ${name},</h3>
      <p>Please verify your email by clicking below:</p>
      <a href="${url}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">Verify Email</a>
      <p style="color:#9ca3af;margin-top:20px;font-size:13px">Link expires in 24 hours.</p>
    </div>`,
  }),
  resetPassword: (name, url) => ({
    subject: 'Reset Your Password – LibraryMS',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#4f46e5">📚 LibraryMS</h2>
      <h3>Hello ${name},</h3>
      <p>Click below to reset your password:</p>
      <a href="${url}" style="display:inline-block;padding:12px 28px;background:#ef4444;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">Reset Password</a>
      <p style="color:#9ca3af;margin-top:20px;font-size:13px">Link expires in 1 hour.</p>
    </div>`,
  }),
  bookApproved: (name, title) => ({
    subject: 'Your Book Was Approved – LibraryMS',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#4f46e5">📚 LibraryMS</h2>
      <h3 style="color:#10b981">✅ Book Approved!</h3>
      <p>Hi ${name}, your book "<strong>${title}</strong>" is now live in the library.</p>
    </div>`,
  }),
  bookRejected: (name, title, reason) => ({
    subject: 'Book Upload Update – LibraryMS',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#4f46e5">📚 LibraryMS</h2>
      <h3 style="color:#ef4444">Book Not Approved</h3>
      <p>Hi ${name}, your book "<strong>${title}</strong>" was not approved.${reason ? `<br><strong>Reason:</strong> ${reason}` : ''}</p>
    </div>`,
  }),
};

module.exports = { sendEmail, emailTemplates };
