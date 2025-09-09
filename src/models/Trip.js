const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startLocation: { type: String, required: true },
  endLocation: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
  rating: Number,
  feedback: String,
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);