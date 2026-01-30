import React from 'react';
import { Link } from 'react-router-dom';

const GenresPage = () => {
  const genres = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance', 'Thriller'];
  
  return (
    <div className="genres-page">
      <h1>Browse by Genre</h1>
      <div className="genres-grid">
        {genres.map(genre => (
          <Link key={genre} to={`/genre/${genre.toLowerCase()}`} className="genre-card">
            {genre}
          </Link>
        ))}
      </div>
      <Link to="/" className="back-link">← Back to Home</Link>
    </div>
  );
};

export default GenresPage;