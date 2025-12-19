import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { currentUser, userData, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleLogoClick = (e) => {
    if (currentUser && isAdmin) {
      e.preventDefault();
      navigate('/admin/dashboard');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" onClick={handleLogoClick}>
          <span>Sky Appointments</span>
        </Link>
        
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          
          {currentUser ? (
            <>
              {isAdmin ? (
                <>
                  <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/admin/services" className="nav-link">Services</Link>
                  <Link to="/admin/calendar" className="nav-link">Calendar</Link>
                  <Link to="/admin/analytics" className="nav-link">Analytics</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                  <span className="nav-link">Welcome, {userData?.name}</span>
                </>
              )}
              <button onClick={handleLogout} className="btn btn-outline btn-small">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="btn btn-outline btn-small">Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-small">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;