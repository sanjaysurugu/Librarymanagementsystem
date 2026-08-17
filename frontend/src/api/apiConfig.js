const LOCAL_API_URL = 'http://localhost:5000/api';
const RENDER_API_URL = 'https://library-management-backend.onrender.com/api';

// Local development uses the local API. In a deployed build, this fallback
// keeps the app connected even if VITE_API_URL was not set in Render.
export const API_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? LOCAL_API_URL : RENDER_API_URL);
