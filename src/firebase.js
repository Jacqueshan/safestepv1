import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from 'firebase/functions'; // If you plan to use Cloud Functions

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBj5ykvVg_MCxi18iSmBgxAGgu8cZ6Z7Mc",
  authDomain: "safestepv1.firebaseapp.com",
  projectId: "safestepv1",
  storageBucket: "safestepv1.firebasestorage.app",
  messagingSenderId: "186492724925",
  appId: "1:186492724925:web:2940b415f7d26956cfb9d4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// --- ADD THESE LINES ---
// Initialize Firebase services
const db = getFirestore(app);        // Initialize Firestore
const auth = getAuth(app);           // Initialize Firebase Authentication
// const functions = getFunctions(app); // Initialize Cloud Functions if needed

// Export the services for use in other parts of your app
export { db, auth /*, functions */ }; // Add functions here if you initialized it
// --- END OF ADDED LINES ---
