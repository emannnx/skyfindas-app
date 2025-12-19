import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllServices } from '../firebase/firestore';

const LandingPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await getAllServices();
        setServices(data.slice(0, 3)); // Show only 3 services on landing
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '100px 20px',
        textAlign: 'center',
        borderRadius: '0 0 20px 20px',
        marginBottom: '60px'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
            Sky Appointments
          </h1>
          <p style={{ fontSize: '20px', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
            Book appointments seamlessly with our modern scheduling platform
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '15px 30px', fontSize: '18px' }}>
              Get Started
            </Link>
            <Link to="/dashboard" className="btn btn-outline" style={{ padding: '15px 30px', fontSize: '18px', backgroundColor: 'white' }}>
              View Services
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container" style={{ marginBottom: '60px' }}>
        <h2 className="text-center mb-3">Why Choose Sky Appointments?</h2>
        <div className="dashboard-grid">
          <div className="service-card">
            <h3 className="service-title">Easy Booking</h3>
            <p className="service-description">
              Book appointments in just a few clicks. No hassle, no waiting.
            </p>
          </div>
          
          <div className="service-card">
            <h3 className="service-title">Real-time Updates</h3>
            <p className="service-description">
              Get instant notifications and updates on your appointments.
            </p>
          </div>
          
          <div className="service-card">
            <h3 className="service-title">Professional Services</h3>
            <p className="service-description">
              Access a wide range of professional services tailored to your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="container" style={{ marginBottom: '60px' }}>
        <h2 className="text-center mb-3">Featured Services</h2>
        {loading ? (
          <div className="spinner"></div>
        ) : services.length > 0 ? (
          <div className="dashboard-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <div className="service-duration">
                  ⏱️ {service.duration} minutes
                </div>
                <Link 
                  to="/signup" 
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center">No services available at the moment.</p>
        )}
        
        <div className="text-center mt-3">
          <Link to="/dashboard" className="btn btn-outline">
            View All Services
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        padding: '60px 20px',
        textAlign: 'center',
        borderRadius: '20px',
        margin: '0 20px 60px'
      }}>
        <div className="container">
          <h2 style={{ marginBottom: '20px' }}>Ready to Get Started?</h2>
          <p style={{ marginBottom: '30px', fontSize: '18px' }}>
            Join thousands of satisfied customers who trust Sky Appointments for their scheduling needs.
          </p>
          <Link to="/signup" className="btn" style={{ 
            backgroundColor: 'white', 
            color: 'var(--primary-color)',
            padding: '15px 40px',
            fontSize: '18px'
          }}>
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;