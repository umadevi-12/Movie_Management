const express = require('express');
const { body } = require('express-validator');
const {
  getMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  toggleWatchStatus,
  addToWatchlist,
  getOverviewStats
} = require('../controllers/movieController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Validation rules
const movieValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('year')
    .isInt({ min: 1888, max: new Date().getFullYear() + 5 })
    .withMessage('Please provide a valid year'),
  body('director').trim().notEmpty().withMessage('Director is required'),
  body('genres')
    .isArray({ min: 1 })
    .withMessage('At least one genre is required'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 minute'),
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Rating must be between 0 and 10'),
  body('personalRating')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Personal rating must be between 0 and 10')
];

// Routes
router.route('/')
  .get(getMovies)
  .post(movieValidation, createMovie);

router.route('/stats/overview')
  .get(getOverviewStats);

router.route('/:id')
  .get(getMovie)
  .put(movieValidation, updateMovie)
  .delete(deleteMovie);

router.put('/:id/watch', toggleWatchStatus);
router.post('/:id/watchlist', addToWatchlist);

module.exports = router;