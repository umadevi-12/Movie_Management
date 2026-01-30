import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import AddMoviePage from './pages/AddMoviePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          
          <Route path="/browse" element={
            <ProtectedRoute>
              <BrowsePage />
            </ProtectedRoute>
          } />
          
          <Route path="/add-movie" element={
            <ProtectedRoute>
              <AddMoviePage />
            </ProtectedRoute>
          } />
          
          {/* Redirect to login if no route matches */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;