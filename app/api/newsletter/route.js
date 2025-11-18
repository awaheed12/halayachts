import { connectToDatabase } from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";

export async function POST(req) {
  await connectToDatabase();

  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "Valid email address is required" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const exists = await Subscriber.findOne({ email });
    if (exists) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "This email is already subscribed to Hala Yachts newsletter!" 
      }), { 
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await Subscriber.create({ email });
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Welcome to Hala Yachts! You have successfully subscribed to our luxury newsletter." 
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Newsletter Error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: "We are experiencing technical issues. Please try again later." 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  await connectToDatabase();

  try {
    const subscribersCount = await Subscriber.countDocuments();
    const recentSubscribers = await Subscriber.find()
      .sort({ createdAt: -1 })
      .limit(5);

    return new Response(JSON.stringify({ 
      success: true,
      data: {
        totalSubscribers: subscribersCount,
        recentSubscribers: recentSubscribers.map(sub => ({
          email: sub.email,
          subscribedAt: sub.createdAt
        }))
      }
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: "Failed to fetch subscribers data" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}