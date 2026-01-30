// backend/server.js - FIXED VERSION
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// In-memory database (simple array)
const users = [
  {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    password: "password123", // Plain text for testing
    avatar: "/default-avatar.png",
    role: "user",
    createdAt: new Date()
  }
];

// ========== AUTH ROUTES ==========

// POST /api/auth/register - User Signup
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log(`📝 SIGNUP: ${email}`);
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and password'
      });
    }
    
    // Check if user exists
    const userExists = users.find(user => user.email === email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }
    
    // Create new user
    const newUser = {
      id: Date.now(),
      name,
      email,
      password, // Store as plain text for testing
      avatar: '/default-avatar.png',
      role: 'user',
      createdAt: new Date()
    };
    
    users.push(newUser);
    
    console.log(`✅ User registered: ${email}`);
    console.log(`📊 Total users: ${users.length}`);
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role,
        createdAt: newUser.createdAt
      },
      token: `token_${Date.now()}`
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
});

// POST /api/auth/login - User Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`🔐 LOGIN attempt: ${email}`);
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }
    
    // Find user
    const user = users.find(user => user.email === email);
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Check password (plain text comparison for testing)
    if (user.password !== password) {
      console.log(`❌ Wrong password for: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    console.log(`✅ Login successful: ${email}`);
    
    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt
      },
      token: `token_${Date.now()}`
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
});

// POST /api/auth/guest - Guest Login
app.post('/api/auth/guest', (req, res) => {
  try {
    console.log('🎬 GUEST login');
    
    const guestUser = {
      id: 999,
      name: 'Guest User',
      email: 'guest@moviemaster.com',
      avatar: '/default-avatar.png',
      role: 'user',
      isGuest: true,
      createdAt: new Date()
    };
    
    // Add guest to users array if not exists
    if (!users.find(u => u.email === guestUser.email)) {
      users.push(guestUser);
    }
    
    res.json({
      success: true,
      message: 'Guest login successful',
      user: guestUser,
      token: `guest_token_${Date.now()}`
    });
    
  } catch (error) {
    console.error('❌ Guest login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during guest login'
    });
  }
});

// ========== TEST ROUTES ==========

// GET /api/health - Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'MovieMaster API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    usersCount: users.length
  });
});

// GET / - Home page
app.get('/', (req, res) => {
  res.send('🎬 MovieMaster Backend API - Express 5');
});

// GET /api/test/users - List all users (for debugging)
app.get('/api/test/users', (req, res) => {
  res.json({
    success: true,
    count: users.length,
    users: users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }))
  });
});

// ========== START SERVER ==========

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('📋 AVAILABLE ENDPOINTS:');
  console.log(`✅ GET  http://localhost:${PORT}/api/health`);
  console.log(`✅ POST http://localhost:${PORT}/api/auth/register`);
  console.log(`✅ POST http://localhost:${PORT}/api/auth/login`);
  console.log(`✅ POST http://localhost:${PORT}/api/auth/guest`);
  console.log(`✅ GET  http://localhost:${PORT}/api/test/users`);
  console.log('='.repeat(50));
  console.log('👤 TEST CREDENTIALS:');
  console.log('   Email: test@example.com');
  console.log('   Password: password123');
  console.log('='.repeat(50));
});