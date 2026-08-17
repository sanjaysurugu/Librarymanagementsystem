import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/apiConfig';

function AllBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllBooks();
  }, []);

  const fetchAllBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/books/admin/all`, {
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

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete book');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem', color: '#1f2937' }}>📚 Manage All Books</h1>

      {loading ? (
        <p>Loading books list...</p>
      ) : books.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No books found in the library catalog.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '0.8rem 1rem' }}>Title</th>
                <th style={{ padding: '0.8rem 1rem' }}>Author</th>
                <th style={{ padding: '0.8rem 1rem' }}>Status</th>
                <th style={{ padding: '0.8rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map(b => (
                <tr key={b._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.8rem 1rem', fontWeight: '600' }}>{b.title}</td>
                  <td style={{ padding: '0.8rem 1rem', color: '#4b5563' }}>{b.author}</td>
                  <td style={{ padding: '0.8rem 1rem' }}>
                    <span style={{
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: b.status === 'approved' ? '#dcfce7' : b.status === 'pending' ? '#fef9c3' : '#fee2e2',
                      color: b.status === 'approved' ? '#15803d' : b.status === 'pending' ? '#a16207' : '#b91c1c'
                    }}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem 1rem' }}>
                    <button
                      onClick={() => handleDelete(b._id)}
                      style={{ padding: '0.4rem 0.8rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Delete
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

export default AllBooks;
