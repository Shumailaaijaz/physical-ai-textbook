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
// Hardcoded for production deployment (Docusaurus doesn't support REACT_APP_ prefix)
export const CHATBOT_API_URL = 'https://shumailaaijaz-hackathon-book.hf.space';

// Additional configuration options
export const API_TIMEOUT = 30000; // 30 seconds
export const MAX_RETRIES = 3;