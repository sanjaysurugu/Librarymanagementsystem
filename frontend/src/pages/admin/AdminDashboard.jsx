import React from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <div className="container">
        {/* Header */}
        <div className="admin-header">
          <h1>🛠️ Admin Dashboard</h1>
          <p>Manage your library system</p>
        </div>

        {/* Stats Overview */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <div className="stat-number">234</div>
              <div className="stat-label">Total Books</div>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <div className="stat-number">12</div>
              <div className="stat-label">Pending Review</div>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-number">543</div>
              <div className="stat-label">Active Users</div>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon">📂</div>
            <div className="stat-info">
              <div className="stat-number">18</div>
              <div className="stat-label">Categories</div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="admin-sections">
          <h2>Management Sections</h2>
          <div className="sections-grid">
            <Link to="/admin/pending-books" className="section-card section-card-warning">
              <div className="section-icon">⏳</div>
              <h3>Pending Books</h3>
              <p>Review and approve pending book submissions</p>
              <span className="badge badge-warning">12 pending</span>
            </Link>
            <Link to="/admin/all-books" className="section-card section-card-primary">
              <div className="section-icon">📚</div>
              <h3>All Books</h3>
              <p>View, edit, or delete books in the library</p>
              <span className="badge badge-primary">234 books</span>
            </Link>
            <Link to="/admin/users" className="section-card section-card-success">
              <div className="section-icon">👥</div>
              <h3>Manage Users</h3>
              <p>Manage user accounts and permissions</p>
              <span className="badge badge-success">543 users</span>
            </Link>
            <Link to="/admin/categories" className="section-card section-card-info">
              <div className="section-icon">📂</div>
              <h3>Manage Categories</h3>
              <p>Create and organize book categories</p>
              <span className="badge badge-info">18 categories</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="admin-activity">
          <h2>Recent Activity</h2>
          <div className="activity-timeline">
            <div className="timeline-item">
              <span className="timeline-icon">✅</span>
              <div className="timeline-content">
                <p className="timeline-title">Book approved: "Advanced React Patterns"</p>
                <p className="timeline-time">2 hours ago</p>
              </div>
            </div>
            <div className="timeline-item">
              <span className="timeline-icon">❌</span>
              <div className="timeline-content">
                <p className="timeline-title">Book rejected: "Invalid Content"</p>
                <p className="timeline-time">5 hours ago</p>
              </div>
            </div>
            <div className="timeline-item">
              <span className="timeline-icon">👤</span>
              <div className="timeline-content">
                <p className="timeline-title">New user registered: John Doe</p>
                <p className="timeline-time">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
