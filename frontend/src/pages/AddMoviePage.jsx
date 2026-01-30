import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MovieForm from '../components/MovieForm';
import './AddMoviePage.css';

const AddMoviePage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    setTimeout(() => {
      navigate('/browse');
    }, 1500);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="add-movie-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-top">
          <button onClick={handleCancel} className="back-btn">
            ← Back
          </button>
          <div className="header-actions">
            <Link to="/browse" className="action-link">
              🔍 Browse
            </Link>
            <Link to="/" className="action-link">
              🏠 Home
            </Link>
          </div>
        </div>
        
        <div className="header-content">
          <h1>
            <span className="highlight">Add Movie</span> to Collection
          </h1>
          <p className="page-subtitle">
            Fill in the details below to add a movie to your personal collection. 
            All fields with <span className="required">*</span> are required.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-container">
        {/* Form Section */}
        <div className="form-section">
          <div className="form-header">
            <h2>Movie Details</h2>
            <p>Complete all required fields to add your movie</p>
          </div>
          <div className="form-card">
            <MovieForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar-section">
          {/* Tips Card */}
          <div className="sidebar-card tips-card">
            <div className="card-header">
              <div className="card-icon">💡</div>
              <h3>Tips for Better Organization</h3>
            </div>
            <ul className="tips-list">
              <li>
                <span className="tip-bullet">🎯</span>
                <span>Use the original movie title</span>
              </li>
              <li>
                <span className="tip-bullet">🎭</span>
                <span>Select the most specific genre</span>
              </li>
              <li>
                <span className="tip-bullet">📝</span>
                <span>Add personal notes in description</span>
              </li>
              <li>
                <span className="tip-bullet">⭐</span>
                <span>Rate immediately after watching</span>
              </li>
              <li>
                <span className="tip-bullet">📅</span>
                <span>Use the original release year</span>
              </li>
            </ul>
          </div>

          {/* Example Card */}
          <div className="sidebar-card example-card">
            <div className="card-header">
              <div className="card-icon">🎬</div>
              <h3>Example Entry</h3>
            </div>
            <div className="example-movie">
              <div className="example-header">
                <div className="example-title">
                  <h4>Inception</h4>
                  <span className="example-rating">⭐ 8.8</span>
                </div>
                <div className="example-meta">
                  <span className="example-genre">Sci-Fi</span>
                  <span className="example-year">2010</span>
                  <span className="example-runtime">⏱️ 148 min</span>
                </div>
              </div>
              <p className="example-description">
                A thief who steals corporate secrets through dream-sharing technology 
                is given the inverse task of planting an idea into the mind of a C.E.O.
              </p>
            </div>
          </div>

          {/* Benefits Card */}
          <div className="sidebar-card benefits-card">
            <div className="card-header">
              <div className="card-icon">📈</div>
              <h3>Track Your Progress</h3>
            </div>
            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-icon">📊</div>
                <div className="benefit-content">
                  <h4>View Statistics</h4>
                  <p>See your watching habits and favorite genres</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🎯</div>
                <div className="benefit-content">
                  <h4>Set Goals</h4>
                  <p>Track movies you want to watch</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">📅</div>
                <div className="benefit-content">
                  <h4>Watch History</h4>
                  <p>Remember when you watched each film</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="sidebar-card links-card">
            <div className="card-header">
              <div className="card-icon">🔗</div>
              <h3>Quick Links</h3>
            </div>
            <div className="links-grid">
              <Link to="/browse" className="sidebar-link">
                <span className="link-icon">🎬</span>
                <span className="link-text">Browse Collection</span>
              </Link>
              <Link to="/" className="sidebar-link">
                <span className="link-icon">🏠</span>
                <span className="link-text">Home</span>
              </Link>
              <button onClick={handleCancel} className="sidebar-link cancel-link">
                <span className="link-icon">↩</span>
                <span className="link-text">Cancel & Return</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="bottom-info">
        <p>
          <strong>Note:</strong> You can add trailers by pasting YouTube URLs. 
          Poster images should be direct links to image files.
        </p>
      </div>
    </div>
  );
};

export default AddMoviePage;