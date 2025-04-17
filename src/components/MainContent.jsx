// src/components/MainContent.jsx
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { db } from '../firebase'; // Import Firestore instance
// Import Firestore document functions needed: doc and onSnapshot (replace getDoc)
import { doc, onSnapshot } from "firebase/firestore";

// Import all child components
import MapComponent from './MapComponent';
import GeofenceList from './GeofenceList';
import DeviceForm from './DeviceForm';
import DeviceListComponent from './DeviceListComponent';
import ProfileEditor from './ProfileEditor'; // <-- Import the new ProfileEditor component

// Receive the user prop from App.jsx (this contains the auth user object)
function MainContent({ user }) {
  const userId = user?.uid;

  // State for Display Name
  const [displayName, setDisplayName] = useState(''); // Initialize display name state
  // State for SOS Message
  const [sosMessage, setSosMessage] = useState('');

  // --- MODIFIED: Effect to fetch user profile data (displayName) using onSnapshot ---
  useEffect(() => {
    if (!userId) {
      setDisplayName(''); // Clear name if no user
      return; // Exit if no userId
    }

    const userDocRef = doc(db, 'users', userId);

    // Set up the real-time listener using onSnapshot
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const profileData = docSnap.data();
        console.log("User profile data updated (listener):", profileData);
        setDisplayName(profileData.displayName || ''); // Use fetched name or empty string
      } else {
        // Document doesn't exist
        console.log("No user profile found in Firestore for UID:", userId);
        setDisplayName(''); // Set to empty
      }
    }, (error) => { // Handle errors from the listener itself
      console.error("Error listening to user profile:", error);
      // Consider setting an error state here if needed
      setDisplayName('');
    });

    // Cleanup: Detach the listener when the component unmounts or userId changes
    return () => unsubscribe();

  }, [userId]); // Re-run effect if the userId changes
  // --- END MODIFIED ---

  // Check for valid userId before rendering main content
  if (!userId) {
    console.error("MainContent rendered without a valid user ID!");
    return <div className="container mx-auto p-8 text-red-500">Error: User information is missing.</div>;
  }

  // Handler for the SOS button click
  const handleSosClick = () => {
    console.log('SOS Button Clicked! User ID:', userId, 'Timestamp:', new Date().toISOString());
    setSosMessage('SOS Activated! [Future: High-frequency tracking enabled, notifications sent]');
    setTimeout(() => { setSosMessage(''); }, 10000);
  };

  // Define standard styles
  const cardClasses = "bg-white p-6 rounded-xl shadow-lg border border-gray-200";
  const headingClasses = "text-xl font-semibold text-gray-800 mb-4";

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">

      {/* Dashboard Title - Uses displayName state */}
      <h2 className={`${headingClasses} text-2xl sm:text-3xl`}> {/* Combined styles */}
        Welcome, {displayName || user?.email || 'User'}!
      </h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Map Area */}
        <div className={`${cardClasses} lg:col-span-2`}>
          <h3 className={headingClasses}>Map Overview</h3>
          <MapComponent userId={userId} />
          {/* SOS Button Section */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button type="button" onClick={handleSosClick} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out text-lg">
              SOS - Report Dog Lost / Outside Zone
            </button>
            {sosMessage && (<p className="mt-3 text-center text-red-700 font-semibold text-sm">{sosMessage}</p>)}
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          {/* --- ADDED: Profile Editor Component at the top of sidebar --- */}
          <ProfileEditor userId={userId} />
          {/* --- END ADDED --- */}

          {/* NOTE: Remember to apply cardClasses and headingClasses INSIDE these components if not done yet */}
          <DeviceForm userId={userId} />
          <DeviceListComponent userId={userId} />
          <GeofenceList userId={userId} />
        </div>

      </div>
    </main>
  );
}

export default MainContent;