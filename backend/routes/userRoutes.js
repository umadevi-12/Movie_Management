const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path: 'watchlist',
        select: 'title poster year rating duration genres',
        options: { limit: 10 }
      });
    
    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, avatar, favoriteGenres } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        avatar,
        favoriteGenres
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');
    
    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('movieCount totalWatchTime favoriteGenres');
    
    // Get additional stats
    const Movie = require('../models/Movie');
    const movieStats = await Movie.aggregate([
      { $match: { addedBy: req.user.id } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          watchedCount: {
            $sum: { $cond: ['$watched', 1, 0] }
          },
          totalRuntime: { $sum: '$duration' }
        }
      }
    ]);
    
    const stats = movieStats[0] || {};
    
    res.json({
      status: 'success',
      data: {
        userStats: {
          movieCount: user.movieCount,
          totalWatchTime: user.totalWatchTime,
          favoriteGenres: user.favoriteGenres,
          avgRating: stats.avgRating || 0,
          watchedCount: stats.watchedCount || 0,
          totalRuntime: stats.totalRuntime || 0
        }
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;