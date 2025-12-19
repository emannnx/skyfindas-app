import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
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
import { db } from './index';

// Collections
export const usersCollection = collection(db, 'users');
export const servicesCollection = collection(db, 'services');
export const appointmentsCollection = collection(db, 'appointments');

// User operations
export const createUserDocument = async (userData) => {
  try {
    const docRef = doc(db, 'users', userData.uid);
    await updateDoc(docRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return userData.uid;
  } catch (error) {
    // If document doesn't exist, create it
    if (error.code === 'not-found') {
      const docRef = doc(db, 'users', userData.uid);
      await updateDoc(docRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      return userData.uid;
    }
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
    console.error('Error getting services:', error);
    throw error;
  }
};

export const addService = async (serviceData) => {
  try {
    return await addDoc(servicesCollection, {
      ...serviceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
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
  try {
    const q = query(servicesCollection, orderBy('title'));
    return onSnapshot(q, (snapshot) => {
      const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(services);
    }, (error) => {
      console.error('Error in services subscription:', error);
    });
  } catch (error) {
    console.error('Error setting up services subscription:', error);
    throw error;
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