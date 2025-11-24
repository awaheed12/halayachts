import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage';
import { logger, formatErrorResponse } from '@/lib/utils';

// Force dynamic rendering for file uploads
export const dynamic = 'force-dynamic';

// Rate limiting (simple in-memory store - use Redis in production for distributed systems)
const uploadLimits = new Map();
const MAX_UPLOADS_PER_HOUR = 50;

function checkRateLimit(ip) {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  
  const uploads = uploadLimits.get(ip) || [];
  const recentUploads = uploads.filter(timestamp => timestamp > hourAgo);
  
  if (recentUploads.length >= MAX_UPLOADS_PER_HOUR) {
    return false;
  }
  
  recentUploads.push(now);
  uploadLimits.set(ip, recentUploads);
  return true;
}

export async function POST(request) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many upload requests. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for yacht images)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Upload file using storage provider
    const result = await uploadFile(file, 'yachts');

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      filePath: result.filePath
    });

  } catch (error) {
    logger.error('Error uploading file:', error);
    
    // Don't expose internal errors in production
    const isProduction = process.env.NODE_ENV === 'production';
    const errorResponse = isProduction
      ? { error: 'Failed to upload file. Please try again.' }
      : formatErrorResponse(error);

    return NextResponse.json(
      errorResponse,
      { status: 500 }
    );
  }
}

