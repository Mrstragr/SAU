const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  licenseNumber: { type: String, required: true, unique: true },
  rating: { type: Number, default: 5 },
  totalTrips: { type: Number, default: 0 },
  isOnline: { type: Boolean, default: false },
  currentLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  currentStatus: { type: String, enum: ['waiting', 'confirm', 'offline'], default: 'offline' },
  currentPassengers: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);