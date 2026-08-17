import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/apiConfig';

function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      if (res.data.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/categories`, { name, description }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMsg('Category created successfully!');
        setName('');
        setDescription('');
        fetchCategories();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem', color: '#1f2937' }}>🏷️ Manage Categories</h1>

      {msg && <div style={{ padding: '0.8rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '8px', marginBottom: '1.5rem' }}>{msg}</div>}

      <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Category Name (e.g. Science)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
        />
        <input
          type="text"
          placeholder="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
        />
        <button type="submit" style={{ padding: '0.8rem 1.5rem', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
          + Add Category
        </button>
      </form>

      {loading ? (
        <p>Loading categories...</p>
      ) : categories.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No categories created yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {categories.map(cat => (
            <div key={cat._id} style={{ padding: '1rem', borderRadius: '10px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 0.3rem 0', color: '#1f2937' }}>{cat.name}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>{cat.bookCount || 0} Books</p>
              </div>
              <button
                onClick={() => handleDelete(cat._id)}
                style={{ padding: '0.3rem 0.6rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageCategories;
