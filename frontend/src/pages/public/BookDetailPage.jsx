import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBookStore } from '../../store/bookStore';
import { API_URL } from '../../api/apiConfig';
import './BookDetailPage.css';

function BookDetailPage() {
  const { id } = useParams();
  const { book, getBook, loading } = useBookStore();

  useEffect(() => {
    getBook(id);
  }, [id]);

  if (loading) {
    return (
      <div className="book-detail-page">
        <div className="container loading-container">
          <div className="spinner"></div>
          <p>Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-detail-page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Book not found</h3>
            <p>The book you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-detail-page">
      <div className="container">
        <div className="book-detail-content">
          {/* Book Cover */}
          <div className="book-detail-cover">
            {book.coverImage?.url ? (
              <img src={book.coverImage.url} alt={book.title} />
            ) : (
              <div className="cover-placeholder">
                <span>📖</span>
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="book-detail-info">
            <div className="book-detail-header">
              <h1 className="book-detail-title">{book.title}</h1>
              <p className="book-detail-author">by <strong>{book.author}</strong></p>
            </div>

            {book.category && (
              <div className="book-badges">
                <span className="badge badge-primary">{book.category.name}</span>
              </div>
            )}

            <div className="book-meta-info">
              <div className="meta-item">
                <span className="meta-label">📥 Downloads</span>
                <span className="meta-value">{book.downloadCount || 0}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">⭐ Rating</span>
                <span className="meta-value">4.8/5</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">📅 Published</span>
                <span className="meta-value">2024</span>
              </div>
            </div>

            <div className="book-description">
              <h3>Description</h3>
              <p>{book.description}</p>
            </div>

            <div className="book-actions">
              {book.bookFile?.url && (
                <a href={`${API_URL}/books/${book._id}/download`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-large">
                  📥 Download Book
                </a>
              )}
              <button className="btn btn-secondary btn-large">
                ❤️ Add to Favorites
              </button>
            </div>

            {/* Reviews Section */}
            <div className="reviews-section">
              <h3>Reviews</h3>
              <div className="reviews-list">
                <div className="review-item">
                  <div className="review-header">
                    <strong>John Doe</strong>
                    <span className="review-rating">⭐⭐⭐⭐⭐</span>
                  </div>
                  <p>Amazing book! Couldn't put it down. Highly recommended!</p>
                </div>
                <div className="review-item">
                  <div className="review-header">
                    <strong>Jane Smith</strong>
                    <span className="review-rating">⭐⭐⭐⭐</span>
                  </div>
                  <p>Great read with interesting characters and plot twists.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;
