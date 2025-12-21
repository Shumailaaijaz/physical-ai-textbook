// Configuration file for API settings and feature flags

// Determine if we should use mock API (for development/testing)
export const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API === 'true' || false;

// Get the base API URL based on environment
export const getApiBaseUrl = (): string => {
  // Check if we're in development mode
  if (process.env.NODE_ENV === 'development') {
    // Use the environment variable if available, otherwise default to localhost
    return process.env.REACT_APP_API_URL || 'http://localhost:8000';
  }

  // For production, use the Vercel URL if available, or construct from window.location
  if (typeof window !== 'undefined') {
    // If running in browser
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) {
      return `https://${vercelUrl}`;
    }
    // Fallback to current origin
    return window.location.origin;
  }

  // For server-side rendering
  return process.env.API_BASE_URL || 'http://localhost:8000';
};

// Chatbot Configuration
// Auto-detect environment and use appropriate backend URL
export const CHATBOT_API_URL = (() => {
  // If environment variable is set, use it
  if (process.env.REACT_APP_CHATBOT_API_URL) {
    return process.env.REACT_APP_CHATBOT_API_URL;
  }

  // Check if we're in browser and production
  if (typeof window !== 'undefined') {
    // Production: GitHub Pages
    if (window.location.hostname === 'shumailaaijaz.github.io') {
      // TODO: Replace with your Vercel backend URL after deployment
      return 'https://physical-ai-backend.vercel.app';
    }
    // Development: localhost
    return 'http://localhost:8000';
  }

  // Fallback for SSR
  return 'http://localhost:8000';
})();

// Additional configuration options
export const API_TIMEOUT = 30000; // 30 seconds
export const MAX_RETRIES = 3;