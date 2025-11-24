/**
 * Production-ready utility functions
 */

/**
 * Get the base URL for API calls
 * Works in both development and production (Vercel, Netlify, etc.)
 */
export function getBaseUrl() {
  // Check for explicit API URL first
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Vercel provides VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Netlify provides URL
  if (process.env.URL) {
    return process.env.URL;
  }

  // Fallback for local development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // Production fallback - should not reach here if properly configured
  return '';
}

/**
 * Build API URL
 */
export function getApiUrl(endpoint = '') {
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return baseUrl ? `${baseUrl}${cleanEndpoint}` : cleanEndpoint;
}

/**
 * Check if running on Vercel
 */
export function isVercel() {
  return process.env.VERCEL === '1';
}

/**
 * Check if running in production
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Logger utility - replaces console.log/error for production
 */
export const logger = {
  log: (...args) => {
    if (!isProduction()) {
      console.log(...args);
    }
  },
  error: (...args) => {
    // Always log errors, but format them properly
    console.error('[ERROR]', ...args);
  },
  warn: (...args) => {
    if (!isProduction()) {
      console.warn('[WARN]', ...args);
    }
  },
  info: (...args) => {
    if (!isProduction()) {
      console.info('[INFO]', ...args);
    }
  },
};

/**
 * Validate environment variables
 */
export function validateEnv() {
  const required = ['MONGODB_URI'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9.-]/gi, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

/**
 * Format error response
 */
export function formatErrorResponse(error, statusCode = 500) {
  const isDev = !isProduction();
  
  return {
    error: error.message || 'An error occurred',
    ...(isDev && { details: error.stack }),
    timestamp: new Date().toISOString(),
  };
}

