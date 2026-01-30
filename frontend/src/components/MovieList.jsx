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

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await movieAPI.getAllMovies();

      let moviesArray = [];

      if (Array.isArray(data)) {
        moviesArray = data;
      } else if (data?.data && Array.isArray(data.data)) {
        moviesArray = data.data;
      } else if (data?.movies && Array.isArray(data.movies)) {
        moviesArray = data.movies;
      } else {
        moviesArray = [];
      }

      setMovies(moviesArray);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError(`Failed to load movies. Please try again.`);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies, refreshTrigger]);

  const handleDelete = async (id) => {
    try {
      await movieAPI.deleteMovie(id);
      setMovies(prev => prev.filter(movie => movie._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete movie');
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      const updatedMovie = await movieAPI.updateMovie(id, updatedData);
      setMovies(prev =>
        prev.map(movie => (movie._id === id ? updatedMovie : movie))
      );
      return updatedMovie;
    } catch (err) {
      console.error('Update error:', err);
      throw err;
    }
  };

  const uniqueGenres = React.useMemo(() => {
    const genres = movies
      .map(movie => movie?.genre)
      .filter(Boolean);
    return ['all', ...new Set(genres)];
  }, [movies]);

  const filteredAndSortedMovies = React.useMemo(() => {
    return movies
      .filter(movie => {
        const matchesSearch =
          movie.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movie.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesGenre =
          filterGenre === 'all' || movie.genre === filterGenre;

        return matchesSearch && matchesGenre;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
        if (sortBy === 'year') comparison = a.releaseYear - b.releaseYear;
        if (sortBy === 'rating') comparison = a.rating - b.rating;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [movies, searchTerm, filterGenre, sortBy, sortOrder]);

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
      <h1 className="page-title">🎬 Movie Collection</h1>

      {/* ✅ ERROR IS NOW USED */}
      {error && (
        <div className="error-banner">
          ❌ {error}
        </div>
      )}

      {filteredAndSortedMovies.length === 0 ? (
        <p>No movies found.</p>
      ) : (
        <div className="movies-grid">
          {filteredAndSortedMovies.map(movie => (
            <MovieCard
              key={movie._id}
              movie={movie}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              isEditing={selectedMovieId === movie._id}
              onCancelEdit={() => setSelectedMovieId(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieList;
