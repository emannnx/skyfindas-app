import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAllServices, 
  addService, 
  updateService, 
  deleteService,
  subscribeToServices 
} from '../firebase/firestore';

const ServicesManagement = () => {
  const { isAdmin } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    availability: true
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/admin';
      return;
    }

    const loadServices = async () => {
      try {
        const data = await getAllServices();
        setServices(data);
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToServices((updatedServices) => {
      setServices(updatedServices);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) : 
              type === 'checkbox' ? e.target.checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.duration < 15) {
      setError('Duration must be at least 15 minutes');
      return;
    }

    try {
      if (editingService) {
        await updateService(editingService.id, formData);
        alert('Service updated successfully!');
      } else {
        await addService(formData);
        alert('Service added successfully!');
      }
      
      setShowModal(false);
      setEditingService(null);
      setFormData({
        title: '',
        description: '',
        duration: 30,
        availability: true
      });
      setError('');
    } catch (error) {
      console.error('Error saving service:', error);
      setError(error.message || 'Failed to save service. Please try again.');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      duration: service.duration,
      availability: service.availability !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      try {
        await deleteService(serviceId);
        alert('Service deleted successfully!');
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete service. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Services Management</h1>
          <p style={{ color: 'var(--gray-color)' }}>Manage available services for booking</p>
        </div>
        <button 
          onClick={() => {
            setEditingService(null);
            setFormData({
              title: '',
              description: '',
              duration: 30,
              availability: true
            });
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          + Add New Service
        </button>
      </div>

      {services.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Description</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>
                    <strong>{service.title}</strong>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <div style={{ 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}>
                      {service.description}
                    </div>
                  </td>
                  <td>{service.duration} minutes</td>
                  <td>
                    <span className={`status-badge ${
                      service.availability !== false ? 'status-approved' : 'status-cancelled'
                    }`}>
                      {service.availability !== false ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEdit(service)}
                      className="btn btn-outline btn-small mr-1"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(service.id)}
                      className="btn btn-danger btn-small"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <h3>No Services Added</h3>
          <p>Add your first service to get started.</p>
          <button 
            onClick={() => {
              setEditingService(null);
              setFormData({
                title: '',
                description: '',
                duration: 30,
                availability: true
              });
              setShowModal(true);
            }}
            className="btn btn-primary mt-2"
          >
            Add Service
          </button>
        </div>
      )}

      {/* Service Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowModal(false);
                  setEditingService(null);
                  setFormData({
                    title: '',
                    description: '',
                    duration: 30,
                    availability: true
                  });
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{
                    backgroundColor: 'var(--danger-color)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: 'var(--border-radius)',
                    marginBottom: '20px'
                  }}>
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="label">Service Title *</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter service title"
                  />
                </div>

                <div className="form-group">
                  <label className="label">Description *</label>
                  <textarea
                    name="description"
                    className="form-control"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    placeholder="Describe the service"
                  />
                </div>

                <div className="form-group">
                  <label className="label">Duration (minutes) *</label>
                  <input
                    type="number"
                    name="duration"
                    className="form-control"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    min="15"
                    step="15"
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      name="availability"
                      checked={formData.availability}
                      onChange={handleInputChange}
                    />
                    <span>Available for booking</span>
                  </label>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingService(null);
                    setFormData({
                      title: '',
                      description: '',
                      duration: 30,
                      availability: true
                    });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingService ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;