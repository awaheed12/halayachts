import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic';

// GET - Fetch yacht by ID or slug
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const { connection } = await connectToDatabase();
    const db = connection.db || connection;
    
    let yacht = null;
    
    // Check if it's a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    if (isValidObjectId) {
      // Try to find by MongoDB _id
      try {
        yacht = await db.collection('yachts').findOne({ 
          _id: new ObjectId(id) 
        });
      } catch (objectIdError) {
        // If ObjectId conversion fails, treat as slug
        console.log('ObjectId conversion failed, treating as slug');
      }
    }
    
    // If not found by ID, try to find by slug
    if (!yacht) {
      // Try to find by slug
      yacht = await db.collection('yachts').findOne({ slug: id });
      
      // If not found by slug, try slugs array
      if (!yacht) {
        yacht = await db.collection('yachts').findOne({ slugs: { $in: [id] } });
      }
    }

    if (!yacht) {
      return NextResponse.json(
        { error: 'Yacht not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(yacht);
  } catch (error) {
    console.error('Error fetching yacht:', error);
    return NextResponse.json(
      { error: 'Failed to fetch yacht' },
      { status: 500 }
    );
  }
}

// PUT - Update yacht
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
    const { connection } = await connectToDatabase();
    const db = connection.db || connection;
    
    const updateData = await request.json();
    
    // Remove _id from update data if present
    delete updateData._id;
    
    // Check if yacht exists
    const existingYacht = await db.collection('yachts').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!existingYacht) {
      return NextResponse.json(
        { error: 'Yacht not found' },
        { status: 404 }
      );
    }

    // If slug is being updated, check for conflicts
    if (updateData.slug && updateData.slug !== existingYacht.slug) {
      const slugConflict = await db.collection('yachts').findOne({ 
        _id: { $ne: new ObjectId(id) },
        $or: [
          { slug: updateData.slug },
          { slugs: { $in: [updateData.slug] } }
        ]
      });
      
      if (slugConflict) {
        return NextResponse.json(
          { error: 'Yacht with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Update yacht
    const updatePayload = {
      ...updateData,
      updatedAt: new Date()
    };

    const result = await db.collection('yachts').updateOne(
      { _id: new ObjectId(id) },
      { $set: updatePayload }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update yacht' },
        { status: 500 }
      );
    }

    const updatedYacht = await db.collection('yachts').findOne({ 
      _id: new ObjectId(id) 
    });

    return NextResponse.json({
      success: true,
      message: 'Yacht updated successfully',
      yacht: updatedYacht
    });
  } catch (error) {
    console.error('Error updating yacht:', error);
    return NextResponse.json(
      { error: 'Failed to update yacht' },
      { status: 500 }
    );
  }
}

// DELETE - Delete yacht
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const { connection } = await connectToDatabase();
    const db = connection.db || connection;
    
    // Check if yacht exists
    const existingYacht = await db.collection('yachts').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!existingYacht) {
      return NextResponse.json(
        { error: 'Yacht not found' },
        { status: 404 }
      );
    }

    // Delete yacht
    const result = await db.collection('yachts').deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete yacht' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Yacht deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting yacht:', error);
    return NextResponse.json(
      { error: 'Failed to delete yacht' },
      { status: 500 }
    );
  }
}

