const express = require('express');
const Trip = require('../models/Trip');
const router = express.Router();

// Get all trips
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find().populate('vehicleId').populate('driverId').populate('studentId');
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new trip
router.post('/', async (req, res) => {
  try {
    const { vehicleId, driverId, studentId, startLocation, endLocation } = req.body;
    const newTrip = new Trip({ vehicleId, driverId, studentId, startLocation, endLocation });
    await newTrip.save();
    res.status(201).json(newTrip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update trip status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, endTime } = req.body;
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status, endTime },
      { new: true }
    );
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add feedback to a trip
router.post('/:id/feedback', async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { rating, feedback },
      { new: true }
    );
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;