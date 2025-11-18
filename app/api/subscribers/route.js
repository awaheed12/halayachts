import { connectToDatabase } from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";

export async function GET() {
  await connectToDatabase();

  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    
    // Frontend ke format mein data return karein
    const formattedSubscribers = subscribers.map(sub => ({
      _id: sub._id.toString(),
      email: sub.email,
      name: sub.name || '',
      subscribedAt: sub.createdAt,
      status: 'active',
      source: sub.source || 'hala-yachts-website'
    }));

    return new Response(JSON.stringify({ 
      success: true, 
      data: formattedSubscribers 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Error fetching subscribers" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  await connectToDatabase();

  try {
    const body = await request.json();
    const { email, name = '' } = body;

    if (!email) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Email is required" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if subscriber already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Subscriber already exists" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create new subscriber
    const newSubscriber = new Subscriber({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      source: 'admin'
    });

    await newSubscriber.save();

    return new Response(JSON.stringify({ 
      success: true, 
      data: {
        _id: newSubscriber._id.toString(),
        email: newSubscriber.email,
        name: newSubscriber.name,
        subscribedAt: newSubscriber.createdAt,
        status: 'active',
        source: 'admin'
      }
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error adding subscriber:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Failed to add subscriber" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(request) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Email parameter is required" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await Subscriber.deleteOne({ email });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Subscriber not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Subscriber deleted successfully" 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error deleting subscriber:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Failed to delete subscriber" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}