import React, { useEffect, useState } from 'react';
import { useBookStore } from '../../store/bookStore';
import { useCategoryStore } from '../../store/categoryStore';
import './BrowseBooksPage.css';

function BrowseBooksPage() {
  const { books, getBooks, loading } = useBookStore();
  const { categories, getCategories } = useCategoryStore();
  const [filters, setFilters] = useState({ page: 1, category: '', search: '' });

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    getBooks(filters);
  }, [filters]);

  return (
    <div className="browse-page">
      <div className="container">
        {/* Header */}
        <div className="browse-header">
          <h1 className="section-title">📚 Explore Our Library</h1>
          <p className="section-subtitle">Discover thousands of books from various genres and authors</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search books by title, author..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="search-input"
            />
          </div>

          <div className="category-filter">
            <label>Filter by Category:</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="category-select"
            >
              <option value="">📚 All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No books found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="books-grid">
            {books.map((book) => (
              <div key={book._id} className="book-card">
                <div className="book-cover">
                  {book.coverImage?.url ? (
                    <img src={book.coverImage.url} alt={book.title} />
                  ) : (
                    <div className="book-cover-placeholder">
                      <span>📖</span>
                    </div>
                  )}
                  <div className="book-overlay">
                    <a href={`/book/${book.slug}`} className="btn btn-primary">
                      View Details
                    </a>
                  </div>
                </div>
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">by {book.author}</p>
                  {book.category && (
                    <span className="badge badge-primary">{book.category.name}</span>
                  )}
                  <div className="book-meta">
                    <span className="downloads">📥 {book.downloadCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseBooksPage;
