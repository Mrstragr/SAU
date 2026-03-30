const express = require('express');
const { query, run } = require('../config/db.cjs');
const router = express.Router();

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT v.*, u.name as driver_name, u.email as driver_email
      FROM Vehicles v
      LEFT JOIN Users u ON v.driver_id = u.id
    `;
    const rows = await query(sql);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific vehicle
router.get('/:id', async (req, res) => {
  try {
    const sql = `
      SELECT v.*, u.name as driver_name, u.email as driver_email
      FROM Vehicles v
      LEFT JOIN Users u ON v.driver_id = u.id
      WHERE v.id = ?
    `;
    const rows = await query(sql, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update vehicle
router.put('/:id', async (req, res) => {
  try {
    const { status, currentPassengers, currentLocation, batteryLevel } = req.body;

    // SQLite doesn't support RETURNING in all versions/drivers easily with run(), 
    // so we update then select.
    const updateSql = `
      UPDATE Vehicles
      SET current_status = ?, current_passengers = ?, current_lat = ?, current_lng = ?, current_address = ?, battery_level = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const values = [
      status,
      currentPassengers,
      currentLocation?.lat,
      currentLocation?.lng,
      currentLocation?.address,
      batteryLevel,
      req.params.id
    ];

    const result = await run(updateSql, values);

    if (result.changes === 0) return res.status(404).json({ error: 'Vehicle not found' });

    // Fetch updated vehicle
    const getSql = `SELECT * FROM Vehicles WHERE id = ?`;
    const rows = await query(getSql, [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;