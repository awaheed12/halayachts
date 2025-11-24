import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import mongoose from 'mongoose';

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

    return NextResponse.json(serializedLocations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
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
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}