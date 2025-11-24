import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // Charter Details
  charterType: {
    type: String,
    required: true,
    enum: ['day', 'multiday']
  },
  yachtTitle: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  
  // Day Charter Fields
  duration: String,
  date: Date,
  time: String,
  
  // Multiday Charter Fields
  checkInDate: Date,
  checkOutDate: Date,
  numberOfNights: Number,
  
  // Passenger Details
  passengers: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Customer Details
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    default: ''
  },
  
  // System Fields
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  bookingReference: {
    type: String,
    unique: true
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Generate booking reference before saving
bookingSchema.pre('save', async function(next) {
  if (!this.bookingReference) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingReference = `HALA-${Date.now()}-${count + 1}`;
  }
  next();
});

// Check if model already exists to prevent OverwriteModelError
export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);