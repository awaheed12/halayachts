import { NextResponse } from 'next/server';
import { logger, formatErrorResponse, isProduction } from '@/lib/utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Rate limiting for login attempts
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

function checkLoginRateLimit(ip) {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || { count: 0, lockoutUntil: 0 };

  if (attempts.lockoutUntil > now) {
    return false;
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.lockoutUntil = now + LOCKOUT_TIME;
    loginAttempts.set(ip, attempts);
    return false;
  }

  return true;
}

function recordFailedAttempt(ip) {
  const attempts = loginAttempts.get(ip) || { count: 0, lockoutUntil: 0 };
  attempts.count += 1;
  loginAttempts.set(ip, attempts);
}

function resetAttempts(ip) {
  loginAttempts.delete(ip);
}

const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || (isProduction() ? null : "admin@halayachts.com"),
  password: process.env.ADMIN_PASSWORD || (isProduction() ? null : "admin123")
};

if (isProduction() && (!ADMIN_CREDENTIALS.email || !ADMIN_CREDENTIALS.password)) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in production');
}

export async function POST(request) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    if (!checkLoginRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      resetAttempts(ip);
      logger.log(`Admin login successful from IP: ${ip}`);
      
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          email: ADMIN_CREDENTIALS.email,
          name: 'Hala Yachts Admin'
        }
      });
    } else {
      recordFailedAttempt(ip);
      logger.warn(`Failed login attempt from IP: ${ip}`);
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

  } catch (error) {
    logger.error('Login error:', error);
    
    const errorResponse = isProduction()
      ? { error: 'Internal server error' }
      : formatErrorResponse(error);

    return NextResponse.json(
      errorResponse,
      { status: 500 }
    );
  }
}