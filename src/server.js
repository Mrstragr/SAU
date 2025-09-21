/* eslint-disable no-console */
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
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

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
connectDB();

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'SAU Transport API is running!' });
});
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/trips', tripRoutes);

// Socket.io connection handling
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

// Start the server using http.listen() instead of app.listen()
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});