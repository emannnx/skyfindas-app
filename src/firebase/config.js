import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAghjhVQ20wAOuntQk_QIk5RG3bTzfyCEs",
  authDomain: "sky-appointment.firebaseapp.com",
  projectId: "sky-appointment",
  storageBucket: "sky-appointment.firebasestorage.app",
  messagingSenderId: "1093590208490",
  appId: "1:1093590208490:web:7338dceebb6ea5815f6c93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;