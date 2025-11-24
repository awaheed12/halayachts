/**
 * Environment variable validation
 * Run this on app startup to ensure all required variables are set
 */

import { logger } from './utils';

const requiredEnvVars = {
  production: ['MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'],
  development: ['MONGODB_URI'],
};

export function validateEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const required = requiredEnvVars[env] || requiredEnvVars.development;
  const missing = [];

  required.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error(error);
    
    if (env === 'production') {
      throw new Error(error);
    } else {
      logger.warn('⚠️  Running in development mode with missing variables. Some features may not work.');
    }
  } else {
    logger.log('✅ Environment variables validated');
  }

  // Warn about cloud storage in production
  if (env === 'production') {
    const hasCloudinary = 
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY;
    const hasS3 = process.env.AWS_S3_BUCKET;

    if (!hasCloudinary && !hasS3) {
      logger.warn('⚠️  No cloud storage configured. File uploads will not work in production.');
    }
  }
}

