import { create } from 'zustand';
import { authAPI } from '../api/authAPI';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  register: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await authAPI.register(data);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ token, user, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Registration failed', loading: false });
      throw error;
    }
  },

  login: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await authAPI.login(data);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ token, user, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', loading: false });
      throw error;
    }
  },

  getMe: async () => {
    try {
      const response = await authAPI.getMe();
      set({ user: response.data.user });
      return response.data.user;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch user', token: null, user: null });
      localStorage.removeItem('token');
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
