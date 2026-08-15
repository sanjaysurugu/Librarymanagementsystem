import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Navigation.css';

function Navigation() {
  const { user, token, logout } = useAuthStore();

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-name">Library</span>
        </Link>
        
        <div className="navbar-menu">
          <div className="nav-links">
            <Link to="/browse" className="nav-link">Browse Books</Link>
          </div>
          
          <div className="nav-auth">
            {token && user ? (
              <>
                <span className="user-info">
                  <span className="user-avatar">{user.name[0]?.toUpperCase()}</span>
                  <span className="user-name">{user.name}</span>
                </span>
                
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="nav-link admin-badge">
                    🛠️ Admin
                  </Link>
                )}
                {user.role === 'user' && (
                  <Link to="/user/dashboard" className="nav-link">Dashboard</Link>
                )}
                
                <button onClick={logout} className="btn-logout">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link btn-login">
                  Login
                </Link>
                <Link to="/register" className="nav-link btn-register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
