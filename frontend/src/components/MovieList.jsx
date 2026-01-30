import React, { useState, useEffect, useCallback } from 'react';
import MovieCard from './MovieCard';
import { movieAPI } from '../services/api';
import './MovieList.css';

const MovieList = ({ refreshTrigger }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  // Fetch movies with proper error handling
  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching movies...'); // Debug log
      const data = await movieAPI.getAllMovies();
      console.log('Received data:', data, 'Type:', typeof data); // Debug log
      
      // Handle different response formats
      let moviesArray = [];
      
      if (Array.isArray(data)) {
        // Data is already an array
        moviesArray = data;
      } else if (data && typeof data === 'object') {
        // Check for common API response patterns
        if (Array.isArray(data.data)) {
          moviesArray = data.data; // axios response pattern
        } else if (Array.isArray(data.movies)) {
          moviesArray = data.movies; // custom API pattern
        } else if (Array.isArray(data.results)) {
          moviesArray = data.results; // another common pattern
        } else {
          // If it's an object with movie properties but not an array
          console.warn('Unexpected data format, converting to array:', data);
          moviesArray = Object.values(data);
        }
      } else if (data === null || data === undefined) {
        // Handle null/undefined responses
        console.warn('API returned null or undefined');
        moviesArray = [];
      } else {
        // Unexpected format
        console.error('Unexpected API response:', data);
        throw new Error(`Unexpected response format: ${typeof data}`);
      }
      
      // Ensure we have an array before setting state
      if (!Array.isArray(moviesArray)) {
        console.error('Failed to extract array from response:', moviesArray);
        moviesArray = [];
      }
      
      console.log('Setting movies array:', moviesArray); // Debug log
      setMovies(moviesArray);
      
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError(`Failed to load movies: ${err.message || 'Please try again later.'}`);
      setMovies([]); // Always set to empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies, refreshTrigger]);

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await movieAPI.deleteMovie(id);
      setMovies(prev => {
        if (Array.isArray(prev)) {
          return prev.filter(movie => movie._id !== id);
        }
        return [];
      });
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete movie');
    }
  };

  // Handle update
  const handleUpdate = async (id, updatedData) => {
    try {
      const updatedMovie = await movieAPI.updateMovie(id, updatedData);
      setMovies(prev => {
        if (Array.isArray(prev)) {
          return prev.map(movie => 
            movie._id === id ? updatedMovie : movie
          );
        }
        return [];
      });
      return updatedMovie;
    } catch (err) {
      console.error('Update error:', err);
      throw err;
    }
  };

  // Get unique genres with safety checks
  const uniqueGenres = React.useMemo(() => {
    if (!Array.isArray(movies) || movies.length === 0) {
      return ['all'];
    }
    
    const genres = movies
      .map(movie => movie?.genre)
      .filter(genre => genre && typeof genre === 'string');
    
    return ['all', ...new Set(genres)];
  }, [movies]);

  // Filter and sort movies with safety checks
  const filteredAndSortedMovies = React.useMemo(() => {
    if (!Array.isArray(movies) || movies.length === 0) {
      return [];
    }
    
    const filtered = movies.filter(movie => {
      if (!movie || typeof movie !== 'object') return false;
      
      const movieName = movie.name || '';
      const movieDescription = movie.description || '';
      const movieGenre = movie.genre || '';
      
      const matchesSearch = searchTerm === '' || 
        movieName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movieDescription.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGenre = filterGenre === 'all' || movieGenre === filterGenre;
      
      return matchesSearch && matchesGenre;
    });
    
    // Sort with safety checks
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      const aName = a.name || '';
      const bName = b.name || '';
      const aYear = a.releaseYear || 0;
      const bYear = b.releaseYear || 0;
      const aRating = a.rating || 0;
      const bRating = b.rating || 0;
      
      switch (sortBy) {
        case 'name':
          comparison = aName.localeCompare(bName);
          break;
        case 'year':
          comparison = aYear - bYear;
          break;
        case 'rating':
          comparison = aRating - bRating;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [movies, searchTerm, filterGenre, sortBy, sortOrder]);

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setSelectedMovieId(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading movies...</p>
      </div>
    );
  }

  return (
    <div className="movie-list-container">
      <div className="movie-list-header">
        <h1 className="page-title">🎬 Movie Collection</h1>
        <div className="stats">
          <span className="stat-item">
            <strong>Total:</strong> {Array.isArray(movies) ? movies.length : 0} movies
          </span>
          <span className="stat-item">
            <strong>Showing:</strong> {filteredAndSortedMovies.length}
          </span>
        </div>
      </div>

      

      {/* Search and Filters */}
      <div className="controls-panel">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search movies by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="clear-search"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="genre-filter">Filter by Genre:</label>
            <select
              id="genre-filter"
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="filter-select"
            >
              {uniqueGenres.map(genre => (
                <option key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre}
                </option>
              ))}
            </select>
          </div>

          <div className="sort-controls">
            <span className="sort-label">Sort by:</span>
            <div className="sort-buttons">
              <button
                onClick={() => handleSort('name')}
                className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
              >
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('year')}
                className={`sort-btn ${sortBy === 'year' ? 'active' : ''}`}
              >
                Year {sortBy === 'year' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('rating')}
                className={`sort-btn ${sortBy === 'rating' ? 'active' : ''}`}
              >
                Rating {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {!Array.isArray(filteredAndSortedMovies) || filteredAndSortedMovies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎥</div>
          <h3>No movies found</h3>
          <p>
            {searchTerm || filterGenre !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : Array.isArray(movies) && movies.length === 0
                ? 'Add your first movie to get started!'
                : 'No movies available'
            }
          </p>
          {searchTerm && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterGenre('all');
              }}
              className="reset-filters-btn"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="movies-grid">
          {filteredAndSortedMovies.map(movie => {
            if (!movie || !movie._id) {
              console.warn('Invalid movie object:', movie);
              return null;
            }
            
            return (
              <MovieCard
                key={movie._id}
                movie={movie}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                isEditing={selectedMovieId === movie._id}
                onCancelEdit={handleEditCancel}
              />
            );
          })}
        </div>
      )}

      {/* Stats Footer */}
      {Array.isArray(filteredAndSortedMovies) && filteredAndSortedMovies.length > 0 && (
        <div className="list-footer">
          <div className="average-rating">
            <strong>Average Rating:</strong>{' '}
            {(filteredAndSortedMovies.reduce((sum, movie) => sum + (movie.rating || 0), 0) / filteredAndSortedMovies.length).toFixed(1)}
            /10
          </div>
          <div className="year-range">
            <strong>Year Range:</strong>{' '}
            {Math.min(...filteredAndSortedMovies.map(m => m.releaseYear || 0))} -{' '}
            {Math.max(...filteredAndSortedMovies.map(m => m.releaseYear || 0))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieList;