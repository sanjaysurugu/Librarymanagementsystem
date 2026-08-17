import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/apiConfig';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = user.isBlocked ? 'unblock' : 'block';
      await axios.put(`${API_URL}/users/${user._id}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem', color: '#1f2937' }}>👥 Manage Registered Users</h1>

      {loading ? (
        <p>Loading users list...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '0.8rem 1rem' }}>Name</th>
                <th style={{ padding: '0.8rem 1rem' }}>Email</th>
                <th style={{ padding: '0.8rem 1rem' }}>Role</th>
                <th style={{ padding: '0.8rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.8rem 1rem', fontWeight: '600' }}>{u.name}</td>
                  <td style={{ padding: '0.8rem 1rem', color: '#4b5563' }}>{u.email}</td>
                  <td style={{ padding: '0.8rem 1rem' }}>
                    <span style={{
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: u.role === 'admin' ? '#e0e7ff' : '#f3f4f6',
                      color: u.role === 'admin' ? '#4338ca' : '#374151'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem 1rem' }}>
                    <button
                      onClick={() => handleToggleBlock(u)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        backgroundColor: u.isBlocked ? '#10b981' : '#f59e0b',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      {u.isBlocked ? 'Unblock User' : 'Block User'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
