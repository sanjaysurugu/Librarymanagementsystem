const LOCAL_API_URL = 'http://localhost:5000/api';

// A production deployment must provide its own backend URL. Using a guessed
// Render hostname can silently send requests to a different application.
export const API_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? LOCAL_API_URL : '');

export const isApiConfigured = Boolean(API_URL);
