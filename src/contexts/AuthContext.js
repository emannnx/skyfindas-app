import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { logout as firebaseLogout } from '../firebase/auth';
import { getUserDocument, createUserDocument } from '../firebase/firestore';

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
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user);
          
          // Get or create user document
          let userDoc = await getUserDocument(user.uid);
          
          if (!userDoc) {
            // Create user document if it doesn't exist
            await createUserDocument({
              uid: user.uid,
              email: user.email,
              name: user.displayName || user.email?.split('@')[0] || 'User',
              createdAt: new Date()
            });
            userDoc = await getUserDocument(user.uid);
          }
          
          setUserData(userDoc);
          
          // Check if user is admin (you can customize this logic)
          // For now, we'll check if email contains 'admin' or set via userData
          if (userDoc?.isAdmin || user.email?.includes('admin')) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          setCurrentUser(null);
          setUserData(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
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
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};