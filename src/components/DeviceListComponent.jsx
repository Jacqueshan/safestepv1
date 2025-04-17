// src/components/DeviceListComponent.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import Firestore instance
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore'; // Added deleteDoc

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
      where('ownerUid', '==', userId), // Filter by the logged-in user's ID
      orderBy('createdAt', 'desc')     // Order by creation time
    );

    // Listen for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const devicesArray = [];
      querySnapshot.forEach((doc) => {
        devicesArray.push({ id: doc.id, ...doc.data() }); // Include document ID
      });
      setDevices(devicesArray);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching devices:", err);
      setError('Failed to load devices.');
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();

  }, [userId]); // Re-run if userId changes

  // --- Optional: Add Delete Functionality ---
  const handleDeleteDevice = async (id, name) => {
    if (!id) return;
    if (window.confirm(`Are you sure you want to delete device "${name || id}"? This will also delete its location history if structured as a subcollection.`)) {
       const deviceDocRef = doc(db, 'devices', id);
       try {
         // Note: Deleting a document does NOT automatically delete its subcollections in Firestore.
         // Handling subcollection deletion requires more complex logic (e.g., a Cloud Function).
         await deleteDoc(deviceDocRef);
         console.log(`Device ${id} document deleted.`);
       } catch (err) {
          console.error("Error deleting device:", err);
          alert(`Failed to delete device: ${err.message}`);
       }
    }
  };
  // --- End Optional Delete ---


  if (loading) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 flex justify-center items-center min-h-[100px]"> {/* Added flex centering and min-height */}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div> {/* Simple Tailwind Spinner */}
      </div>
    );
  }

  if (error) {
    return <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200"><p className="text-red-500">{error}</p></div>;
  }

  return (
    // Replaced placeholder div content with this list
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3">Your Devices</h3>
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
                <p className="text-sm text-gray-500">ID: {device.hardwareId || device.id}</p> {/* Show hardwareId field or doc id */}
                {/* You could display lastSeen or batteryLevel here later */}
                {device.lastSeen && (
                   <p className="text-xs text-gray-400">Last Seen: {device.lastSeen?.toDate().toLocaleString() ?? 'N/A'}</p>
                )}
              </div>
              {/* Actions */}
              <div className="flex space-x-2 self-end sm:self-center">
                 {/* Optional: Delete Button */}
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