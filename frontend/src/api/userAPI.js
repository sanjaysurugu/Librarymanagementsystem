import apiClient from './axiosConfig';

export const userAPI = {
  getUsers: (params) => apiClient.get('/users', { params }),
  getUserById: (id) => apiClient.get(`/users/${id}`),
  updateProfile: (data) => apiClient.patch('/users/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getDashboardStats: () => apiClient.get('/users/dashboard/stats'),
  updatePreferences: (data) => apiClient.patch('/users/preferences', data),
  toggleBlockUser: (id) => apiClient.patch(`/users/${id}/toggle-block`),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
  changeUserRole: (id, role) => apiClient.patch(`/users/${id}/role`, { role }),
};
