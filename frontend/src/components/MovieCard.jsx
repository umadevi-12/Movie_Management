import React, { useState } from 'react';
import './MovieCard.css';

const MovieCard = ({ 
  movie, 
  onDelete, 
  onUpdate, 
  onTrailerClick,
  onEdit,
  isEditing,
  onSave,
  onCancel,
  showDeleteConfirm,
  onConfirmDelete,
  onCancelDelete
}) => {
  const [editedMovie, setEditedMovie] = useState({ ...movie });

  // Removed unused functions: handleInputChange, handleSave, handleCancel
  // These were likely used in an edit mode that's not implemented in this version

  const handleTrailerClick = (e) => {
    e.stopPropagation();
    if (movie.trailerUrl) {
      onTrailerClick(movie.trailerUrl);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(movie);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onConfirmDelete(movie._id);
  };

  const handleConfirmDelete = (e) => {
    e.stopPropagation();
    onDelete(movie._id);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    onCancelDelete();
  };

  return (
    <div className="movie-card">
      <div className="movie-poster">
        <img 
          src={movie.image} 
          alt={movie.name}
          className="movie-poster-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x450/333/666?text=No+Image';
            e.target.className = 'movie-poster-img placeholder';
          }}
        />
        <div className="movie-poster-overlay">
          {movie.trailerUrl && (
            <button 
              className="trailer-play-btn"
              onClick={handleTrailerClick}
              title="Watch Trailer"
            >
              ▶
            </button>
          )}
          <div className="movie-rating-overlay">
            ⭐ {movie.rating.toFixed(1)}
          </div>
        </div>
      </div>
      
      <div className="movie-info">
        <div className="movie-header">
          <h3 className="movie-title">{movie.name}</h3>
          <div className="movie-meta">
            <span className="movie-year">{movie.releaseYear}</span>
            <span className="movie-genre">{movie.genre}</span>
            {movie.runtime && (
              <span className="movie-runtime">⏱️ {movie.runtime} min</span>
            )}
          </div>
        </div>
        
        <p className="movie-description">
          {movie.description.length > 120 
            ? `${movie.description.substring(0, 120)}...` 
            : movie.description}
        </p>
        
        <div className="movie-actions">
          <button 
            onClick={handleEditClick}
            className="action-btn edit-btn"
          >
            ✏️ Edit
          </button>
          <button 
            onClick={handleDeleteClick}
            className="action-btn delete-btn"
          >
            🗑 Delete
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="delete-confirmation-card">
            <p>Are you sure you want to delete this movie?</p>
            <div className="delete-confirm-buttons">
              <button 
                onClick={handleConfirmDelete}
                className="confirm-btn"
              >
                Yes, Delete
              </button>
              <button 
                onClick={handleCancelDelete}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;