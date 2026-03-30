const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  capacity: { type: Number, default: 4 },
  isEcoFriendly: { type: Boolean, default: true },
  batteryLevel: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true },
  currentLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  status: { type: String, enum: ['waiting', 'confirm', 'offline'], default: 'offline' },
  currentPassengers: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);