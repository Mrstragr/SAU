const express = require('express');
const Vehicle = require('../models/Vehicle');
const router = express.Router();

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('driverId');
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific vehicle
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('driverId');
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update vehicle
router.put('/:id', async (req, res) => {
  try {
    const { status, currentPassengers, currentLocation, batteryLevel } = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status, currentPassengers, currentLocation, batteryLevel },
      { new: true }
    );
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;