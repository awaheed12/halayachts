import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { logger, formatErrorResponse, isProduction } from '../../../../lib/utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Single location by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params; // 
    
    await connectToDatabase();
    
    const db = mongoose.connection.db;
    const location = await db.collection('locations').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    const serializedLocation = {
      id: location.id,
      _id: location._id.toString(),
      title: location.title,
      image: location.image
    };

    return NextResponse.json(serializedLocation);
  } catch (error) {
    logger.error('Error fetching location:', error);
    
    const errorResponse = isProduction()
      ? { error: 'Failed to fetch location' }
      : formatErrorResponse(error);

    return NextResponse.json(
      errorResponse,
      { status: 500 }
    );
  }
}

// PUT - Update location
export async function PUT(request, { params }) {
  try {
    const { id } = await params; // 
    
    await connectToDatabase();
    
    const { title, image } = await request.json();
    
    // Validation
    if (!title || !image) {
      return NextResponse.json(
        { error: 'Title and image are required' },
        { status: 400 }
      );
    }

    const db = mongoose.connection.db;
    
    // Check if location exists
    const existingLocation = await db.collection('locations').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!existingLocation) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    // Update location
    const updateData = {
      title,
      image,
      updatedAt: new Date()
    };

    const result = await db.collection('locations').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update location' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Location updated successfully',
      location: {
        _id: id,
        id: existingLocation.id,
        title,
        image
      }
    });
  } catch (error) {
    logger.error('Error updating location:', error);
    
    const errorResponse = isProduction()
      ? { error: 'Failed to update location' }
      : formatErrorResponse(error);

    return NextResponse.json(
      errorResponse,
      { status: 500 }
    );
  }
}

// DELETE - Delete location
export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // ✅ Await params
    
    await connectToDatabase();

    const db = mongoose.connection.db;
    
    // Check if location exists
    const existingLocation = await db.collection('locations').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!existingLocation) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    // Delete location
    const result = await db.collection('locations').deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete location' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Location deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting location:', error);
    
    const errorResponse = isProduction()
      ? { error: 'Failed to delete location' }
      : formatErrorResponse(error);

    return NextResponse.json(
      errorResponse,
      { status: 500 }
    );
  }
}