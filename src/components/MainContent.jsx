// src/components/MainContent.jsx
import React, { useState } from 'react'; // Import useState hook
import MapComponent from './MapComponent';    // Renders the map
import GeofenceList from './GeofenceList';  // Renders the geofence list

// Receive the user prop from App.jsx
function MainContent({ user }) {
  // Ensure user object exists and has uid before rendering components that need it
  const userId = user?.uid;

  // --- Add state for the SOS message ---
  const [sosMessage, setSosMessage] = useState('');

  if (!userId) {
     console.error("MainContent rendered without a valid user ID!");
     return <div className="container mx-auto p-8 text-red-500">Error: User information is missing.</div>;
  }

  // --- Handler for the SOS button click ---
  const handleSosClick = () => {
    console.log('SOS Button Clicked! User ID:', userId, 'Timestamp:', new Date().toISOString());
    // Set a message to confirm activation (temporary UI feedback)
    setSosMessage('SOS Activated! [Future: High-frequency tracking enabled, notifications sent]');
    // Clear the message after a delay (e.g., 10 seconds)
    setTimeout(() => {
      setSosMessage('');
    }, 10000);
  };

  return (
    // Main container for dashboard content with padding
    // No background image classes/style needed here as per your decision
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow"> {/* Removed relative class if unused */}

      {/* Dashboard Title */}
      {/* Removed background/blur classes from title as background image was removed */}
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
        Welcome, {user?.email || 'User'}! {/* Display user email if available */}
      </h2>

      {/* Grid Layout for Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* --- Map Area (Spanning multiple columns on larger screens) --- */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3">Map Overview</h3>

          {/* The actual Map Component is rendered here, passing the userId */}
          <MapComponent userId={userId} />

          {/* --- SOS BUTTON ADDED HERE --- */}
          <div className="mt-4 pt-4 border-t border-gray-200"> {/* Added spacing and separator */}
            <button
              type="button"
              onClick={handleSosClick}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out text-lg"
            >
              SOS - Report Dog Lost / Outside Zone
            </button>
            {/* Display confirmation message */}
            {sosMessage && (
              <p className="mt-3 text-center text-red-700 font-semibold text-sm">
                {sosMessage}
              </p>
            )}
          </div>
          {/* --- END OF SOS BUTTON --- */}

        </div>

        {/* --- Right Column / Sidebar Area --- */}
        <div className="space-y-6"> {/* Use space-y to add vertical space between items in this column */}

          {/* Add Device Action Placeholder */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3">Add New Device</h3>
            <p className="text-sm text-gray-600 mb-4">
              Register a new SafeStep tracker to start monitoring.
            </p>
            <button
              type="button"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
            >
              Add Device
            </button>
          </div>

          {/* Device List Summary Placeholder */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3">Your Devices</h3>
            <p className="text-sm text-gray-600 mb-4">A list of your registered devices will appear here.</p>
            <ul className="space-y-2">
              <li className="flex justify-between items-center p-2 border rounded bg-gray-50">
                <span className="text-sm font-medium text-gray-700">Fido's Tracker (Placeholder)</span>
                <span className="text-xs font-semibold text-green-600">Online</span>
              </li>
              <li className="flex justify-between items-center p-2 border rounded bg-gray-50">
                <span className="text-sm font-medium text-gray-700">Rover's Backup (Placeholder)</span>
                <span className="text-xs font-semibold text-gray-500">Offline</span>
              </li>
            </ul>
          </div>

          {/* Geofence List Component (Added below the device list placeholder) */}
          <GeofenceList userId={userId} />

        </div> 
      </div> 
    </main>
  );
}

export default MainContent;