import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { logger, formatErrorResponse, isProduction } from '@/lib/utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  try {
    // Await the params object
    const { id } = await params;
    const updateData = await request.json();

    // Validate status if provided
    if (updateData.status && !['pending', 'confirmed', 'cancelled', 'completed'].includes(updateData.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedBooking
    });

  } catch (error) {
    logger.error('Error updating booking:', error);
    
    const errorResponse = isProduction()
      ? { success: false, error: 'Internal server error' }
      : { success: false, ...formatErrorResponse(error) };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    // Await the params object
    const { id } = await params;
    await connectToDatabase();

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking
    });

  } catch (error) {
    logger.error('Error fetching booking:', error);
    
    const errorResponse = isProduction()
      ? { success: false, error: 'Internal server error' }
      : { success: false, ...formatErrorResponse(error) };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Add DELETE method if needed
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting booking:', error);
    
    const errorResponse = isProduction()
      ? { success: false, error: 'Internal server error' }
      : { success: false, ...formatErrorResponse(error) };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}