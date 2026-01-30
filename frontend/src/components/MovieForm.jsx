import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { movieAPI } from '../services/api';
import PropTypes from 'prop-types';
import './MovieForm.css';

const MovieForm = ({ movieId, onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    genre: '',
    releaseYear: new Date().getFullYear(),
    rating: 7.0,
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const genres = [
    'Action', 'Adventure', 'Animation', 'Comedy',
    'Crime', 'Documentary', 'Drama', 'Fantasy',
    'Horror', 'Mystery', 'Romance', 'Sci-Fi',
    'Thriller', 'War', 'Western'
  ];

  // Fetch movie data if in edit mode - FIXED with useCallback
  const fetchMovieData = useCallback(async () => {
    if (!movieId) return;
    
    try {
      setLoading(true);
      const movie = await movieAPI.getMovieById(movieId);
      setFormData({
        name: movie.name,
        genre: movie.genre,
        releaseYear: movie.releaseYear,
        rating: movie.rating,
        description: movie.description || ''
      });
    } catch (error) {
      console.error('Error fetching movie:', error);
      setErrors({ fetch: 'Failed to load movie data' });
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    if (movieId) {
      setIsEditMode(true);
      fetchMovieData();
    }
  }, [movieId, fetchMovieData]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Movie name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Movie name is too long (max 100 characters)';
    }
    
    if (!formData.genre) {
      newErrors.genre = 'Please select a genre';
    }
    
    if (!formData.releaseYear) {
      newErrors.releaseYear = 'Release year is required';
    } else if (formData.releaseYear < 1888) {
      newErrors.releaseYear = 'Year must be after 1888';
    } else if (formData.releaseYear > new Date().getFullYear() + 5) {
      newErrors.releaseYear = 'Year cannot be more than 5 years in the future';
    }
    
    if (formData.rating < 0 || formData.rating > 10) {
      newErrors.rating = 'Rating must be between 0 and 10';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description is too long (max 500 characters)';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    if (name === 'releaseYear') {
      processedValue = value ? parseInt(value, 10) : '';
    } else if (name === 'rating') {
      processedValue = value ? parseFloat(value) : 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      setSubmitting(true);
      setErrors({});
      
      if (isEditMode) {
        await movieAPI.updateMovie(movieId, formData);
      } else {
        await movieAPI.createMovie(formData);
      }
      
      // Reset form if not in edit mode
      if (!isEditMode) {
        setFormData({
          name: '',
          genre: '',
          releaseYear: new Date().getFullYear(),
          rating: 7.0,
          description: ''
        });
      }
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Show success message
      setErrors({ success: `${isEditMode ? 'Movie updated' : 'Movie added'} successfully!` });
      
      // Navigate back after delay
      setTimeout(() => {
        if (isEditMode) {
          navigate('/');
        }
      }, 1500);
      
    } catch (error) {
      console.error('Submit error:', error);
      setErrors({ 
        submit: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} movie` 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (isEditMode) {
      fetchMovieData();
    } else {
      setFormData({
        name: '',
        genre: '',
        releaseYear: new Date().getFullYear(),
        rating: 7.0,
        description: ''
      });
    }
    setErrors({});
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="form-loading">
        <div className="spinner"></div>
        <p>Loading movie data...</p>
      </div>
    );
  }

  return (
    <div className="movie-form-container">
      <div className="form-header">
        <h2>{isEditMode ? '✏️ Edit Movie' : '➕ Add New Movie'}</h2>
        <p className="form-subtitle">
          {isEditMode 
            ? 'Update the movie details below' 
            : 'Fill in the details to add a new movie to your collection'
          }
        </p>
      </div>

      {errors.fetch && (
        <div className="error-message fetch-error">
          ⚠️ {errors.fetch}
          <button onClick={fetchMovieData} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {errors.success && (
        <div className="success-message">
          ✅ {errors.success}
          {isEditMode && <span> Redirecting...</span>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="movie-form">
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name" className="required">
              Movie Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter movie name"
              className={errors.name ? 'error' : ''}
              maxLength="100"
            />
            <div className="input-info">
              <span className="char-count">{formData.name.length}/100</span>
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="genre" className="required">
              Genre
            </label>
            <select
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className={errors.genre ? 'error' : ''}
            >
              <option value="">Select a genre</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            {errors.genre && <span className="error-text">{errors.genre}</span>}
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="releaseYear" className="required">
                Release Year
              </label>
              <input
                type="number"
                id="releaseYear"
                name="releaseYear"
                value={formData.releaseYear}
                onChange={handleChange}
                min="1888"
                max={new Date().getFullYear() + 5}
                className={errors.releaseYear ? 'error' : ''}
              />
              {errors.releaseYear && <span className="error-text">{errors.releaseYear}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="rating">
                Rating: <span className="rating-value">{formData.rating.toFixed(1)}/10</span>
              </label>
              <div className="rating-control">
                <input
                  type="range"
                  id="rating"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  step="0.1"
                  className="rating-slider"
                />
                <div className="rating-labels">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
              {errors.rating && <span className="error-text">{errors.rating}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="optional">(Optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter movie description..."
              rows="4"
              maxLength="500"
              className={errors.description ? 'error' : ''}
            />
            <div className="input-info">
              <span className="char-count">{formData.description.length}/500</span>
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="error-message submit-error">
            ❌ {errors.submit}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={submitting}
            className="btn-submit"
          >
            {submitting ? (
              <>
                <span className="spinner-small"></span>
                {isEditMode ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                {isEditMode ? '💾 Update Movie' : '➕ Add Movie'}
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={submitting}
            className="btn-reset"
          >
            🔄 Reset
          </button>
          
          {isEditMode && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="btn-cancel"
            >
              ↩ Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

MovieForm.propTypes = {
  movieId: PropTypes.string,
  onSuccess: PropTypes.func
};

export default MovieForm;