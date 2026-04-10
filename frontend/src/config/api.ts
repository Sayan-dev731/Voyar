// API Configuration
const isDevelopment = import.meta.env.MODE === 'development';

export const config = {
    apiUrl: import.meta.env.VITE_API_URL || (isDevelopment
        ? 'http://localhost:3000/api'
        : 'https://your-production-api.com/api'),

    frontendUrl: import.meta.env.VITE_FRONTEND_URL || (isDevelopment
        ? 'http://localhost:5173'
        : 'https://your-production-domain.com'),
};

export const API_URL = config.apiUrl;
export const FRONTEND_URL = config.frontendUrl;
