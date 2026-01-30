const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a movie title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  
  year: {
    type: Number,
    required: [true, 'Please provide release year'],
    min: [1888, 'Year must be after 1888'],
    max: [new Date().getFullYear() + 5, 'Year cannot be in the far future']
  },
  
  director: {
    type: String,
    required: [true, 'Please provide director name'],
    trim: true
  },
  
  genres: [{
    type: String,
    required: [true, 'Please provide at least one genre'],
    enum: [
      'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
      'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 
      'Horror', 'Music', 'Mystery', 'Romance', 'Sci-Fi', 
      'Thriller', 'War', 'Western'
    ]
  }],
  
  duration: {
    type: Number, // in minutes
    required: [true, 'Please provide movie duration'],
    min: [1, 'Duration must be at least 1 minute']
  },
  
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [10, 'Rating cannot be more than 10'],
    default: 0
  },
  
  poster: {
    type: String,
    default: 'https://res.cloudinary.com/demo/image/upload/v1570979130/default-movie-poster.png'
  },
  
  backdrop: {
    type: String
  },
  
  trailer: {
    type: String,
    match: [
      /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/,
      'Please provide a valid YouTube URL'
    ]
  },
  
  cast: [{
    name: String,
    character: String
  }],
  
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  watched: {
    type: Boolean,
    default: false
  },
  
  watchDate: {
    type: Date
  },
  
  personalRating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  
  review: {
    type: String,
    maxlength: [1000, 'Review cannot be more than 1000 characters']
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  isPublic: {
    type: Boolean,
    default: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted duration
movieSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Index for search
movieSchema.index({ title: 'text', description: 'text', director: 'text' });

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;