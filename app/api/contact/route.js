import { connectToDatabase } from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";

// Save a new contact message
export async function POST(request) {
  await connectToDatabase();

  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      countryCode,
      message,
    } = body || {};

    if (!firstName || !lastName || !email || !phone || !countryCode || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "All fields are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const newMessage = await ContactMessage.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      countryCode: countryCode.trim(),
      message: message.trim(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: newMessage._id.toString(),
          createdAt: newMessage.createdAt,
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error saving contact message:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to submit contact form",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// (Optional) List messages for admin usage
export async function GET() {
  await connectToDatabase();

  try {
    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .lean();

    const formatted = messages.map((m) => ({
      id: m._id.toString(),
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      phone: m.phone,
      countryCode: m.countryCode,
      message: m.message,
      isRead: m.isRead,
      createdAt: m.createdAt,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: formatted,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error fetching contact messages",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}


