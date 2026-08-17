import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function UploadBook() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    description: '',
    isbn: '',
    publisher: '',
    publishedYear: new Date().getFullYear(),
    language: 'English',
    pages: '',
    tags: '',
  });

  const [coverImage, setCoverImage] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      if (res.data.success && res.data.categories) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleBookFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBookFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.author || !formData.category || !formData.description) {
      setError('Please fill in all required fields (Title, Author, Category, Description).');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();

      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      if (coverImage) {
        data.append('coverImage', coverImage);
      }
      if (bookFile) {
        data.append('bookFile', bookFile);
      }

      const res = await axios.post(`${API_URL}/books`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (res.data.success) {
        setSuccess(res.data.message || 'Book uploaded successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '850px',
      margin: '2rem auto',
      padding: '2.5rem',
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.2rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          📖 Upload New Book
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.05rem' }}>
          Share your favorite books and resources with the community.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fef2f2',
          borderLeft: '4px solid #ef4444',
          color: '#b91c1c',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.95rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f0fdf4',
          borderLeft: '4px solid #22c55e',
          color: '#15803d',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.95rem'
        }}>
          ✅ {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#374151' }}>
              Book Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Clean Code"
              required
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid #e5e7eb',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border 0.2s'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#374151' }}>
              Author Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="e.g. Robert C. Martin"
              required
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid #e5e7eb',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#374151' }}>
              Category <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid #e5e7eb',
                fontSize: '1rem',
                outline: 'none',
                backgroundColor: '#fff'
              }}
            >
              <option value="" disabled>Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#374151' }}>
              Language
            </label>
            <input
              type="text"
              name="language"
              value={formData.language}
              onChange={handleChange}
              placeholder="e.g. English"
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid #e5e7eb',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#374151' }}>
            Book Description <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Write a brief overview of the book..."
            rows="4"
            required
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              border: '1.5px solid #e5e7eb',
              fontSize: '1rem',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#374151' }}>
              ISBN
            </label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="978-3-16-148410-0"
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid #e5e7eb',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#374151' }}>
              Publisher
            </label>
            <input
              type="text"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              placeholder="Prentice Hall"
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid #e5e7eb',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#374151' }}>
              Pages
            </label>
            <input
              type="number"
              name="pages"
              value={formData.pages}
              onChange={handleChange}
              placeholder="464"
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid #e5e7eb',
                fontSize: '0.95rem'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#374151' }}>
              🖼️ Book Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '10px',
                border: '1.5px dashed #cbd5e1',
                backgroundColor: '#f8fafc',
                cursor: 'pointer'
              }}
            />
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover Preview"
                style={{
                  marginTop: '0.8rem',
                  maxHeight: '120px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              />
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#374151' }}>
              📄 Book File (PDF, EPUB, DOC)
            </label>
            <input
              type="file"
              accept=".pdf,.epub,.doc,.docx"
              onChange={handleBookFileChange}
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '10px',
                border: '1.5px dashed #cbd5e1',
                backgroundColor: '#f8fafc',
                cursor: 'pointer'
              }}
            />
            {bookFile && (
              <p style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: '#16a34a', fontWeight: '600' }}>
                📎 Attached: {bookFile.name} ({(bookFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: '#ffffff',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.2s ease-in-out',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Uploading Book...' : '🚀 Submit & Upload Book'}
        </button>
      </form>
    </div>
  );
}

export default UploadBook;
