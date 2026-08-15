import apiClient from './axiosConfig';

export const categoryAPI = {
  getCategories: () => apiClient.get('/categories'),
  getAllCategories: () => apiClient.get('/categories/admin/all'),
  createCategory: (data) => apiClient.post('/categories', data),
  updateCategory: (id, data) => apiClient.patch(`/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/categories/${id}`),
};
