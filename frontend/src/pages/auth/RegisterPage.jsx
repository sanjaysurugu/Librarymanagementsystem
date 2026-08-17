import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { isApiConfigured } from '../../api/apiConfig';
import './AuthPages.css';

function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!isApiConfigured) {
      setError('The registration service has not been configured for this deployment.');
      return;
    }
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      const apiError = err.response?.data;
      const validationMessage = apiError?.errors?.map(({ msg }) => msg).join(', ');
      setError(
        validationMessage
        || apiError?.message
        || (err.response
          ? 'The registration service returned an unexpected response. Please contact support.'
          : err.request
            ? 'Unable to reach the server. Please try again in a moment.'
            : 'Registration failed. Please try again.')
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>✨ Join Us</h1>
            <p>Create your library account</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

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

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <Link to="/login" className="btn btn-secondary btn-block">
            Sign In
          </Link>
        </div>

        <div className="auth-illustration">
          <div className="illustration-content">
            <div className="illustration-icon">📚</div>
            <h2>Your Library Awaits</h2>
            <p>Join thousands of book lovers and start your reading journey today.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
