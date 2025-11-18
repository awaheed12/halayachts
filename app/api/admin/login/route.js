import { NextResponse } from 'next/server';

const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || "admin@halayachts.com",
  password: process.env.ADMIN_PASSWORD || "admin123"
};

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          email: ADMIN_CREDENTIALS.email,
          name: 'Hala Yachts Admin'
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}