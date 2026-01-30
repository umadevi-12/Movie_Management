import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPages.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    setError('');
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
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
    
    if (!formData.agreeTerms) {
      setError('You must agree to the terms and conditions');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('📤 Sending signup request to:', `${API_URL}/auth/register`);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
      });
      
      if (!response.ok) {
        let errorMessage = `Signup failed (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorData.msg || errorMessage;
          
          if (errorMessage.toLowerCase().includes('already exists')) {
            setError(
              <span>
                An account with this email already exists.{' '}
                <Link 
                  to="/login" 
                  style={{
                    color: '#3498db', 
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login', { 
                      state: { prefillEmail: formData.email } 
                    });
                  }}
                >
                  Click here to login instead
                </Link>
              </span>
            );
            setLoading(false);
            return;
          }
        } catch (parseError) {
          console.log('Could not parse error response as JSON');
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      console.log('📥 Signup response:', data);
      
      // Extract token and user data
      let token = data.token || data.accessToken || data.authToken || 
                 data.data?.token || data.data?.accessToken;
      
      let userData = data.user || data.data?.user || data.data || {};
      
      // Ensure user data has name and email
      if (!userData.name) userData.name = formData.name;
      if (!userData.email) userData.email = formData.email;
      
      if (!token) {
        throw new Error('No authentication token received');
      }
      
      // CRITICAL: Store ALL required authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userName', userData.name || formData.name);
      localStorage.setItem('userEmail', userData.email || formData.email);
      localStorage.setItem('rememberedEmail', formData.email);
      
      console.log('✅ Signup successful! Stored data:', {
        userName: localStorage.getItem('userName'),
        userEmail: localStorage.getItem('userEmail'),
        isAuthenticated: localStorage.getItem('isAuthenticated')
      });
      
      // Show success message
      setTimeout(() => {
        alert('🎉 Account created successfully! Welcome to MovieMaster!');
        navigate('/', { replace: true });
      }, 100);
      
    } catch (err) {
      console.error('❌ Signup error:', err);
      
      if (!React.isValidElement(error)) {
        if (err.message.includes('400')) {
          setError('Invalid signup data. Please check all fields.');
        } else if (err.message.includes('409')) {
          setError('An account with this email already exists.');
        } else if (err.message.includes('Network')) {
          setError('Cannot connect to server. Check your internet.');
        } else if (err.message.includes('500')) {
          setError('Server error. Please try again later.');
        } else {
          setError(err.message || 'Signup failed. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if already authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      console.log('Already authenticated, redirecting to home');
      navigate('/');
    }
    
    console.log('🔍 Signup page - Auth status:', {
      isAuthenticated: localStorage.getItem('isAuthenticated')
    });
  }, [navigate]);

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="signup-background">
        <div className="movie-overlay"></div>
        <div className="featured-movie">
          <h2 className="featured-title">🎬 Your Movie Library</h2>  
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
            <h1 className="auth-title">Join MovieMaster</h1>
            <p className="auth-subtitle">Create your account to start your movie journey</p>
          </div>

          {error && (
            <div className="auth-error">
              ⚠️ {typeof error === 'string' ? error : <span>{error}</span>}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                disabled={loading}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (min. 6 characters)"
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="terms-link">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="terms-link">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              className="auth-btn primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                'CREATE ACCOUNT'
              )}
            </button>

            <div className="auth-divider">
              <span>Already have an account?</span>
            </div>

            <Link to="/login" className="auth-btn secondary">
              SIGN IN INSTEAD
            </Link>

            <div className="benefits">
              <h3>Why join MovieMaster?</h3>
              <div className="benefit-item">
                <span className="benefit-icon">🎬</span>
                <span>Personal movie collection</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">⭐</span>
                <span>Rate and review movies</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🎯</span>
                <span>Personalized recommendations</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📱</span>
                <span>Access anywhere, anytime</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;