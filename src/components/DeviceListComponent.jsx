// src/components/DeviceListComponent.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import Firestore instance
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';

// Define standard styles matching MainContent (or import from a shared location later)
const cardClasses = "bg-white p-6 rounded-xl shadow-lg border border-gray-200";
const headingClasses = "text-xl font-semibold text-gray-800 mb-4";

function DeviceListComponent({ userId }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch Devices (Real-time)
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError('');
    const devicesCollectionRef = collection(db, 'devices');
    const q = query(
      devicesCollectionRef,
      where('ownerUid', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const devicesArray = [];
      querySnapshot.forEach((doc) => {
        devicesArray.push({ id: doc.id, ...doc.data() });
      });
      setDevices(devicesArray);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching devices:", err);
      setError('Failed to load devices.');
      setLoading(false);
    });

    return () => unsubscribe();

  }, [userId]);

  // Delete Functionality
  const handleDeleteDevice = async (id, name) => {
    if (!id) return;
    if (window.confirm(`Are you sure you want to delete device "${name || id}"? This action cannot be undone.`)) {
      const deviceDocRef = doc(db, 'devices', id);
      try {
        await deleteDoc(deviceDocRef);
        console.log(`Device ${id} document deleted.`);
      } catch (err) {
        console.error("Error deleting device:", err);
        alert(`Failed to delete device: ${err.message}`);
      }
    }
  };

  // --- Loading State ---
  if (loading) {
    // Applied standard card classes + centering for spinner
    return (
      <div className={`${cardClasses} flex justify-center items-center min-h-[100px]`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    // Applied standard card classes
    return (
       <div className={cardClasses}>
         {/* Applied standard heading classes */}
         <h3 className={headingClasses}>Your Devices</h3>
         <p className="text-red-500">{error}</p>
       </div>
    );
  }

  // --- Display List State ---
  return (
    // Applied standard card classes to the main container
    <div className={cardClasses}>
      {/* Applied standard heading classes */}
      <h3 className={headingClasses}>Your Devices</h3>
      {devices.length === 0 ? (
        <p className="text-gray-500 text-sm">You haven't added any devices yet.</p>
      ) : (
        <ul className="space-y-3">
          {devices.map((device) => (
            <li
              key={device.id}
              className="p-3 border rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
              {/* Device Info */}
              <div className="mb-2 sm:mb-0">
                <p className="font-semibold text-gray-800">{device.name}</p>
                <p className="text-sm text-gray-500">ID: {device.hardwareId || device.id}</p>
                {device.lastSeen && (
                  <p className="text-xs text-gray-400">Last Seen: {device.lastSeen?.toDate().toLocaleString() ?? 'N/A'}</p>
                )}
              </div>
              {/* Actions */}
              <div className="flex space-x-2 self-end sm:self-center">
                <button
                  onClick={() => handleDeleteDevice(device.id, device.name)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs focus:outline-none focus:shadow-outline"
                >
                  Delete
                </button>
                {/* Add View on Map button later? */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DeviceListComponent;