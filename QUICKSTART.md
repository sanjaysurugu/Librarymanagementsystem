# Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for file uploads)
- Email service (Gmail SMTP or other)

## Backend Quick Start

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Edit .env with your credentials:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: Generate a random secret (e.g., use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# - CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET
# - SMTP email configuration
# - FRONTEND_URL: http://localhost:5173

# 5. Start development server
npm run dev

# Server runs at http://localhost:5000
```

## Frontend Quick Start

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env.local file
echo "VITE_API_URL=http://localhost:5000/api" > .env.local

# 4. Start development server
npm run dev

# Frontend runs at http://localhost:5173
```

## Testing the Application

### Default Test Flow

1. **Register** - Go to `/register` and create a new account
2. **Login** - Login at `/login`
3. **Browse Books** - Visit `/browse` to see books
4. **Upload Book** - Login as user and go to `/user/upload` to upload a book
5. **Admin Panel** - Login as admin (create admin user in database) to review books

### Admin Setup (Database)

To create an admin user, update a user in MongoDB:

```javascript
// In MongoDB, update a user:
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Useful Commands

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter

## Environment Variables Reference

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/library-db
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@library.com
SMTP_FROM_NAME=Library Management
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
```

## Common Issues & Solutions

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in .env
- For MongoDB Atlas, whitelist your IP

### Cloudinary Upload Failed
- Verify Cloudinary credentials in .env
- Check file size limits
- Ensure proper folder structure in Cloudinary

### CORS Error
- Ensure FRONTEND_URL matches your frontend URL
- Backend must have CORS enabled
- Check browser console for specific errors

### Email Not Sending
- Verify SMTP credentials
- For Gmail, use App Password (not regular password)
- Enable Less Secure App Access if needed
- Check email logs in MongoDB

### Port Already in Use
```bash
# Backend (change PORT in .env)
PORT=5001 npm run dev

# Frontend (Vite will prompt for alternative)
npm run dev -- --port 5174
```

## File Upload Guide

### Supported File Types
- **Book Files**: PDF, EPUB, DOC, DOCX (max 100MB)
- **Cover Images**: JPG, PNG, WebP (max 10MB)

### Uploading via API
Use `multipart/form-data`:
```javascript
const formData = new FormData();
formData.append('title', 'Book Title');
formData.append('author', 'Author Name');
formData.append('description', 'Book description');
formData.append('category', 'categoryId');
formData.append('coverImage', coverFile);
formData.append('bookFile', bookFile);

await axios.post('/api/books', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

## API Testing

Use tools like Postman or Thunder Client to test API endpoints.

Example:
```bash
# Get all books
curl http://localhost:5000/api/books

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get current user (requires token)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema Overview

### User
- email, name, password
- avatar, bio, phone
- role (user/admin)
- isBlocked, isEmailVerified
- preferences (emailNotifications, theme)

### Book
- title, author, isbn, publisher
- description, category
- coverImage, bookFile
- status (pending/approved/rejected)
- uploadedBy, reviewedBy
- ratings, downloads

### Category
- name, description
- bookCount, createdBy

### Other Models
- BookRequest, Favorite, Review, Download, ReadingHistory, Notification

## Deployment

### Backend (Heroku Example)
```bash
git push heroku main
```

### Frontend (Vercel Example)
```bash
npm run build
# Deploy dist/ folder to Vercel
```

## Support & Resources

- MongoDB Docs: https://docs.mongodb.com
- Express Docs: https://expressjs.com
- React Docs: https://react.dev
- Cloudinary Docs: https://cloudinary.com/documentation
- Zustand Docs: https://github.com/pmndrs/zustand

---

**Need help?** Check the README.md and COMPLETION.md files for more details.
