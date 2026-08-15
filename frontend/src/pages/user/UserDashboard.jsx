import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './UserDashboard.css';

function UserDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="user-dashboard">
      <div className="container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="user-greeting">
            <div className="user-avatar-large">{user?.name[0]?.toUpperCase()}</div>
            <div>
              <h1>Welcome back, {user?.name}! 👋</h1>
              <p>Manage your library and uploads</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid-dashboard">
          <div className="stat-card-dashboard">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <div className="stat-number-dashboard">{user?.totalUploads || 0}</div>
              <div className="stat-label-dashboard">Books Uploaded</div>
            </div>
          </div>
          <div className="stat-card-dashboard">
            <div className="stat-icon">📥</div>
            <div className="stat-content">
              <div className="stat-number-dashboard">{user?.totalDownloads || 0}</div>
              <div className="stat-label-dashboard">Total Downloads</div>
            </div>
          </div>
          <div className="stat-card-dashboard">
            <div className="stat-icon">❤️</div>
            <div className="stat-content">
              <div className="stat-number-dashboard">{user?.favoriteBooks?.length || 0}</div>
              <div className="stat-label-dashboard">Favorites</div>
            </div>
          </div>
          <div className="stat-card-dashboard">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-number-dashboard">4.8</div>
              <div className="stat-label-dashboard">Avg Rating</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/user/upload" className="action-card">
              <div className="action-icon">📤</div>
              <h3>Upload Book</h3>
              <p>Share your favorite books with the community</p>
            </Link>
            <Link to="/user/uploads" className="action-card">
              <div className="action-icon">📚</div>
              <h3>My Uploads</h3>
              <p>View and manage your uploaded books</p>
            </Link>
            <Link to="/user/favorites" className="action-card">
              <div className="action-icon">❤️</div>
              <h3>Favorites</h3>
              <p>Access your favorite books collection</p>
            </Link>
            <Link to="/user/profile" className="action-card">
              <div className="action-icon">👤</div>
              <h3>My Profile</h3>
              <p>Update your personal information</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">✅</span>
              <div className="activity-content">
                <p className="activity-title">Book "Advanced JavaScript" approved</p>
                <p className="activity-time">2 hours ago</p>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">📥</span>
              <div className="activity-content">
                <p className="activity-title">Your book received 15 downloads</p>
                <p className="activity-time">Yesterday</p>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">⭐</span>
              <div className="activity-content">
                <p className="activity-title">New 5-star review on your book</p>
                <p className="activity-time">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
