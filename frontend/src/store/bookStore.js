import { create } from 'zustand';
import { bookAPI } from '../api/bookAPI';

export const useBookStore = create((set, get) => ({
  books: [],
  book: null,
  loading: false,
  error: null,
  pagination: null,

  getBooks: async (params) => {
    try {
      set({ loading: true, error: null });
      const response = await bookAPI.getBooks(params);
      set({ books: response.data.books, pagination: response.data.pagination, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch books', loading: false });
      throw error;
    }
  },

  getBook: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await bookAPI.getBook(id);
      set({ book: response.data.book, loading: false });
      return response.data.book;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch book', loading: false });
      throw error;
    }
  },

  createBook: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await bookAPI.createBook(data);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create book', loading: false });
      throw error;
    }
  },

  updateBook: async (id, data) => {
    try {
      set({ loading: true, error: null });
      const response = await bookAPI.updateBook(id, data);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update book', loading: false });
      throw error;
    }
  },

  deleteBook: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await bookAPI.deleteBook(id);
      set({ books: get().books.filter(b => b._id !== id), loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete book', loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
