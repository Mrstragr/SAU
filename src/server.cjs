/* eslint-disable no-console */
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.cjs');
const vehicleRoutes = require('./routes/vehicles.cjs');
const tripRoutes = require('./routes/trips.cjs');

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

// Database connection
const { query, run } = require('./config/db.cjs');

// Make db helpers available globally or via app.locals if needed, 
// but for now we will just use require in routes.
// We can attach to app.locals for consistency if routes expect it, 
// but routes currently seem to import 'pool' or similar. 
// We will update routes to import from config/db.js directly.

// Test connection
query('SELECT 1').then(() => {
  console.log('SQLite connected successfully!');
}).catch(err => {
  console.error('Unable to connect to SQLite:', err);
  process.exit(1);
});

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'SAU Transport API is running!' });
});
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/analytics', require('./routes/analytics.cjs'));

// Make io accessible to routes
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join driver room
  socket.on('join_driver', (driverId) => {
    socket.join(`driver_${driverId}`);
    console.log(`Driver ${driverId} joined their room.`);
  });

  // Join student room
  socket.on('join_student', (studentId) => {
    socket.join(`student_${studentId}`);
    console.log(`Student ${studentId} joined their room.`);
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

// Start the server using http.listen() instead of app.listen()
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});