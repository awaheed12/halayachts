import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  status: { type: String, default: "active" },
  source: { type: String, default: "hala-yachts-website" }
}, {
  timestamps: true //  createdAt and updatedAt automatically
});

export default mongoose.models.Subscriber ||
  mongoose.model("Subscriber", subscriberSchema);