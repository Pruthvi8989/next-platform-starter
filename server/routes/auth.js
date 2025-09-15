const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendWhatsAppNotification } = require('../services/whatsappService');
const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '24h'
  });
};

// Login endpoint
router.post('/login', [
  body('userId').isLength({ min: 6, max: 6 }).withMessage('UserID must be exactly 6 digits'),
  body('password').isLength({ min: 4, max: 4 }).withMessage('Password must be exactly 4 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, password } = req.body;

    // Find user by userId
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        message: 'Account is temporarily locked due to too many failed attempts' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts and update last login
    await user.resetLoginAttempts();

    // Generate token
    const token = generateToken(user._id);

    // Send WhatsApp notification about login
    try {
      await sendWhatsAppNotification(
        user.whatsappNumber,
        `🔐 Apexture Login Alert\n\nYour account was accessed at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.\n\nIf this wasn't you, please contact support immediately.`
      );
    } catch (whatsappError) {
      console.error('WhatsApp notification failed:', whatsappError);
      // Don't fail login if WhatsApp fails
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Register endpoint (for initial setup)
router.post('/register', [
  body('userId').isLength({ min: 6, max: 6 }).withMessage('UserID must be exactly 6 digits'),
  body('password').isLength({ min: 4, max: 4 }).withMessage('Password must be exactly 4 digits'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('whatsappNumber').notEmpty().withMessage('WhatsApp number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, password, name, email, phoneNumber, whatsappNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ userId }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this UserID or email already exists' 
      });
    }

    // Create new user
    const user = new User({
      userId,
      password,
      name,
      email,
      phoneNumber,
      whatsappNumber
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({ user });

  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;