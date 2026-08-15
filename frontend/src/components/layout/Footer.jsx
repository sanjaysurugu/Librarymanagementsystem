import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>📚 Library Management</h3>
            <p>Discover, share, and manage your favorite books in one place.</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/browse">Browse Books</a></li>
              <li><a href="/user/uploads">My Uploads</a></li>
              <li><a href="/user/dashboard">Dashboard</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="#" className="social-link" title="Twitter">𝕏</a>
              <a href="#" className="social-link" title="GitHub">⚙️</a>
              <a href="#" className="social-link" title="LinkedIn">💼</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} Library Management System. All rights reserved.</p>
          <p>Crafted with ❤️ for book lovers worldwide</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
