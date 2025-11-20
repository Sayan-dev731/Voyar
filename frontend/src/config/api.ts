// API Configuration
const isDevelopment = import.meta.env.MODE === 'development';

export const config = {
    apiUrl: isDevelopment
        ? 'http://localhost:5000/api'
        : import.meta.env.VITE_API_URL || 'https://your-production-api.com/api',

    frontendUrl: isDevelopment
        ? 'http://localhost:5173'
        : import.meta.env.VITE_FRONTEND_URL || 'https://your-production-domain.com',
};

export const API_URL = config.apiUrl;
export const FRONTEND_URL = config.frontendUrl;
