import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    try {
      console.log('📤 Sending login request to:', `${API_URL}/auth/login`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
      });
      
      // Handle response
      if (!response.ok) {
        let errorMessage = `Login failed (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorData.msg || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response as JSON');
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      console.log('📥 Login response:', data);
      
      // Extract token and user data with better error handling
      let token, userData;
      
      // Try all possible token locations
      token = data.token || data.accessToken || data.authToken || 
              data.data?.token || data.data?.accessToken || data.jwt || data.jwtToken;
      
      // Try all possible user data locations
      userData = data.user || data.data?.user || data.data || {};
      
      // If no user data, create basic user object
      if (!userData.email) {
        userData.email = formData.email;
      }
      if (!userData.name && formData.email.includes('@')) {
        userData.name = formData.email.split('@')[0];
      }
      
      if (!token) {
        console.error('No token found in response:', data);
        throw new Error('No authentication token received');
      }
      
      // CRITICAL: Store ALL required authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', userData.email || formData.email);
      localStorage.setItem('userName', userData.name || userData.email?.split('@')[0] || 'User');
      
      // Store email for "Remember me"
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
      
      console.log('✅ Login successful! Stored data:', {
        hasToken: !!localStorage.getItem('token'),
        isAuthenticated: localStorage.getItem('isAuthenticated'),
        userName: localStorage.getItem('userName'),
        userEmail: localStorage.getItem('userEmail')
      });
      
      // Navigate to home with force
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
      
    } catch (err) {
      console.error('❌ Login error:', err);
      
      if (err.message.includes('400') || err.message.includes('401')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message.includes('Network') || err.message.includes('fetch')) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else if (err.message.includes('500')) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('📤 Sending guest login request...');
      
      const response = await fetch(`${API_URL}/auth/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        let errorMessage = `Guest login failed (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorData.msg || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response as JSON');
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      console.log('📥 Guest login response:', data);
      
      // Extract token
      let token = data.token || data.accessToken || data.authToken || 
                 data.data?.token || data.data?.accessToken;
      
      if (!token) {
        throw new Error('No authentication token received');
      }
      
      // Store guest authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ 
        name: 'Guest User', 
        email: 'guest@moviemaster.com',
        isGuest: true 
      }));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('isGuest', 'true');
      localStorage.setItem('userName', 'Guest User');
      localStorage.setItem('userEmail', 'guest@moviemaster.com');
      
      console.log('✅ Guest login successful!');
      
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
      
    } catch (err) {
      console.error('❌ Guest login error:', err);
      setError(err.message || 'Guest login is currently unavailable.');
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
      return;
    }
    
    // Pre-fill remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
    
    console.log('🔍 Login page - Auth status:', {
      isAuthenticated: localStorage.getItem('isAuthenticated'),
      hasToken: !!localStorage.getItem('token')
    });
  }, [navigate]);

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="login-background">

        <div className="movie-overlay"></div>
        <div className="featured-movie">
          <h2 className="featured-title">Welcome to MovieMaster</h2>
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
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to access your movie collection</p>
          </div>

          {error && (
            <div className="auth-error">
              ⚠️ {error}
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
                placeholder="Enter your password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>Remember me</span>
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
                  Signing In...
                </>
              ) : (
                'SIGN IN'
              )}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button 
              type="button" 
              className="auth-btn secondary"
              onClick={handleGuestLogin}
              disabled={loading}
            >
              🎬 {loading ? 'Logging in as Guest...' : 'Continue as Guest'}
            </button>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="auth-link">
                  Sign up now
                </Link>
              </p>
            </div>
          </form>

          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-icon">🎬</span>
              <div className="stat-content">
                <span className="stat-number">10,000+</span>
                <span className="stat-label">Movies</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <div className="stat-content">
                <span className="stat-number">4.8</span>
                <span className="stat-label">Avg Rating</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">👥</span>
              <div className="stat-content">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Users</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;