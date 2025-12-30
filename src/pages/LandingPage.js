import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllServices, subscribeToServices } from '../firebase/firestore';

const LandingPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await getAllServices();
        // Filter to show only available services, then take first 3
        const availableServices = data.filter(service => service.availability !== false);
        setServices(availableServices.slice(0, 3));
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();

    // Subscribe to real-time updates for services
    const unsubscribe = subscribeToServices((updatedServices) => {
      const availableServices = updatedServices.filter(service => service.availability !== false);
      setServices(availableServices.slice(0, 3));
    });

    return () => unsubscribe();
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
                  {service.duration} minutes
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

    </div>
  );
};

export default LandingPage;