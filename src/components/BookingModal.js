import React, { useState } from 'react';
import { format, addDays } from 'date-fns';

const BookingModal = ({ service, onSubmit, onClose }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time');
      return;
    }

    // Combine date and time into a single Date object
    const [hours, minutes] = selectedTime.split(':');
    const dateTime = new Date(selectedDate);
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    onSubmit({
      date: dateTime,
      time: selectedTime,
      notes
    });
  };

  const minDate = format(new Date(), 'yyyy-MM-dd');
  const maxDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Book {service.title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="label">Date</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                max={maxDate}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="label">Time</label>
              <select
                className="form-control"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
              >
                <option value="">Select a time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="label">Additional Notes (Optional)</label>
              <textarea
                className="form-control"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                placeholder="Any special requirements or notes..."
              />
            </div>
            
            <div className="booking-summary mt-3">
              <p><strong>Service:</strong> {service.title}</p>
              <p><strong>Duration:</strong> {service.duration} minutes</p>
              {selectedDate && selectedTime && (
                <p className="text-primary">
                  <strong>Selected:</strong> {format(new Date(`${selectedDate}T${selectedTime}`), 'MMM dd, yyyy hh:mm a')}
                </p>
              )}
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;