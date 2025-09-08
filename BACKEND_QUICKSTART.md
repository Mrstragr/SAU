# 🚀 Backend Quick Start Guide

## ⚡ **Get Started in 30 Minutes**

### **Step 1: Create Backend Directory**
```bash
# Create a new directory for backend
mkdir sau-transport-backend
cd sau-transport-backend

# Initialize Git repository
git init
git remote add origin https://github.com/YOUR_USERNAME/sau-transport-backend.git
```

### **Step 2: Set Up Node.js Project**
```bash
# Initialize npm project
npm init -y

# Install core dependencies
npm install express mongoose bcryptjs jsonwebtoken cors socket.io dotenv

# Install development dependencies
npm install -D nodemon

# Create basic folder structure
mkdir src
mkdir src/models
mkdir src/routes
mkdir src/controllers
mkdir src/middleware
mkdir src/config
```

### **Step 3: Create Basic Server**
Create `src/server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'SAU Transport API is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### **Step 4: Set Up MongoDB Atlas**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create new cluster
4. Get connection string
5. Create `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### **Step 5: Create Package.json Scripts**
Update `package.json`:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### **Step 6: Test Your Setup**
```bash
# Start development server
npm run dev
```

Visit `http://localhost:5000` - you should see the API message!

## 🔐 **Authentication System (Next Priority)**

### **Create User Model** (`src/models/User.js`):
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'driver', 'admin'], default: 'student' },
  studentId: String,
  department: String,
  year: Number,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('User', userSchema);
```

### **Create Auth Routes** (`src/routes/auth.js`):
```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, studentId, department, year } = req.body;
    
    const user = new User({
      name, email, phone, password, role, studentId, department, year
    });
    
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ token, user: { id: user._id, name, email, role } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
```

## 🚗 **Vehicle Management (Core Feature)**

### **Create Vehicle Model** (`src/models/Vehicle.js`):
```javascript
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
```

### **Create Vehicle Routes** (`src/routes/vehicles.js`):
```javascript
const express = require('express');
const Vehicle = require('../models/Vehicle');
const router = express.Router();

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('driverId', 'name phone');
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

// Update vehicle status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, currentPassengers, currentLocation } = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status, currentPassengers, currentLocation },
      { new: true }
    );
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## 🔄 **Real-time Updates (WebSocket)**

### **Add Socket.io to Server**:
```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join driver room
  socket.on('join_driver', (driverId) => {
    socket.join(`driver_${driverId}`);
  });
  
  // Update driver status
  socket.on('driver_status_update', (data) => {
    io.emit('status_updated', data);
  });
  
  // Update location
  socket.on('location_update', (data) => {
    io.emit('location_updated', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
```

## 🚀 **Deploy to Railway (Free)**

### **Step 1: Create Railway Account**
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Create new project

### **Step 2: Connect Repository**
1. Connect your GitHub repository
2. Railway will auto-detect Node.js
3. Set environment variables

### **Step 3: Deploy**
Railway will automatically deploy your app!

## 📱 **Connect Frontend**

### **Update Frontend API Calls**:
Replace mock data with real API calls:

```javascript
// In your React components
const API_BASE = 'https://your-railway-app.railway.app/api';

// Fetch vehicles
const fetchVehicles = async () => {
  const response = await fetch(`${API_BASE}/vehicles`);
  const vehicles = await response.json();
  setVehicles(vehicles);
};

// Update driver status
const updateDriverStatus = async (driverId, status) => {
  await fetch(`${API_BASE}/vehicles/${driverId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
};
```

## 🎯 **Next Steps After Quick Start**

1. **Complete all API endpoints** (vehicles, drivers, trips)
2. **Add authentication middleware**
3. **Implement real-time features**
4. **Add error handling and validation**
5. **Connect to frontend**
6. **Deploy to production**

## 💡 **Pro Tips**

- **Use environment variables** for all sensitive data
- **Add input validation** with libraries like Joi
- **Implement rate limiting** for API protection
- **Add logging** for debugging
- **Use TypeScript** for better code quality
- **Add unit tests** for critical functions

**Your backend will be ready in 30 minutes! 🚀**
