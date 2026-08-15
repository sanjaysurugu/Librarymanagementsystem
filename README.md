# Library Management System

A complete library management system with user authentication, book management, and admin dashboard.

## Features

- **User Authentication**: Register, login, email verification, password reset
- **Book Management**: Upload, browse, search books with filters
- **Categories**: Organize books by categories
- **Admin Dashboard**: Review pending books, manage users, manage categories
- **User Dashboard**: Track uploads and downloads
- **File Management**: Support for PDF, EPUB, DOC, DOCX files via Cloudinary

## Project Structure

```
backend/
  ├── src/
  │   ├── config/        # Database and external service configs
  │   ├── controllers/   # Request handlers
  │   ├── middleware/    # Express middleware
  │   ├── models/        # MongoDB schemas
  │   ├── routes/        # API routes
  │   ├── utils/         # Utility functions
  │   └── validators/    # Input validation
  ├── server.js          # Entry point
  └── package.json

frontend/
  ├── src/
  │   ├── api/           # API client functions
  │   ├── components/    # React components
  │   ├── pages/         # Page components
  │   ├── store/         # Zustand stores
  │   ├── App.jsx        # Main app component
  │   └── main.jsx       # Entry point
  └── package.json
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   - MongoDB URI
   - JWT Secret
   - Cloudinary credentials
   - Email configuration

5. Start the server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```bash
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/google-auth` - Google authentication

### Books
- `GET /api/books` - Get all approved books
- `GET /api/books/:id` - Get book details
- `POST /api/books` - Upload new book (protected)
- `PATCH /api/books/:id` - Update book (admin/owner)
- `DELETE /api/books/:id` - Delete book (admin/owner)
- `GET /api/books/pending` - Get pending books (admin)
- `POST /api/books/:id/review` - Review book (admin)
- `GET /api/books/my-uploads` - Get user's uploads (protected)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PATCH /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)
- `GET /api/categories/admin/all` - Get all categories with details (admin)

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user details (admin)
- `PATCH /api/users/profile` - Update profile (protected)
- `PATCH /api/users/preferences` - Update preferences (protected)
- `GET /api/users/dashboard/stats` - Get user stats (protected)
- `PATCH /api/users/:id/toggle-block` - Block/unblock user (admin)
- `PATCH /api/users/:id/role` - Change user role (admin)
- `DELETE /api/users/:id` - Delete user (admin)

## Technologies Used

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database
- **JWT** - Authentication
- **Cloudinary** - File storage
- **Nodemailer** - Email service
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin requests

### Frontend
- **React 19** - UI library
- **React Router** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Vite** - Build tool

## Environment Variables

### Backend (.env)
- `NODE_ENV` - Development/production mode
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRY` - JWT expiration time
- `FRONTEND_URL` - Frontend URL for CORS
- `CLOUDINARY_*` - Cloudinary API credentials
- `SMTP_*` - Email configuration

### Frontend (.env.local)
- `VITE_API_URL` - Backend API URL

## User Roles

- **User**: Can upload books, browse, download, create reviews
- **Admin**: Can approve/reject books, manage users, manage categories, view dashboard

## License

MIT License

## Support

For issues and feature requests, please create an issue in the repository.
