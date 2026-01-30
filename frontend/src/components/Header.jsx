import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" className="logo-link">
            <span className="logo-icon">🎬</span>
            <div className="logo-text">
              <h1>MovieMaster</h1>
              <p className="tagline">Your Personal Movie Collection</p>
            </div>
          </Link>
        </div>

        <nav className="nav">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                <span className="nav-icon">🏠</span>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/add-movie" className="nav-link">
                <span className="nav-icon">➕</span>
                Add Movie
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/browse" className="nav-link">
                <span className="nav-icon">🔍</span>
                Browse
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;