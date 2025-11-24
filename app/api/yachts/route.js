import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { connection } = await connectToDatabase();
    const db = connection.db || connection;
    
    const yachts = await db.collection('yachts').find({}).toArray();
    
    console.log('Fetched yachts count:', yachts.length); // Debug log
    
    return NextResponse.json(yachts);
  } catch (error) {
    console.error('Error fetching yachts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch yachts' },
      { status: 500 }
    );
  }
}

// POST - Create new yacht
export async function POST(request) {
  try {
    const { connection } = await connectToDatabase();
    const db = connection.db || connection;
    
    const yachtData = await request.json();
    
    // Validation - required fields
    if (!yachtData.title || !yachtData.slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    // Check if yacht with same slug already exists
    const existingYacht = await db.collection('yachts').findOne({ 
      $or: [
        { slug: yachtData.slug },
        { slugs: { $in: [yachtData.slug] } }
      ]
    });
    
    if (existingYacht) {
      return NextResponse.json(
        { error: 'Yacht with this slug already exists' },
        { status: 409 }
      );
    }

    // Create new yacht with timestamps
    const newYacht = {
      ...yachtData,
      status: yachtData.status || 'published', // Default to 'published' if not provided
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('yachts').insertOne(newYacht);
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Yacht created successfully',
        yacht: {
          _id: result.insertedId.toString(),
          ...newYacht
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating yacht:', error);
    return NextResponse.json(
      { error: 'Failed to create yacht' },
      { status: 500 }
    );
  }
}