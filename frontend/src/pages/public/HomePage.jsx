import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                <span className="title-sm">Welcome to</span>
                Library
                <span className="gradient-text">Management System</span>
              </h1>
              <p className="hero-subtitle">
                Discover thousands of books from authors around the world. Upload, share,
                and manage your favorite collections effortlessly.
              </p>
              <div className="hero-buttons">
                <Link to="/browse" className="btn btn-primary btn-large">
                  📖 Browse Books
                </Link>
                <Link to="/register" className="btn btn-secondary btn-large">
                  ✨ Get Started
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <div className="book-stack">
                <div className="book book-1"></div>
                <div className="book book-2"></div>
                <div className="book book-3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Our Library?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Smart Search</h3>
              <p>Find any book instantly with our powerful search and filtering capabilities.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">☁️</div>
              <h3>Cloud Storage</h3>
              <p>Store your books securely in the cloud with unlimited access from anywhere.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Community</h3>
              <p>Join thousands of book lovers and share your favorite reads with the community.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Ratings & Reviews</h3>
              <p>Share your thoughts and discover what others think about their favorite books.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Responsive Design</h3>
              <p>Access your library from any device - desktop, tablet, or mobile phone.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Fast Performance</h3>
              <p>Experience lightning-fast loading times and smooth navigation throughout.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Books Available</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">5K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Downloads</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">4.9★</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container text-center">
          <h2>Ready to Start Exploring?</h2>
          <p>Join our community of book enthusiasts and discover your next favorite read.</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Create Your Account Today
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
