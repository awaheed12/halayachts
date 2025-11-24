/**
 * Client-side logger utility
 * Safe for use in React components and browser
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const clientLogger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log('[CLIENT]', ...args);
    }
  },
  error: (...args) => {
    // Always log errors, but format them properly
    console.error('[CLIENT ERROR]', ...args);
  },
  warn: (...args) => {
    if (isDevelopment) {
      console.warn('[CLIENT WARN]', ...args);
    }
  },
  info: (...args) => {
    if (isDevelopment) {
      console.info('[CLIENT INFO]', ...args);
    }
  },
};

