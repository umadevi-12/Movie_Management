// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  guestLogin, 
  getMe, 
  logout 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth'); // Changed from authMiddleware to auth

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/guest', guestLogin);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;