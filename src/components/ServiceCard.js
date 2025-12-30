import React, { useState } from 'react';
import { format } from 'date-fns';
import BookingModal from './BookingModal';

const ServiceCard = ({ service, onBook }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleBook = () => {
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      await onBook({
        ...bookingData,
        serviceId: service.id,
        serviceName: service.title,
      });
      setShowBookingModal(false);
    } catch (error) {
      console.error('Error booking service:', error);
    }
  };

  return (
    <>
      <div className="service-card">
        <div className="service-header">
          <h3 className="service-title">{service.title}</h3>
          <span className="service-duration">
           {service.duration} minutes
          </span>
        </div>
        
        <p className="service-description">{service.description}</p>
        
        <div className="service-footer">
          <button 
            onClick={handleBook}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Book Now
          </button>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          service={service}
          onSubmit={handleBookingSubmit}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </>
  );
};

export default ServiceCard;