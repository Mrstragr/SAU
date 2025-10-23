# Backend Integration for PostgreSQL Migration

## Overview
Replace Mongoose/MongoDB with PostgreSQL using the `pg` library. Update `src/server.js` for connection and example route handler in `src/routes/vehicles.js`.

## Required Dependencies
Install `pg` and `dotenv`:
```bash
npm install pg dotenv
```

## Updated src/server.js
```javascript
/* eslint-disable no-console */
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');  // Replace mongoose with pg
require('dotenv').config();

const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const tripRoutes = require('./routes/trips');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  max: 20,  // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('PostgreSQL connected successfully!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(1);
});

// Make pool available in routes
app.set('db', pool);

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'SAU Transport API is running!' });
});
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/trips', tripRoutes);

// Socket.io connection handling (unchanged)
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join driver room
  socket.on('join_driver', (driverId) => {
    socket.join(`driver_${driverId}`);
    console.log(`Driver ${driverId} joined their room.`);
  });
  
  // Update driver status
  socket.on('driver_status_update', (data) => {
    // Broadcast status to all connected clients
    io.emit('status_updated', data);
    console.log(`Driver status updated: ${data.vehicleId} is now ${data.status}`);
  });
  
  // Update location
  socket.on('location_update', (data) => {
    // Broadcast location to all connected clients
    io.emit('location_updated', data);
    console.log(`Location updated for ${data.vehicleId}: ${data.location.address}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end(() => {
    console.log('Database pool has ended');
    process.exit(0);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Updated src/routes/vehicles.js (Example Route Handler)
```javascript
const express = require('express');
const router = express.Router();

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const pool = req.app.get('db');
    const query = `
      SELECT v.*, u.name AS driver_name, u.phone AS driver_phone
      FROM Vehicles v
      LEFT JOIN Users u ON v.driver_id = u.id
      WHERE v.is_active = true
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get specific vehicle
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.get('db');
    const query = `
      SELECT v.*, u.name AS driver_name, u.phone AS driver_phone
      FROM Vehicles v
      LEFT JOIN Users u ON v.driver_id = u.id
      WHERE v.id = $1 AND v.is_active = true
    `;
    const result = await pool.query(query, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update vehicle
router.put('/:id', async (req, res) => {
  try {
    const pool = req.app.get('db');
    const { status, currentPassengers, currentLocation, batteryLevel } = req.body;
    const query = `
      UPDATE Vehicles
      SET current_status = $1, current_passengers = $2, current_lat = $3, current_lng = $4,
          current_address = $5, battery_level = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
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
    const result = await pool.query(query, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
```

## Environment Variables (.env)
Add to `.env`:
```
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=sau_transport
DB_PASSWORD=your_password
DB_PORT=5432
```

## Notes
- Replace all Mongoose queries with parameterized SQL queries using `pool.query()`.
- Use transactions for multi-step operations (e.g., booking a ride).
- Implement authentication middleware to set `current_setting('app.current_user_id')` for RLS.
- Test thoroughly, especially concurrent operations.
