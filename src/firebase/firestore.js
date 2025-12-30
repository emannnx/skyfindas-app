import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  setDoc,
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

// Collections
export const usersCollection = collection(db, 'users');
export const servicesCollection = collection(db, 'services');
export const appointmentsCollection = collection(db, 'appointments');

// User operations
export const createUserDocument = async (userData) => {
  try {
    const docRef = doc(db, 'users', userData.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Document exists, update it
      await updateDoc(docRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Document doesn't exist, create it
      await setDoc(docRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return userData.uid;
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

export const getUserDocument = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error('Error getting user document:', error);
    throw error;
  }
};

// Service operations
export const getAllServices = async () => {
  try {
    const snapshot = await getDocs(query(servicesCollection, orderBy('title')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    // If index is missing, try without orderBy
    if (error.code === 'failed-precondition') {
      console.warn('Index missing for getAllServices, fetching without orderBy');
      try {
        const snapshot = await getDocs(servicesCollection);
        const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort manually
        return services.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      } catch (retryError) {
        console.error('Error getting services (retry):', retryError);
        throw retryError;
      }
    }
    console.error('Error getting services:', error);
    throw error;
  }
};

// Get only available services (for users)
export const getAvailableServices = async () => {
  try {
    const allServices = await getAllServices();
    return allServices.filter(service => service.availability !== false);
  } catch (error) {
    console.error('Error getting available services:', error);
    throw error;
  }
};

export const addService = async (serviceData) => {
  try {
    // Validate service data
    if (!serviceData.title || !serviceData.description) {
      throw new Error('Service title and description are required');
    }
    
    if (serviceData.duration && serviceData.duration < 15) {
      throw new Error('Service duration must be at least 15 minutes');
    }

    const docRef = await addDoc(servicesCollection, {
      ...serviceData,
      availability: serviceData.availability !== false, // Default to true
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef;
  } catch (error) {
    console.error('Error adding service:', error);
    throw error;
  }
};

export const updateService = async (serviceId, serviceData) => {
  try {
    const docRef = doc(db, 'services', serviceId);
    return await updateDoc(docRef, {
      ...serviceData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

export const deleteService = async (serviceId) => {
  try {
    const docRef = doc(db, 'services', serviceId);
    return await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

// Appointment operations
export const createAppointment = async (appointmentData) => {
  try {
    // Ensure date is a Timestamp
    let date = appointmentData.date;
    if (!(date instanceof Timestamp)) {
      date = Timestamp.fromDate(new Date(date));
    }
    
    return await addDoc(appointmentsCollection, {
      ...appointmentData,
      date,
      status: 'Pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const docRef = doc(db, 'appointments', appointmentId);
    return await updateDoc(docRef, { 
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

export const getAppointmentsByDate = async (date) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);
    
    const q = query(
      appointmentsCollection,
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp),
      orderBy('date')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    // If index is missing, try without orderBy
    if (error.code === 'failed-precondition') {
      console.warn('Index missing for getAppointmentsByDate, fetching without orderBy');
      try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const startTimestamp = Timestamp.fromDate(startOfDay);
        const endTimestamp = Timestamp.fromDate(endOfDay);
        
        const q = query(
          appointmentsCollection,
          where('date', '>=', startTimestamp),
          where('date', '<=', endTimestamp)
        );
        
        const snapshot = await getDocs(q);
        const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort manually
        return appointments.sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
          return dateA - dateB;
        });
      } catch (retryError) {
        console.error('Error getting appointments by date (retry):', retryError);
        throw retryError;
      }
    }
    console.error('Error getting appointments by date:', error);
    throw error;
  }
};

export const getUserAppointments = async (userId) => {
  try {
    const q = query(
      appointmentsCollection,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    // If index is missing, try without orderBy
    if (error.code === 'failed-precondition') {
      console.warn('Index missing for getUserAppointments, fetching without orderBy');
      try {
        const q = query(
          appointmentsCollection,
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort manually
        return appointments.sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
          return dateB - dateA;
        });
      } catch (retryError) {
        console.error('Error getting user appointments (retry):', retryError);
        throw retryError;
      }
    }
    console.error('Error getting user appointments:', error);
    throw error;
  }
};

export const getAllAppointments = async () => {
  try {
    const q = query(appointmentsCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting all appointments:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToAppointments = (callback) => {
  try {
    const q = query(appointmentsCollection, orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(appointments);
    }, (error) => {
      console.error('Error in appointments subscription:', error);
    });
  } catch (error) {
    console.error('Error setting up appointments subscription:', error);
    throw error;
  }
};

export const subscribeToServices = (callback) => {
  let unsubscribe = null;
  
  try {
    const q = query(servicesCollection, orderBy('title'));
    unsubscribe = onSnapshot(q, (snapshot) => {
      const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(services);
    }, (error) => {
      // If index is missing, set up fallback subscription
      if (error.code === 'failed-precondition') {
        console.warn('Index missing for subscribeToServices, using without orderBy');
        // Unsubscribe from the failed subscription if it exists
        if (unsubscribe) {
          unsubscribe();
        }
        // Set up fallback subscription without orderBy
        unsubscribe = onSnapshot(servicesCollection, (snapshot) => {
          const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Sort manually
          services.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
          callback(services);
        }, (retryError) => {
          console.error('Error in services subscription (retry):', retryError);
        });
      } else {
        console.error('Error in services subscription:', error);
      }
    });
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  } catch (error) {
    // If query setup fails, use fallback without orderBy
    console.warn('Error setting up services subscription with orderBy, using fallback');
    unsubscribe = onSnapshot(servicesCollection, (snapshot) => {
      const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort manually
      services.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      callback(services);
    }, (fallbackError) => {
      console.error('Error in services subscription (fallback):', fallbackError);
    });
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }
};

// Initialize sample data
export const initializeSampleData = async () => {
  try {
    // Check if services already exist
    const existingServices = await getAllServices();
    
    if (existingServices.length === 0) {
      const sampleServices = [
        {
          title: 'Consultation Session',
          description: 'Initial consultation to discuss your needs and requirements',
          duration: 60,
          availability: true,
        },
        {
          title: 'Technical Support',
          description: 'Get help with technical issues and troubleshooting',
          duration: 30,
          availability: true,
        },
        {
          title: 'Training Session',
          description: 'Learn how to use our platform effectively',
          duration: 90,
          availability: true,
        },
        {
          title: 'Product Demo',
          description: 'See our products in action with a live demonstration',
          duration: 45,
          availability: true,
        }
      ];

      for (const service of sampleServices) {
        await addService(service);
        console.log(`Added service: ${service.title}`);
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error initializing sample data:', error);
    throw error;
  }
};