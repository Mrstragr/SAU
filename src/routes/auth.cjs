const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User.cjs');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, studentId, department, year } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create user
    const userId = await User.create({ name, email, phone, password, role, studentId, department, year });

    // Get created user
    const user = await User.findById(userId);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production');
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);

    if (!user || !(await User.comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production');
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
