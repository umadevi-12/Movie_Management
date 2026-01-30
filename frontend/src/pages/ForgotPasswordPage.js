import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      console.log('📤 Sending password reset request to:', `${API_URL}/auth/forgot-password`);
      
      // Simulate API call (replace with actual API endpoint)
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
        })
      });

      // Check response
      if (response.ok) {
        setSuccess(`Password reset instructions have been sent to ${formData.email}. Please check your email.`);
        setFormData({ email: '' });
        
        // Auto-redirect to login after 5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } else {
        // Handle errors
        let errorMessage = 'Failed to send reset email. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If response is not JSON
        }
        
        if (response.status === 404) {
          errorMessage = 'No account found with this email address.';
        } else if (response.status === 429) {
          errorMessage = 'Too many attempts. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }
      
    } catch (err) {
      console.error('❌ Forgot password error:', err);
      
      // User-friendly error messages
      if (err.message.includes('Network') || err.message.includes('fetch')) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background Movie Banner */}
      <div className="auth-background">
        <div className="movie-overlay"></div>
        <div className="featured-movie">
          <h2 className="featured-title">BACK TO THE FUTURE</h2>
          <div className="movie-meta">
            <span>Sci-Fi • Adventure • Comedy</span>
            <span>Duration: 1h 56m</span>
          </div>
          <div className="movie-rating">
            <span className="rating">⭐ 8.5/10</span>
            <span className="reviews">Based on 7.2k reviews</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Form */}
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="logo">
              <span className="logo-icon">🎬</span>
              <span className="logo-text">THEMOVIEBOX</span>
            </Link>
            <h1 className="auth-title">Reset Your Password</h1>
            <p className="auth-subtitle">Enter your email to receive reset instructions</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="auth-error">
              ⚠️ {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="auth-success">
              ✅ {success}
              <p className="redirect-text">You will be redirected to login in 5 seconds...</p>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your registered email"
                required
                disabled={loading || success}
                autoComplete="email"
              />
              <p className="form-help">
                We'll send you a link to reset your password
              </p>
            </div>

            <button 
              type="submit" 
              className="auth-btn primary"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Sending Reset Link...
                </>
              ) : (
                'SEND RESET LINK'
              )}
            </button>

            <div className="auth-footer">
              <p>
                Remember your password?{' '}
                <Link to="/login" className="auth-link">
                  Back to Login
                </Link>
              </p>
              <p className="extra-links">
                Don't have an account?{' '}
                <Link to="/signup" className="auth-link">
                  Sign up now
                </Link>
              </p>
            </div>
          </form>

          {/* Security Tips */}
          <div className="security-tips">
            <h3>🔒 Security Tips:</h3>
            <ul>
              <li>Check your spam folder if you don't see the email</li>
              <li>Reset links expire after 24 hours for security</li>
              <li>Use a strong, unique password for your account</li>
              <li>Never share your password with anyone</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;