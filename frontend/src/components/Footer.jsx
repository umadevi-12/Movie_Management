import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">MovieMaster</h3>
            <p className="footer-description">
              A full-stack application for managing your personal movie collection.
              Track, rate, and organize your favorite films all in one place.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/add-movie" className="footer-link">Add Movie</Link></li>
              <li><Link to="/browse" className="footer-link">Browse Movies</Link></li>
              <li><Link to="/genres" className="footer-link">Genres</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Features</h4>
            <div className="features-list">
              <span className="feature-badge">🎯 Personal Collection</span>
              <span className="feature-badge">⭐ Rating System</span>
              <span className="feature-badge">🔍 Smart Search</span>
              <span className="feature-badge">📱 Mobile Friendly</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} MovieMaster. All rights reserved.
          </p>
          <p className="developer">
            Built with ❤️ for Movie Enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;