import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Sky Appointments</h3>
            <p>Efficient and reliable appointment booking system for modern businesses.</p>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <p>
              <a href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</a><br />
              <a href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</a><br />
              <a href="/admin" style={{ color: 'white', textDecoration: 'none' }}>Admin Login</a>
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Contact</h3>
            <p>
              Email: support@skyappointments.com<br />
              Phone: (123) 456-7890<br />
              Hours: Mon-Fri 9AM-6PM
            </p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Sky Appointments. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;