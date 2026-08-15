import apiClient from './axiosConfig';

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
  verifyEmail: (token) => apiClient.post(`/auth/verify-email/${token}`),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, data) => apiClient.post(`/auth/reset-password/${token}`, data),
  changePassword: (data) => apiClient.post('/auth/change-password', data),
  googleAuth: (data) => apiClient.post('/auth/google-auth', data),
};
