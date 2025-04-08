// src/components/MapComponent.jsx
import React from 'react';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api'; // Use MarkerF for functional component compatibility

// --- Map Styling ---
const containerStyle = {
  width: '100%',
  height: '450px', // You can adjust this height
  borderRadius: '0.5rem' // Optional: match rounded corners if desired
};

// --- Default Map Center (Example: New York City) ---
// You might want to get the user's location or default to a relevant area later
const defaultCenter = {
  lat: 40.7128, // Latitude
  lng: -74.0060  // Longitude
};

// --- Get API Key from Environment Variable ---
const apiKey = import.meta.env.VITE_Maps_API_KEY;

function MapComponent() {

  // --- Check if API Key is loaded ---
  if (!apiKey) {
    console.error("Google Maps API key is missing. Make sure it's set in your .env file as VITE_Maps_API_KEY and you restarted the dev server.");
    return (
      <div className="bg-red-100 p-4 rounded border border-red-400 text-red-700 text-sm">
        Error: Google Maps API Key is missing or invalid. Please check configuration.
      </div>
    );
  }

  // --- Render the Map ---
  return (
    // LoadScript handles loading the Google Maps script asynchronously
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter} // Center the map on load
        zoom={11} // Adjust initial zoom level (higher number = closer in)
        options={{ // Optional: Customize map controls
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true, // Keep zoom control
        }}
      >
        {/* --- Markers Will Go Here --- */}
        {/* Example Marker - Remove or replace later */}
        <MarkerF
          position={defaultCenter}
          title="Default Location Marker"
          // icon={'url-to-your-custom-dog-icon.png'} // Optional: custom icon
        />

        {/* Later, you will map over device data from Firestore to create multiple markers */}

      </GoogleMap>
    </LoadScript>
  );
}

// Using React.memo can prevent unnecessary re-renders if props don't change
export default React.memo(MapComponent);