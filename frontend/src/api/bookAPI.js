import apiClient from './axiosConfig';

export const bookAPI = {
  getBooks: (params) => apiClient.get('/books', { params }),
  getBook: (id) => apiClient.get(`/books/${id}`),
  createBook: (data) => apiClient.post('/books', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateBook: (id, data) => apiClient.patch(`/books/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteBook: (id) => apiClient.delete(`/books/${id}`),
  getPendingBooks: (params) => apiClient.get('/books/pending', { params }),
  getMyUploads: (params) => apiClient.get('/books/my-uploads', { params }),
  reviewBook: (id, data) => apiClient.post(`/books/${id}/review`, data),
  getAllBooks: (params) => apiClient.get('/books/admin/all', { params }),
};
