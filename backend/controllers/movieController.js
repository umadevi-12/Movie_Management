const Movie = require('../models/Movie');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all movies
// @route   GET /api/movies
// @access  Private
const getMovies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      genre,
      year,
      search,
      watched
    } = req.query;
    
    // Build query
    let query = { addedBy: req.user.id };
    
    // Filter by genre
    if (genre) {
      query.genres = genre;
    }
    
    // Filter by year
    if (year) {
      query.year = year;
    }
    
    // Filter by watched status
    if (watched !== undefined) {
      query.watched = watched === 'true';
    }
    
    // Search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const movies = await Movie.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('addedBy', 'name email avatar');
    
    const total = await Movie.countDocuments(query);
    
    // Calculate stats
    const stats = await Movie.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalMovies: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          totalRuntime: { $sum: '$duration' },
          genres: { $addToSet: '$genres' }
        }
      }
    ]);
    
    res.json({
      status: 'success',
      data: {
        movies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        stats: stats[0] || {
          totalMovies: 0,
          avgRating: 0,
          totalRuntime: 0,
          genres: []
        }
      }
    });
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Private
const getMovie = async (req, res) => {
  try {
    const movie = await Movie.findOne({
      _id: req.params.id,
      addedBy: req.user.id
    }).populate('addedBy', 'name email avatar');
    
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found'
      });
    }
    
    res.json({
      status: 'success',
      data: { movie }
    });
  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create movie
// @route   POST /api/movies
// @access  Private
const createMovie = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }
    
    const movieData = {
      ...req.body,
      addedBy: req.user.id
    };
    
    const movie = await Movie.create(movieData);
    
    // Update user's movie count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { movieCount: 1, totalWatchTime: movie.duration || 0 }
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Movie added successfully',
      data: { movie }
    });
  } catch (error) {
    console.error('Create movie error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private
const updateMovie = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }
    
    const movie = await Movie.findOneAndUpdate(
      {
        _id: req.params.id,
        addedBy: req.user.id
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Movie updated successfully',
      data: { movie }
    });
  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findOneAndDelete({
      _id: req.params.id,
      addedBy: req.user.id
    });
    
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found'
      });
    }
    
    // Update user's movie count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { movieCount: -1, totalWatchTime: -(movie.duration || 0) }
    });
    
    res.json({
      status: 'success',
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Toggle watch status
// @route   PUT /api/movies/:id/watch
// @access  Private
const toggleWatchStatus = async (req, res) => {
  try {
    const movie = await Movie.findOne({
      _id: req.params.id,
      addedBy: req.user.id
    });
    
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found'
      });
    }
    
    movie.watched = !movie.watched;
    movie.watchDate = movie.watched ? Date.now() : null;
    await movie.save();
    
    res.json({
      status: 'success',
      message: `Movie marked as ${movie.watched ? 'watched' : 'unwatched'}`,
      data: { movie }
    });
  } catch (error) {
    console.error('Toggle watch status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add to watchlist
// @route   POST /api/movies/:id/watchlist
// @access  Private
const addToWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.watchlist.includes(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Movie already in watchlist'
      });
    }
    
    user.watchlist.push(req.params.id);
    await user.save();
    
    res.json({
      status: 'success',
      message: 'Movie added to watchlist'
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user stats
// @route   GET /api/movies/stats/overview
// @access  Private
const getOverviewStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get basic stats
    const stats = await Movie.aggregate([
      { $match: { addedBy: userId } },
      {
        $group: {
          _id: null,
          totalMovies: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          totalRuntime: { $sum: '$duration' },
          watchedCount: {
            $sum: { $cond: ['$watched', 1, 0] }
          }
        }
      }
    ]);
    
    // Get genre distribution
    const genreStats = await Movie.aggregate([
      { $match: { addedBy: userId } },
      { $unwind: '$genres' },
      {
        $group: {
          _id: '$genres',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Get yearly distribution
    const yearStats = await Movie.aggregate([
      { $match: { addedBy: userId } },
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      status: 'success',
      data: {
        overview: stats[0] || {
          totalMovies: 0,
          avgRating: 0,
          totalRuntime: 0,
          watchedCount: 0
        },
        topGenres: genreStats,
        recentYears: yearStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  toggleWatchStatus,
  addToWatchlist,
  getOverviewStats
};