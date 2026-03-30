const express = require('express');
const Trip = require('../models/Trip.cjs');
const { query } = require('../config/db.cjs');
const router = express.Router();

// Get all trips
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find();
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new trip
router.post('/', async (req, res) => {
  try {
    let { vehicleId, driverId, studentId, startLocation, endLocation } = req.body;

    // Auto-assign vehicle if not provided
    if (!vehicleId) {
      const availableVehicles = await query("SELECT id, driver_id FROM Vehicles WHERE current_status = 'waiting' LIMIT 1");
      if (availableVehicles.length === 0) {
        return res.status(400).json({ error: 'No available vehicles at the moment' });
      }
      vehicleId = availableVehicles[0].id;
      driverId = availableVehicles[0].driver_id;
    }

    const tripId = await Trip.create({ vehicleId, driverId, studentId, startLocation, endLocation });

    // Update vehicle status to 'confirm' (assigned)
    // We should probably do this transactionally, but for now separate query is fine
    // Actually, let's keep it simple. The driver accepts it to make it 'confirm'.
    // But wait, if we assign it, we should probably reserve it?
    // The current flow seems to be: Student books -> Trip Pending -> Driver Accepts -> Trip In-Progress.
    // So vehicle status should probably stay 'waiting' until driver accepts?
    // Or maybe 'confirm' means "Driver has a trip request"?
    // Let's check DriverDashboard logic.
    // DriverDashboard shows "Pending Trips".
    // So we just create the trip. The vehicle status doesn't change yet.

    const newTrip = await Trip.findById(tripId);

    // Notify driver
    const io = req.app.get('io');
    if (io) {
      io.to(`driver_${driverId}`).emit('trip_request', newTrip);
      // Also broadcast to all for dashboard updates if needed, or just rely on polling/invalidation
      io.emit('trips_updated');
    }

    res.status(201).json(newTrip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update trip status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, endTime } = req.body;
    const trip = await Trip.updateStatus(req.params.id, status, endTime);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    // Notify student
    const io = req.app.get('io');
    if (io) {
      io.to(`student_${trip.studentId}`).emit('trip_status_update', {
        tripId: trip.id,
        status: trip.status,
        message: `Your trip status is now: ${trip.status}`
      });
      io.emit('trips_updated');
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add feedback to a trip
router.post('/:id/feedback', async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const trip = await Trip.addFeedback(req.params.id, rating, feedback);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;