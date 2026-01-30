import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './AuthPages.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Check if token is present
    if (!token) {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid reset link');
      return;
    }
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📤 Resetting password with token');
      
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        })
      });

      if (response.ok) {
        setSuccess('Password has been reset successfully!');
        setFormData({ password: '', confirmPassword: '' });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        let errorMessage = 'Failed to reset password. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If response is not JSON
        }
        
        if (response.status === 400) {
          errorMessage = 'Invalid or expired reset token.';
        } else if (response.status === 401) {
          errorMessage = 'Token has expired. Please request a new reset link.';
        }
        
        throw new Error(errorMessage);
      }
      
    } catch (err) {
      console.error('❌ Reset password error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="movie-overlay"></div>
        <div className="featured-movie">
          <h2 className="featured-title">THE MATRIX</h2>
          <div className="movie-meta">
            <span>Sci-Fi • Action • Thriller</span>
            <span>Duration: 2h 16m</span>
          </div>
          <div className="movie-rating">
            <span className="rating">⭐ 8.7/10</span>
            <span className="reviews">Based on 8.2k reviews</span>
          </div>
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="logo">
              <span className="logo-icon">🎬</span>
              <span className="logo-text">THEMOVIEBOX</span>
            </Link>
            <h1 className="auth-title">Set New Password</h1>
            <p className="auth-subtitle">Create a new secure password for your account</p>
          </div>

          {error && (
            <div className="auth-error">
              ⚠️ {error}
              {error.includes('Invalid') && (
                <Link to="/forgot-password" className="auth-link" style={{display: 'block', marginTop: '0.5rem'}}>
                  Request new reset link
                </Link>
              )}
            </div>
          )}

          {success && (
            <div className="auth-success">
              ✅ {success}
              <p className="redirect-text">Redirecting to login...</p>
            </div>
          )}

          {!success && (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password (min. 6 characters)"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <button 
                type="submit" 
                className="auth-btn primary"
                disabled={loading || !token}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Resetting Password...
                  </>
                ) : (
                  'RESET PASSWORD'
                )}
              </button>

              <div className="auth-footer">
                <p>
                  Remember your password?{' '}
                  <Link to="/login" className="auth-link">
                    Back to Login
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;