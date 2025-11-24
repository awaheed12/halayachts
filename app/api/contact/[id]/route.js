import { connectToDatabase } from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";
import mongoose from "mongoose";
import { logger, formatErrorResponse, isProduction } from "@/lib/utils";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const buildResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const validateId = (id) => mongoose.Types.ObjectId.isValid(id);

export async function GET(_request, { params }) {
  await connectToDatabase();
  const { id } = await params;

  if (!validateId(id)) {
    return buildResponse({ success: false, error: "Invalid message id" }, 400);
  }

  try {
    const message = await ContactMessage.findById(id).lean();
    if (!message) {
      return buildResponse({ success: false, error: "Message not found" }, 404);
    }

    return buildResponse({
      success: true,
      data: {
        id: message._id.toString(),
        firstName: message.firstName,
        lastName: message.lastName,
        email: message.email,
        phone: message.phone,
        countryCode: message.countryCode,
        message: message.message,
        isRead: message.isRead,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      },
    });
  } catch (error) {
    logger.error("Error fetching contact message:", error);
    
    const errorResponse = isProduction()
      ? { success: false, error: "Failed to fetch message" }
      : { success: false, ...formatErrorResponse(error) };

    return buildResponse(errorResponse, 500);
  }
}

export async function PUT(request, { params }) {
  await connectToDatabase();
  const { id } = await params;

  if (!validateId(id)) {
    return buildResponse({ success: false, error: "Invalid message id" }, 400);
  }

  try {
    const body = await request.json();
    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "countryCode",
      "message",
      "isRead",
    ];

    const updatePayload = {};
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        if (typeof body[field] === "string") {
          updatePayload[field] = body[field].trim();
        } else {
          updatePayload[field] = body[field];
        }
      }
    });

    const updated = await ContactMessage.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return buildResponse({ success: false, error: "Message not found" }, 404);
    }

    return buildResponse({
      success: true,
      data: {
        id: updated._id.toString(),
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        phone: updated.phone,
        countryCode: updated.countryCode,
        message: updated.message,
        isRead: updated.isRead,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    logger.error("Error updating contact message:", error);
    
    const errorResponse = isProduction()
      ? { success: false, error: "Failed to update message" }
      : { success: false, ...formatErrorResponse(error) };

    return buildResponse(errorResponse, 500);
  }
}

export async function DELETE(_request, { params }) {
  await connectToDatabase();
  const { id } = await params;

  if (!validateId(id)) {
    return buildResponse({ success: false, error: "Invalid message id" }, 400);
  }

  try {
    const deleted = await ContactMessage.findByIdAndDelete(id);

    if (!deleted) {
      return buildResponse({ success: false, error: "Message not found" }, 404);
    }

    return buildResponse({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting contact message:", error);
    
    const errorResponse = isProduction()
      ? { success: false, error: "Failed to delete message" }
      : { success: false, ...formatErrorResponse(error) };

    return buildResponse(errorResponse, 500);
  }
}


