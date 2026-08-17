import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/apiConfig';

function PendingBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/books/admin/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setBooks(res.data.books || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (bookId, action) => {
    try {
      const token = localStorage.getItem('token');
      const reason = action === 'rejected' ? prompt('Reason for rejection:') : '';
      const res = await axios.put(`${API_URL}/books/admin/${bookId}/review`, { status: action, rejectionReason: reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMsg(`Book ${action} successfully!`);
        fetchPending();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem', color: '#1f2937' }}>⏳ Pending Book Approvals</h1>

      {msg && <div style={{ padding: '0.8rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '8px', marginBottom: '1.5rem' }}>{msg}</div>}

      {loading ? (
        <p>Loading pending requests...</p>
      ) : books.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: '1.05rem' }}>No pending book approvals at this time.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {books.map(book => (
            <div key={book._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <div>
                <h3 style={{ margin: '0 0 0.4rem 0', color: '#111827' }}>{book.title}</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>By {book.author} | Category: {book.category?.name || 'General'}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button
                  onClick={() => handleAction(book._id, 'approved')}
                  style={{ padding: '0.6rem 1.2rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => handleAction(book._id, 'rejected')}
                  style={{ padding: '0.6rem 1.2rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PendingBooks;
