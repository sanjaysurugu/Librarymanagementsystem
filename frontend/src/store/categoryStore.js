import { create } from 'zustand';
import { categoryAPI } from '../api/categoryAPI';

export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  getCategories: async () => {
    try {
      set({ loading: true, error: null });
      const response = await categoryAPI.getCategories();
      set({ categories: response.data.categories, loading: false });
      return response.data.categories;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch categories', loading: false });
      throw error;
    }
  },

  createCategory: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await categoryAPI.createCategory(data);
      set({ categories: [...get().categories, response.data.category], loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create category', loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
