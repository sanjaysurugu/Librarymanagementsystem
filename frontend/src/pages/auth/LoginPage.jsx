import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { isApiConfigured } from '../../api/apiConfig';
import './AuthPages.css';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isApiConfigured) {
      setError('The login service has not been configured for this deployment.');
      return;
    }
    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      const apiError = err.response?.data;
      const validationMessage = apiError?.errors?.map(({ msg }) => msg).join(', ');
      setError(
        validationMessage
        || apiError?.message
        || (err.response
          ? 'The login service returned an unexpected response. Please contact support.'
          : err.request
          ? 'Unable to reach the server. Please try again in a moment.'
          : 'Login failed. Please try again.')
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>👋 Welcome Back</h1>
            <p>Sign in to your account</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-actions">
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>Don't have an account?</span>
          </div>

          <Link to="/register" className="btn btn-secondary btn-block">
            Create Account
          </Link>
        </div>

        <div className="auth-illustration">
          <div className="illustration-content">
            <div className="illustration-icon">📖</div>
            <h2>Join Our Library</h2>
            <p>Discover thousands of books and share your passion for reading.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
