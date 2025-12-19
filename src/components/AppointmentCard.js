import React from 'react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

const AppointmentCard = ({ appointment, onUpdateStatus, isAdmin = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'status-approved';
      case 'Cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    let dateObj;
    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (date.toDate) {
      dateObj = date.toDate();
    } else {
      dateObj = new Date(date);
    }
    
    return format(dateObj, 'MMM dd, yyyy hh:mm a');
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    
    let dateObj;
    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (date.toDate) {
      dateObj = date.toDate();
    } else {
      dateObj = new Date(date);
    }
    
    return format(dateObj, 'hh:mm a');
  };

  return (
    <div className="appointment-card">
      <div className="appointment-header">
        <div>
          <h4 className="appointment-service">{appointment.serviceName}</h4>
          <div className="appointment-date">
            {formatDate(appointment.date)}
          </div>
        </div>
        <span className={`status-badge ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>
      
      {isAdmin && (
        <div className="appointment-user">
          <strong>👤 {appointment.userName}</strong>
          <span>({appointment.userEmail})</span>
        </div>
      )}
      
      {appointment.notes && (
        <div className="appointment-notes" style={{ marginTop: '10px', fontSize: '14px', color: 'var(--dark-gray)' }}>
          <strong>Notes:</strong> {appointment.notes}
        </div>
      )}
      
      {isAdmin && appointment.status === 'Pending' && (
        <div className="appointment-actions">
          <button 
            onClick={() => onUpdateStatus(appointment.id, 'Approved')}
            className="btn btn-success btn-small"
          >
            Approve
          </button>
          <button 
            onClick={() => onUpdateStatus(appointment.id, 'Cancelled')}
            className="btn btn-danger btn-small"
          >
            Cancel
          </button>
        </div>
      )}
      
      {!isAdmin && appointment.status === 'Pending' && (
        <div className="appointment-note" style={{ marginTop: '10px' }}>
          <small>⏳ Waiting for admin approval</small>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;