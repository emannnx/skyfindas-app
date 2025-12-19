import React, { useEffect } from 'react';
import { initializeSampleData } from '../firebase/firestore';

const InitializeDatabase = () => {
  useEffect(() => {
    const initData = async () => {
      try {
        await initializeSampleData();
        console.log('Sample data initialized successfully');
      } catch (error) {
        console.error('Failed to initialize sample data:', error);
      }
    };

    initData();
  }, []);

  return null; // This component doesn't render anything
};

export default InitializeDatabase;