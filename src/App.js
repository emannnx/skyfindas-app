import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import InitializeDatabase from './components/InitializeDatabase';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import UserDashboard from './pages/UserDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ServicesManagement from './pages/ServicesManagement';
import CalendarView from './pages/CalendarView';
import Analytics from './pages/Analytics';
import './styles/global.css';
import './styles/components.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <InitializeDatabase />
        <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <main style={{ flex: '1' }}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/admin" element={<AdminLogin />} />
              
              {/* User routes */}
              <Route path="/dashboard" element={<UserDashboard />} />
              
              {/* Admin routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/services" element={<ServicesManagement />} />
              <Route path="/admin/calendar" element={<CalendarView />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;