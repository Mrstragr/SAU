const express = require('express');
const { query } = require('../config/db.cjs');
const router = express.Router();

// Get overall statistics
router.get('/stats', async (req, res) => {
    try {
        const [users] = await query('SELECT COUNT(*) as count FROM Users');
        const [vehicles] = await query('SELECT COUNT(*) as count FROM Vehicles');
        const [activeVehicles] = await query("SELECT COUNT(*) as count FROM Vehicles WHERE current_status != 'offline'");
        const [trips] = await query("SELECT COUNT(*) as count FROM Trips WHERE date(created_at) = date('now')");

        res.json({
            totalUsers: users.count,
            totalVehicles: vehicles.count,
            activeVehicles: activeVehicles.count,
            todayTrips: trips.count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get trips by day (last 7 days)
router.get('/charts/trips-by-day', async (req, res) => {
    try {
        const sql = `
      SELECT date(created_at) as date, COUNT(*) as count
      FROM Trips
      WHERE created_at >= date('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY date(created_at) ASC
    `;
        const rows = await query(sql);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get popular routes
router.get('/charts/popular-routes', async (req, res) => {
    try {
        const sql = `
      SELECT start_location || ' -> ' || end_location as route, COUNT(*) as count
      FROM Trips
      GROUP BY start_location, end_location
      ORDER BY count DESC
      LIMIT 5
    `;
        const rows = await query(sql);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get driver earnings (mock calculation: $2 per trip)
router.get('/charts/earnings', async (req, res) => {
    try {
        const sql = `
      SELECT date(created_at) as date, COUNT(*) * 2 as earnings
      FROM Trips
      WHERE status = 'completed'
      AND created_at >= date('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY date(created_at) ASC
    `;
        const rows = await query(sql);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
