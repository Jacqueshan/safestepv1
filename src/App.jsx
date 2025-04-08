// src/App.jsx
import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; // Import auth instance
import { onAuthStateChanged, signOut } from "firebase/auth"; // Import listener and signOut

import Header from './components/Header';
import MainContent from './components/MainContent';
import LoginPage from './components/LoginPage'; // Import the LoginPage
import './App.css';

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Conditionally render Header with Sign Out button */}
      {user && <Header />} {/* Maybe pass user and handleSignOut to Header later */}

      <div className="flex-grow"> {/* Ensure content area takes remaining space */}
        {user ? (
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
            <MainContent />
          </>
        ) : (
          <LoginPage /> // Show LoginPage if user is not logged in
        )}
      </div>
    </div>
  );
}

export default App;