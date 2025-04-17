// src/components/MainContent.jsx
import React, { useState } from 'react'; // Import useState hook
import MapComponent from './MapComponent';    // Renders the map
import GeofenceList from './GeofenceList';  // Renders the geofence list
import DeviceForm from './DeviceForm';
import DeviceListComponent from './DeviceListComponent'; // Use the new name

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
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200">
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

          {/* Render the functional DeviceForm, passing the userId */}
          <DeviceForm userId={userId} />

          {/* Render the functional DeviceList, passing the userId */}
          <DeviceListComponent userId={userId} />

          {/* Geofence List Component (Remains the same) */}
          <GeofenceList userId={userId} />

        </div> {/* End of Sidebar Column */} 
      </div> 
    </main>
  );
}

export default MainContent;