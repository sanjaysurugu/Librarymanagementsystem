import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import './App.css';

// Layouts
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Public Pages
import HomePage from './pages/public/HomePage';
import BrowseBooksPage from './pages/public/BrowseBooksPage';
import BookDetailPage from './pages/public/BookDetailPage';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import MyUploads from './pages/user/MyUploads';
import UploadBook from './pages/user/UploadBook';
import UserProfile from './pages/user/UserProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingBooks from './pages/admin/PendingBooks';
import AllBooks from './pages/admin/AllBooks';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCategories from './pages/admin/ManageCategories';

function ProtectedRoute({ children, requiredRole }) {
  const { user, token } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/" replace />;

  return children;
}

function App() {
  const { getMe, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      getMe().catch(() => {});
    }
  }, [token]);

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Main Layout */}
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowseBooksPage />} />
          <Route path="/book/:id" element={<BookDetailPage />} />

          {/* User Routes */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/uploads"
            element={
              <ProtectedRoute>
                <MyUploads />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/upload"
            element={
              <ProtectedRoute>
                <UploadBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pending-books"
            element={
              <ProtectedRoute requiredRole="admin">
                <PendingBooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/all-books"
            element={
              <ProtectedRoute requiredRole="admin">
                <AllBooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageCategories />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
