import React, { useEffect, useState } from 'react';
import { useBookStore } from '../../store/bookStore';

function MyUploads() {
  const { books, getMyUploads, loading } = useBookStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    getMyUploads({ page }).catch(() => {});
  }, [page]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Uploads</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        books.length === 0 ? (
        <p>You haven't uploaded any books yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '0.5rem' }}>Title</th>
              <th style={{ border: '1px solid #ddd', padding: '0.5rem' }}>Status</th>
              <th style={{ border: '1px solid #ddd', padding: '0.5rem' }}>Downloads</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book._id}>
                <td style={{ border: '1px solid #ddd', padding: '0.5rem' }}>{book.title}</td>
                <td style={{ border: '1px solid #ddd', padding: '0.5rem' }}>{book.status}</td>
                <td style={{ border: '1px solid #ddd', padding: '0.5rem' }}>{book.downloadCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}

export default MyUploads;
