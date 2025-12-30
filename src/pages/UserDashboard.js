import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAllServices, 
  createAppointment,
  getUserAppointments,
  subscribeToServices 
} from '../firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import ServiceCard from '../components/ServiceCard';
import AppointmentCard from '../components/AppointmentCard';

const UserDashboard = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('services');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    const loadData = async () => {
      try {
        // Load services - filter to show only available ones
        const servicesData = await getAllServices();
        const availableServices = servicesData.filter(service => service.availability !== false);
        setServices(availableServices);

        // Load user appointments
        const appointmentsData = await getUserAppointments(currentUser.uid);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time updates for services - filter by availability
    const unsubscribe = subscribeToServices((updatedServices) => {
      const availableServices = updatedServices.filter(service => service.availability !== false);
      setServices(availableServices);
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  const handleBookService = async (bookingData) => {
    try {
      // Convert date to Firestore Timestamp
      const date = Timestamp.fromDate(new Date(bookingData.date));
      
      await createAppointment({
        ...bookingData,
        date,
        userId: currentUser.uid,
        userName: userData?.name || currentUser.email,
        userEmail: currentUser.email,
        time: bookingData.time || `${new Date(bookingData.date).getHours()}:${new Date(bookingData.date).getMinutes()}`
      });
      
      // Refresh appointments
      const updatedAppointments = await getUserAppointments(currentUser.uid);
      setAppointments(updatedAppointments);
      
      alert('Appointment booked successfully! Waiting for admin approval.');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

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
        <h1>Welcome, {userData?.name || currentUser?.email || 'User'}!</h1>
        <p style={{ color: 'var(--gray-color)' }}>Manage your appointments and book new services</p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px',
        borderBottom: '2px solid #eee',
        paddingBottom: '10px'
      }}>
        <button
          onClick={() => setActiveTab('services')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === 'services' ? '600' : '400',
            color: activeTab === 'services' ? 'var(--primary-color)' : 'var(--secondary-color)',
            borderBottom: activeTab === 'services' ? '2px solid var(--primary-color)' : 'none',
            marginBottom: '-12px'
          }}
        >
          Available Services
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === 'appointments' ? '600' : '400',
            color: activeTab === 'appointments' ? 'var(--primary-color)' : 'var(--secondary-color)',
            borderBottom: activeTab === 'appointments' ? '2px solid var(--primary-color)' : 'none',
            marginBottom: '-12px'
          }}
        >
          My Appointments ({appointments.length})
        </button>
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <>
          {services.length > 0 ? (
            <div className="dashboard-grid">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onBook={handleBookService}
                />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No Services Available</h3>
              <p>Check back later for available services.</p>
            </div>
          )}
        </>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <>
          {appointments.length > 0 ? (
            <div>
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No Appointments Yet</h3>
              <p>Book your first service to get started!</p>
              <button 
                onClick={() => setActiveTab('services')}
                className="btn btn-primary mt-2"
              >
                View Services
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserDashboard;