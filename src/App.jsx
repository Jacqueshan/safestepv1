// src/App.jsx
import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; // Import auth instance
import { onAuthStateChanged, signOut } from "firebase/auth"; // Import listener and signOut

import Header from './components/Header';
import MainContent from './components/MainContent';
import LoginPage from './components/LoginPage'; // Import the LoginPage
import './App.css'; // Or './index.css' if you renamed it

function App() {
  const [user, setUser] = useState(null); // State to hold the logged-in user object
  const [loading, setLoading] = useState(true); // State to handle initial auth check

  // Listener for authentication state changes
  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set user to null if logged out, user object if logged in
      setLoading(false); // Auth state determined, stop loading
      console.log("Auth State Changed, Current User:", currentUser);
    });

    // Cleanup: Unsubscribe when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Show loading indicator while checking auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // Main application structure
  return (
    // Changed bg-gray-50 to bg-slate-100 for page background
    <div className="flex flex-col min-h-screen bg-slate-100">
      {/* Conditionally render Header only when logged in */}
      {user && <Header />} {/* You might pass handleSignOut to Header later */}

      {/* This inner div remains for layout, no background needed here */}
      <div className="flex-grow">
        {user ? ( // Check if user is logged in
          <>
            {/* Show Sign Out button somewhere accessible */}
            <div className="container mx-auto px-6 pt-4 flex justify-end">
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Sign Out
              </button>
            </div>
            {/* Render MainContent and pass the user object as a prop */}
            <MainContent user={user} />
          </>
        ) : (
          // If user is not logged in, show LoginPage
          <LoginPage />
        )}
      </div>
      {/* Optional Footer could go here */}
    </div>
  );
}

export default App;