import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/apiConfig';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        setName(res.data.user.name);
        setEmail(res.data.user.email);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/users/profile`, { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Profile updated successfully!' });
        fetchProfile();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (!oldPassword || !newPassword) {
      setMsg({ type: 'error', text: 'Please fill in both password fields.' });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/auth/change-password`, { currentPassword: oldPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Password changed successfully!' });
        setOldPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '2rem auto', padding: '2.5rem', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem', color: '#1f2937' }}>👤 Account Profile</h1>

      {msg.text && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          backgroundColor: msg.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: msg.type === 'error' ? '#dc2626' : '#16a34a',
          borderLeft: `4px solid ${msg.type === 'error' ? '#dc2626' : '#16a34a'}`
        }}>
          {msg.type === 'error' ? '⚠️ ' : '✅ '}{msg.text}
        </div>
      )}

      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#374151' }}>Personal Details</h2>
        <form onSubmit={handleUpdateProfile}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#4b5563' }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#4b5563' }}>Email Address (Read-only)</label>
            <input
              type="email"
              value={email}
              disabled
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#6b7280', fontSize: '1rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '0.8rem 1.8rem', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
          >
            Save Profile
          </button>
        </form>
      </div>

      <hr style={{ border: '0', borderTop: '1px solid #f3f4f6', margin: '2rem 0' }} />

      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#374151' }}>Change Password</h2>
        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#4b5563' }}>Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#4b5563' }}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '0.8rem 1.8rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserProfile;
