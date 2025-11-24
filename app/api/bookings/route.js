import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { logger, formatErrorResponse, isProduction } from '@/lib/utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const bookingData = await request.json();
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'charterType', 'passengers', 'yachtTitle', 'location'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email format' 
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Create new booking
    const booking = new Booking(bookingData);
    const savedBooking = await booking.save();

    // Send notification (optional)
    await sendBookingNotification(savedBooking);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Booking submitted successfully',
        bookingId: savedBooking._id,
        bookingReference: savedBooking.bookingReference
      },
      { status: 201 }
    );

  } catch (error) {
    logger.error('Booking submission error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Booking reference already exists' 
        },
        { status: 400 }
      );
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false,
          error: `Validation error: ${errors.join(', ')}` 
        },
        { status: 400 }
      );
    }

    const errorResponse = isProduction()
      ? { success: false, error: 'Internal server error' }
      : { success: false, ...formatErrorResponse(error) };

    return NextResponse.json(
      errorResponse,
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve bookings
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    await connectToDatabase();

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Booking.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching bookings:', error);
    
    const errorResponse = isProduction()
      ? { success: false, error: 'Internal server error' }
      : { success: false, ...formatErrorResponse(error) };

    return NextResponse.json(
      errorResponse,
      { status: 500 }
    );
  }
}

// Email notification function
async function sendBookingNotification(booking) {
  try {
    logger.log('New Booking Notification:', {
      bookingReference: booking.bookingReference,
      yacht: booking.yachtTitle,
      type: booking.charterType,
      customer: `${booking.firstName} ${booking.lastName}`,
      email: booking.email,
      phone: booking.phone,
      passengers: booking.passengers,
      date: booking.date || `${booking.checkInDate} to ${booking.checkOutDate}`
    });

    // You can integrate with your email service here
    // Example with nodemailer or Resend

  } catch (error) {
    logger.error('Error sending notification:', error);
  }
}