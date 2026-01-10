import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAllAppointments, 
  updateAppointmentStatus,
  subscribeToAppointments 
} from '../firebase/firestore';
import { format, isToday, isTomorrow } from 'date-fns';
import AppointmentCard from '../components/AppointmentCard';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    approved: 0
  });
  

  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/admin';
      return;
    }

    const loadAppointments = async () => {
      try {
        const data = await getAllAppointments();
        setAppointments(data);
        calculateStats(data);
      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToAppointments((updatedAppointments) => {
      setAppointments(updatedAppointments);
      calculateStats(updatedAppointments);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const calculateStats = (appointments) => {
    const today = new Date();
    const stats = {
      total: appointments.length,
      today: appointments.filter(app => {
        const appDate = app.date?.toDate ? app.date.toDate() : new Date(app.date);
        return isToday(appDate);
      }).length,
      pending: appointments.filter(app => app.status === 'Pending').length,
      approved: appointments.filter(app => app.status === 'Approved').length
    };
    setStats(stats);
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      await updateAppointmentStatus(appointmentId, status);
      alert(`Appointment ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment');
    }
  };

  const todayAppointments = appointments.filter(app => {
    const appDate = app.date?.toDate ? app.date.toDate() : new Date(app.date);
    return isToday(appDate);
  });

  const upcomingAppointments = appointments.filter(app => {
    const appDate = app.date?.toDate ? app.date.toDate() : new Date(app.date);
    return appDate > new Date() && !isToday(appDate) && app.status !== 'Cancelled';
  }).slice(0, 5); // Show only 5 upcoming

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1>Admin Dashboard</h1>
        <p style={{ color: 'var(--gray-color)' }}>Manage appointments and view analytics</p>
      </div>

      {/* Quick Stats */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-label">Total Appointments</div>
          <div className="analytics-value">{stats.total}</div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-label">Today's Appointments</div>
          <div className="analytics-value">{stats.today}</div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-label">Pending Approval</div>
          <div className="analytics-value">{stats.pending}</div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-label">Approved</div>
          <div className="analytics-value">{stats.approved}</div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="dashboard-grid mt-3">
        <Link to="/admin/services" className="service-card" style={{ textDecoration: 'none' }}>
          <h3 className="service-title">Manage Services</h3>
          <p className="service-description">Add, edit, or remove services</p>
          <div style={{ color: 'var(--primary-color)', marginTop: 'auto' }}>→</div>
        </Link>
        
        <Link to="/admin/calendar" className="service-card" style={{ textDecoration: 'none' }}>
          <h3 className="service-title">Calendar View</h3>
          <p className="service-description">View appointments in calendar format</p>
          <div style={{ color: 'var(--primary-color)', marginTop: 'auto' }}>→</div>
        </Link>
        
        <Link to="/admin/analytics" className="service-card" style={{ textDecoration: 'none' }}>
          <h3 className="service-title">Analytics</h3>
          <p className="service-description">View detailed statistics and reports</p>
          <div style={{ color: 'var(--primary-color)', marginTop: 'auto' }}>→</div>
        </Link>
      </div>

      {/* Today's Appointments */}
      <div className="card mt-3">
        <h3>Today's Appointments ({todayAppointments.length})</h3>
        {todayAppointments.length > 0 ? (
          <div style={{ marginTop: '20px' }}>
            {todayAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onUpdateStatus={handleUpdateStatus}
                isAdmin={true}
              />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--gray-color)', textAlign: 'center', padding: '20px' }}>
            No appointments scheduled for today.
          </p>
        )}
      </div>

      {/* Upcoming Appointments */}
      <div className="card mt-3">
        <h3>Upcoming Appointments</h3>
        {upcomingAppointments.length > 0 ? (
          <div className="table-container mt-2">
            <table className="table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>User</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((appointment) => {
                  const appDate = appointment.date?.toDate ? appointment.date.toDate() : new Date(appointment.date);
                  return (
                    <tr key={appointment.id}>
                      <td>{format(appDate, 'MMM dd, yyyy hh:mm a')}</td>
                      <td>{appointment.userName}</td>
                      <td>{appointment.serviceName}</td>
                      <td>
                        <span className={`status-badge ${
                          appointment.status === 'Approved' ? 'status-approved' :
                          appointment.status === 'Cancelled' ? 'status-cancelled' : 'status-pending'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td>
                        {appointment.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(appointment.id, 'Approved')}
                              className="btn btn-success btn-small mr-1"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(appointment.id, 'Cancelled')}
                              className="btn btn-danger btn-small"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--gray-color)', textAlign: 'center', padding: '20px' }}>
            No upcoming appointments.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;