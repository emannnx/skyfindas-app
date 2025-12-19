import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser } from '../firebase/auth';
import { getUserDocument } from '../firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
          
          // Get user document from Firestore
          const userDoc = await getUserDocument(user.uid);
          if (userDoc) {
            setUserData(userDoc);
          } else {
            // Create user document if it doesn't exist
            const userData = {
              uid: user.uid,
              email: user.email,
              name: user.displayName || user.email.split('@')[0],
              createdAt: new Date()
            };
            setUserData(userData);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const unsubscribe = getCurrentUser().then(user => {
      if (user) {
        setCurrentUser(user);
        getUserDocument(user.uid).then(doc => {
          if (doc) setUserData(doc);
        });
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe;
  }, []);

  const logout = async () => {
    try {
      const { logout: firebaseLogout } = await import('../firebase/auth');
      await firebaseLogout();
      setCurrentUser(null);
      setUserData(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    isAdmin,
    setIsAdmin,
    setUserData,
    logout,
    updateUserData: (data) => setUserData(prev => ({ ...prev, ...data }))
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};