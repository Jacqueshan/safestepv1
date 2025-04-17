// src/components/DeviceForm.jsx
import React, { useState } from 'react';
import { db } from '../firebase'; // Import Firestore instance
// Import functions for setting a document with a specific ID
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

function DeviceForm({ userId }) { // Receive userId as a prop
  const [deviceName, setDeviceName] = useState('');
  const [deviceIdInput, setDeviceIdInput] = useState(''); // Store the hardware ID input
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    // Basic validation
    if (!deviceName.trim() || !deviceIdInput.trim()) {
      setError('Both Device Name and Hardware ID are required.');
      setLoading(false);
      return;
    }
    // Optional: Add more validation for deviceIdInput format if needed

    try {
      // Create a reference to the document using the Hardware ID entered by the user
      // This means the document ID in Firestore will BE the Hardware ID
      const deviceDocRef = doc(db, 'devices', deviceIdInput.trim());

      // Data to save in the document
      const deviceData = {
        ownerUid: userId,             // Link device to the logged-in user
        name: deviceName.trim(),      // User-friendly name
        hardwareId: deviceIdInput.trim(), // Store the ID also as a field
        createdAt: serverTimestamp(), // Record creation time
        // Initialize other fields your function might update later
        latestLocation: null,         // Placeholder for GeoPoint
        lastSeen: null,               // Placeholder for Timestamp
        batteryLevel: null,           // Placeholder for Number
      };

      // Use setDoc to create or overwrite the document with the specific ID
      await setDoc(deviceDocRef, deviceData);

      setSuccessMessage(`Device "${deviceName.trim()}" added successfully!`);
      console.log('Device added/updated successfully with ID:', deviceIdInput.trim());

      // Clear the form
      setDeviceName('');
      setDeviceIdInput('');

    } catch (err) {
      console.error("Error adding/updating document: ", err);
      setError(`Failed to add device. Error: ${err.message}`);
    } finally {
      setLoading(false);
      // Clear success message after a few seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  return (
    // Replaced placeholder div content with this form
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3">Add New Device</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="deviceName" className="block text-gray-700 text-sm font-bold mb-2">Device Name*</label>
            <input
              type="text"
              id="deviceName"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g., Fido's Tracker"
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="deviceIdInput" className="block text-gray-700 text-sm font-bold mb-2">Hardware ID*</label>
            <input
              type="text"
              id="deviceIdInput"
              value={deviceIdInput}
              onChange={(e) => setDeviceIdInput(e.target.value)}
              placeholder="Enter unique device ID"
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              required
              disabled={loading}
            />
             <p className="text-xs text-gray-500 mt-1">This ID must match the one programmed into your physical device.</p>
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          {successMessage && <p className="text-green-600 text-xs italic mb-4">{successMessage}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Adding...' : 'Add Device'}
          </button>
        </form>
      </div>
  );
}

export default DeviceForm;