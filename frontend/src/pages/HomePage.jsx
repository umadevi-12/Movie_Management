import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MovieList from '../components/MovieList';
import movieAPI from '../services/api';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    topGenre: '',
    totalRuntime: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [movies, setMovies] = useState([]);
  const [user, setUser] = useState('');

  // SAMPLE MOVIES - Ensure these are available
  const sampleMovies = [
    {
      _id: '1',
      name: 'The Shawshank Redemption',
      genre: 'Drama',
      releaseYear: 1994,
      rating: 9.3,
      runtime: 142,
      description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      image: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_FMjpg_UX1000_.jpg',
      trailerUrl: 'https://www.youtube.com/embed/6hB3S9bIaco'
    },
    {
      _id: '2',
      name: 'The Godfather',
      genre: 'Crime',
      releaseYear: 1972,
      rating: 9.2,
      runtime: 175,
      description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
      image: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_FMjpg_UX1000_.jpg',
      trailerUrl: 'https://www.youtube.com/embed/sY1S34973zA'
    },
    {
      _id: '3',
      name: 'The Dark Knight',
      genre: 'Action',
      releaseYear: 2008,
      rating: 9.0,
      runtime: 152,
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      image: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg',
      trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY'
    },
    {
      _id: '4',
      name: 'Inception',
      genre: 'Sci-Fi',
      releaseYear: 2010,
      rating: 8.8,
      runtime: 148,
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      image: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg',
      trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0'
    },
    {
  _id: '5',
  name: 'The Matrix',
  genre: 'Sci-Fi',
  releaseYear: 1999,
  rating: 8.7,
  runtime: 136,
  description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
  image: 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_FMjpg_UX1000_.jpg',
  trailerUrl: 'https://www.youtube.com/embed/vKQi3bBA1y8'
},
{
  _id: '6',
  name: 'Interstellar',
  genre: 'Sci-Fi',
  releaseYear: 2014,
  rating: 8.6,
  runtime: 169,
  description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
  image: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_FMjpg_UX1000_.jpg',
  trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E'
},
  ];

  // FIXED: Check authentication on mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const token = localStorage.getItem('token');
    
    console.log('🔍 HomePage - Authentication check:', {
      isAuthenticated: localStorage.getItem('isAuthenticated'),
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      userName: localStorage.getItem('userName'),
      userEmail: localStorage.getItem('userEmail')
    });
    
    if (!isAuthenticated || !token) {
      console.log('❌ Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    // Get user name from localStorage (now stored by login/signup)
    const storedUser = localStorage.getItem('user');
    let userName = 'Movie Lover';
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        userName = userData.name || userData.email?.split('@')[0] || localStorage.getItem('userName') || 'Movie Lover';
      } catch (e) {
        console.error('Error parsing user data:', e);
        userName = localStorage.getItem('userName') || 'Movie Lover';
      }
    } else {
      userName = localStorage.getItem('userName') || 'Movie Lover';
    }
    
    setUser(userName);
    
    // Fetch movies immediately
    fetchMoviesAndStats();
  }, [refreshTrigger, navigate]);

  const fetchMoviesAndStats = async () => {
    try {
      setLoadingStats(true);
      let moviesData = [];
      
      try {
        // Try to get movies from API
        const response = await movieAPI.getAllMovies();
        console.log('📊 API Response:', response);
        
        // Handle different response formats
        if (Array.isArray(response)) {
          moviesData = response;
        } else if (response && Array.isArray(response.data)) {
          moviesData = response.data;
        } else if (response && response.data && typeof response.data === 'object') {
          // If it's an object with movies property
          moviesData = response.data.movies || [];
        }
        
        console.log('🎬 Processed movies data:', moviesData);
        
      } catch (error) {
        console.log('❌ API failed, using sample data:', error);
        moviesData = sampleMovies;
      }
      
      // If no movies from API, use sample movies
      if (!moviesData || moviesData.length === 0) {
        console.log('📝 No movies from API, using sample movies');
        moviesData = sampleMovies;
      }
      
      console.log('✅ Final movies to display:', moviesData);
      setMovies(moviesData);

      // Calculate stats
      if (moviesData.length > 0) {
        const totalRating = moviesData.reduce((sum, movie) => sum + (movie.rating || 0), 0);
        const averageRating = totalRating / moviesData.length;
        
        const genreCount = {};
        moviesData.forEach(movie => {
          if (movie.genre) {
            genreCount[movie.genre] = (genreCount[movie.genre] || 0) + 1;
          }
        });
        
        let topGenre = 'Not Set';
        if (Object.keys(genreCount).length > 0) {
          topGenre = Object.keys(genreCount).reduce((a, b) => 
            genreCount[a] > genreCount[b] ? a : b
          );
        }

        const totalRuntime = moviesData.reduce((sum, movie) => sum + (movie.runtime || 0), 0);

        setStats({
          total: moviesData.length,
          averageRating: parseFloat(averageRating.toFixed(1)),
          topGenre,
          totalRuntime: Math.round(totalRuntime / 60)
        });
      } else {
        // If no movies at all
        setStats({
          total: 0,
          averageRating: 0,
          topGenre: 'Not Set',
          totalRuntime: 0
        });
      }
    } catch (error) {
      console.error('❌ Error in fetchMoviesAndStats:', error);
      // Fallback to sample data
      setMovies(sampleMovies);
      setStats({
        total: sampleMovies.length,
        averageRating: 9.3,
        topGenre: 'Drama',
        totalRuntime: Math.round((142 + 175 + 152 + 148) / 60) // 10 hours
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Refreshing data...');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    // Clear ALL authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isGuest');
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('authTimestamp');
    
    navigate('/login');
  };

  return (
    <div className="home-page">
      {/* Navigation - Fixed layout */}
      <div className="full-width-nav">
        <div className="top-nav">
          <div className="nav-left">
            <Link to="/" className="logo">
              <span className="logo-icon">🎬</span>
              <span className="logo-text">MOVIEMASTER</span>
            </Link>
          </div>
          
          <nav className="nav-links">
            <Link to="/" className="active">Home</Link>
            <Link to="/browse">Browse</Link>
            <Link to="/add-movie">Add Movie</Link>
          </nav>
          
          <div className="nav-right">
            {user && (
              <div className="user-profile">
                <span className="welcome-text">Welcome, {user}</span>
                <button onClick={handleLogout} className="logout-btn">
                  <span className="logout-icon">🚪</span>
                  <span className="logout-text">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="highlight">MovieMaster</span>
          </h1>
          <p className="hero-subtitle">
            Your personal movie collection manager. 
            Track what you watch, rate your favorites, and build your ultimate movie library.
          </p>
          <div className="hero-actions">
            <Link to="/add-movie" className="hero-btn primary">
              ➕ Add New Movie
            </Link>
            <Link to="/browse" className="hero-btn secondary">
              🔍 Browse Collection
            </Link>
            <button onClick={handleRefresh} className="hero-btn tertiary">
              🔄 Refresh
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="movie-icons">
            <div className="icon-circle">🎬</div>
            <div className="icon-circle">🍿</div>
            <div className="icon-circle">🎥</div>
            <div className="icon-circle">⭐</div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <h2 className="section-title">Your Collection at a Glance</h2>
        {loadingStats ? (
          <div className="stats-loading">
            <div className="spinner"></div>
            <span>Loading your movie stats...</span>
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎬</div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.total}</h3>
                <p className="stat-label">Total Movies</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.averageRating}</h3>
                <p className="stat-label">Avg Rating</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🎭</div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.topGenre}</h3>
                <p className="stat-label">Top Genre</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.totalRuntime}h</h3>
                <p className="stat-label">Total Runtime</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/add-movie" className="action-btn add">
            <div className="action-icon">➕</div>
            <div className="action-text">
              <h4>Add Movie</h4>
              <p>Add new movie to collection</p>
            </div>
          </Link>
          
          <Link to="/browse" className="action-btn browse">
            <div className="action-icon">🔍</div>
            <div className="action-text">
              <h4>Browse All</h4>
              <p>View all your movies</p>
            </div>
          </Link>
          
          <Link to="/add-movie?sample=true" className="action-btn sample">
            <div className="action-icon">🎬</div>
            <div className="action-text">
              <h4>Add Sample</h4>
              <p>Start with sample movies</p>
            </div>
          </Link>
          
          <Link to="/genres" className="action-btn genres">
            <div className="action-icon">🏷️</div>
            <div className="action-text">
              <h4>By Genre</h4>
              <p>Filter by categories</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Movies Section - FIXED: Show sample movies if no API data */}
      <div className="movies-section">
        <div className="section-header">
          <h2 className="section-title">Recent Movies</h2>
          <div className="section-actions">
            <Link to="/add-movie" className="action-link add">
              ➕ Add Movie
            </Link>
            <Link to="/browse" className="action-link browse">
              🔍 View All
            </Link>
          </div>
        </div>
        
        {/* ALWAYS show movies section - don't show "No movies" */}
        <div className="movies-preview">
          {movies.length > 0 ? (
            <>
              {/* Render movies here */}
              <div className="movies-grid">
                {movies.slice(0, 4).map(movie => (
                  <div key={movie._id || movie.id} className="movie-card">
                    <img 
                      src={movie.image || 'https://via.placeholder.com/300x450?text=No+Image'} 
                      alt={movie.name}
                      className="movie-poster"
                    />
                    <div className="movie-info">
                      <h3>{movie.name}</h3>
                      <div className="movie-meta">
                        <span className="genre">{movie.genre}</span>
                        <span className="rating">⭐ {movie.rating}</span>
                      </div>
                      <p className="description">{movie.description?.substring(0, 100)}...</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {movies.length > 4 && (
                <div className="view-more-container">
                  <Link to="/browse" className="view-more-btn">
                    View All {movies.length} Movies →
                  </Link>
                </div>
              )}
            </>
          ) : (
            // This should rarely show now
            <div className="no-movies">
              <div className="no-movies-icon">🎥</div>
              <h3>No movies yet</h3>
              <p>Start building your collection by adding your first movie!</p>
              <Link to="/add-movie" className="add-first-btn">
                ➕ Add Your First Movie
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">Why Choose MovieMaster?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📁</div>
            <h3>Organize</h3>
            <p>Keep all your movies in one place with custom categories and tags.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Rate</h3>
            <p>Personal rating system to remember how much you loved each film.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Discover</h3>
            <p>Advanced search and filter options to find exactly what you want.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Access Anywhere</h3>
            <p>Your collection is available on all your devices, anywhere.</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Start Your Movie Journey Today</h2>
          <p>Join thousands of movie lovers who manage their collections with MovieMaster.</p>
          <div className="cta-actions">
            <Link to="/add-movie" className="cta-btn primary">
              🎬 Get Started Free
            </Link>
            <Link to="/browse" className="cta-btn secondary">
              📚 View Sample
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;