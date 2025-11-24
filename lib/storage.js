/**
 * Cloud Storage Service - Production-ready file upload handler
 * Supports multiple storage providers with fallback
 */

import { logger } from './utils';

/**
 * Storage provider interface
 */
class StorageProvider {
  async upload(file, path) {
    throw new Error('StorageProvider.upload() must be implemented');
  }

  async delete(path) {
    throw new Error('StorageProvider.delete() must be implemented');
  }

  getPublicUrl(path) {
    throw new Error('StorageProvider.getPublicUrl() must be implemented');
  }
}

/**
 * Local filesystem storage (for development only)
 */
class LocalStorageProvider extends StorageProvider {
  constructor() {
    super();
    this.basePath = process.cwd();
  }

  async upload(file, path) {
    const fs = await import('fs/promises');
    const pathModule = await import('path');
    
    const fullPath = pathModule.join(this.basePath, 'public', path);
    const dir = pathModule.dirname(fullPath);
    
    await fs.mkdir(dir, { recursive: true });
    
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fullPath, buffer);
    
    return { success: true, path };
  }

  async delete(path) {
    const fs = await import('fs/promises');
    const pathModule = await import('path');
    
    const fullPath = pathModule.join(this.basePath, 'public', path);
    await fs.unlink(fullPath).catch(() => {
      // File might not exist, ignore error
    });
    
    return { success: true };
  }

  getPublicUrl(path) {
    return path.startsWith('/') ? path : `/${path}`;
  }
}

/**
 * Cloudinary storage provider
 */
class CloudinaryStorageProvider extends StorageProvider {
  constructor() {
    super();
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    this.apiKey = process.env.CLOUDINARY_API_KEY;
    this.apiSecret = process.env.CLOUDINARY_API_SECRET;
    this.folder = process.env.CLOUDINARY_FOLDER || 'hala-yachts';
  }

  async upload(file, path) {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new Error('Cloudinary credentials not configured');
    }

    // Convert file to base64 for Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Use unsigned upload preset for simplicity (or signed upload with signature)
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'unsigned';
    
    const formData = new URLSearchParams();
    formData.append('file', dataUri);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', this.folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || 'Cloudinary upload failed');
    }

    const data = await response.json();
    return {
      success: true,
      path: data.secure_url,
      publicId: data.public_id,
    };
  }

  async delete(path) {
    // Extract public_id from URL
    const publicId = path.split('/').pop().replace(/\.[^/.]+$/, '');
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await this.generateSignature(publicId, timestamp);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: publicId,
          signature,
          timestamp,
          api_key: this.apiKey,
        }),
      }
    );

    return { success: response.ok };
  }

  getPublicUrl(path) {
    return path; // Cloudinary returns full URL
  }

  async generateSignature(publicId, timestamp) {
    const crypto = await import('crypto');
    const message = `public_id=${publicId}&timestamp=${timestamp}${this.apiSecret}`;
    return crypto.createHash('sha1').update(message).digest('hex');
  }
}

/**
 * AWS S3 storage provider
 */
class S3StorageProvider extends StorageProvider {
  constructor() {
    super();
    // Note: For production, use AWS SDK v3
    // This is a placeholder structure
    this.bucket = process.env.AWS_S3_BUCKET;
    this.region = process.env.AWS_S3_REGION || 'us-east-1';
  }

  async upload(file, path) {
    // Implementation would use AWS SDK
    // For now, return error if not configured
    if (!this.bucket) {
      throw new Error('AWS S3 not configured');
    }
    throw new Error('S3 upload not implemented - use Cloudinary or local storage');
  }

  async delete(path) {
    throw new Error('S3 delete not implemented');
  }

  getPublicUrl(path) {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${path}`;
  }
}

/**
 * Get the appropriate storage provider
 */
export function getStorageProvider() {
  // Check for Cloudinary first (most common)
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY
  ) {
    logger.info('Using Cloudinary storage provider');
    return new CloudinaryStorageProvider();
  }

  // Check for S3
  if (process.env.AWS_S3_BUCKET) {
    logger.info('Using AWS S3 storage provider');
    return new S3StorageProvider();
  }

  // Fallback to local storage (development only)
  if (process.env.NODE_ENV === 'development') {
    logger.warn('Using local filesystem storage (development only)');
    return new LocalStorageProvider();
  }

  // Production without cloud storage configured
  throw new Error(
    'No cloud storage provider configured. Please set up Cloudinary or AWS S3.'
  );
}

/**
 * Upload file using the configured storage provider
 */
export async function uploadFile(file, folder = 'uploads') {
  const provider = getStorageProvider();
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const filename = `${folder}/${timestamp}.${extension}`;
  
  try {
    const result = await provider.upload(file, filename);
    return {
      success: true,
      filePath: provider.getPublicUrl(result.path),
      ...result,
    };
  } catch (error) {
    logger.error('File upload error:', error);
    throw error;
  }
}

/**
 * Delete file using the configured storage provider
 */
export async function deleteFile(path) {
  const provider = getStorageProvider();
  try {
    return await provider.delete(path);
  } catch (error) {
    logger.error('File delete error:', error);
    throw error;
  }
}

