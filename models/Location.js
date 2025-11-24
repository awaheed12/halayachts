import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for better performance
LocationSchema.index({ id: 1 });
LocationSchema.index({ title: 1 });

export default mongoose.models.Location || mongoose.model('Location', LocationSchema);