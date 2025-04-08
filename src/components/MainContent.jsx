// src/components/MainContent.jsx
import React from 'react';
import MapComponent from './MapComponent'; // <-- Import the MapComponent

// Receive the user prop from App.jsx
function MainContent({ user }) {
  return (
    // Main container for dashboard content with padding
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Dashboard Title */}
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
        Welcome, {user?.email || 'User'}! {/* Display user email if available */}
      </h2>

      {/* Grid Layout for Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* --- Map Area (Spanning multiple columns on larger screens) --- */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3">Map Overview</h3>

          {/* The actual Map Component is rendered here */}
          <MapComponent />

          {/* You can keep or remove the note below */}
          {/* <p className="text-xs text-gray-500 mt-2">Real-time map view.</p> */}
        </div>

        {/* --- Right Column / Sidebar Area --- */}
        <div className="space-y-6"> {/* Use space-y to add vertical space between items in this column */}

          {/* Add Device Action Placeholder */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3">Add New Device</h3>
            <p className="text-sm text-gray-600 mb-4">
              Register a new SafeStep tracker to start monitoring.
            </p>
            {/* Placeholder Button - doesn't do anything yet */}
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
            {/* Example Placeholder List Items */}
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

        </div> {/* End of Sidebar Column */}

      </div> {/* End of Grid */}

    </main>
  );
}

export default MainContent;