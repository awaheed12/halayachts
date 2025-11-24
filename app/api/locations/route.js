import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import mongoose from 'mongoose';
import { logger, formatErrorResponse, isProduction } from '../../../lib/utils';

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic';

// GET - All locations
export async function GET() {
  try {
    await connectToDatabase();
    
    const db = mongoose.connection.db;
    const locations = await db.collection('locations')
      .find({})
      .sort({ title: 1 })
      .toArray();
    
    const serializedLocations = locations.map(location => ({
      id: location.id,
      _id: location._id.toString(),
      title: location.title,
      image: location.image
    }));

    logger.log(`Fetched ${serializedLocations.length} locations`);

    return NextResponse.json(serializedLocations, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    logger.error('Error fetching locations:', error);
    
    const errorResponse = isProduction()
      ? { error: 'Failed to fetch locations' }
      : formatErrorResponse(error);

    return NextResponse.json(
      errorResponse,
      { status: 500 }
    );
  }
}

// POST - Create new location
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const { id, title, image } = await request.json();
    
    // Validation
    if (!id || !title || !image) {
      return NextResponse.json(
        { error: 'ID, title, and image are required' },
        { status: 400 }
      );
    }

    const db = mongoose.connection.db;
    
    // Check if location with same ID already exists
    const existingLocation = await db.collection('locations').findOne({ id });
    if (existingLocation) {
      return NextResponse.json(
        { error: 'Location with this ID already exists' },
        { status: 409 }
      );
    }

    // Create new location
    const newLocation = {
      id,
      title,
      image,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('locations').insertOne(newLocation);
    
    return NextResponse.json(
      { 
        message: 'Location created successfully',
        location: {
          _id: result.insertedId.toString(),
          ...newLocation
        }
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error creating location:', error);
    
    const errorResponse = isProduction()
      ? { error: 'Failed to create location' }
      : formatErrorResponse(error);

    return NextResponse.json(
      errorResponse,
      { status: 500 }
    );
  }
}