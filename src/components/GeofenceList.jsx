// src/components/GeofenceList.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import Firestore instance
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Define standard styles matching MainContent (or import from a shared location later)
const cardClasses = "bg-white p-6 rounded-xl shadow-lg border border-gray-200";
const headingClasses = "text-xl font-semibold text-gray-800 mb-4"; // Standardized heading style

function GeofenceList({ userId }) {
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch Geofences (Real-time)
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError('');
    const geofencesCollectionRef = collection(db, 'geofences');
    const q = query(
      geofencesCollectionRef,
      where('ownerUid', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fences = [];
      querySnapshot.forEach((doc) => {
        fences.push({
          id: doc.id,
          ...doc.data(),
          isEnabled: typeof doc.data().isEnabled === 'boolean' ? doc.data().isEnabled : true
        });
      });
      setGeofences(fences);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching geofences for list:", err);
      setError('Failed to load geofences.');
      setLoading(false);
    });

    return () => unsubscribe();

  }, [userId]);

  // Function to toggle the enabled status in Firestore
  const toggleGeofenceStatus = async (id, currentStatus) => {
    if (!id) return;
    const fenceDocRef = doc(db, 'geofences', id);
    try {
      await updateDoc(fenceDocRef, {
        isEnabled: !currentStatus
      });
      console.log(`Geofence ${id} status toggled successfully.`);
    } catch (err) {
      console.error("Error updating geofence status:", err);
      // Optionally show user feedback
    }
  };

  // Function to delete a geofence document from Firestore
  const handleDeleteFence = async (id, name) => {
    if (!id) return;
    if (window.confirm(`Are you sure you want to delete the geofence "${name || 'this fence'}"? This cannot be undone.`)) {
      const fenceDocRef = doc(db, 'geofences', id);
      try {
        await deleteDoc(fenceDocRef);
        console.log(`Geofence ${id} deleted successfully.`);
      } catch (err) {
        console.error("Error deleting geofence:", err);
        alert(`Failed to delete geofence: ${err.message}`);
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
         <h3 className={headingClasses}>Manage Geofences</h3>
         <p className="text-red-500">{error}</p>
       </div>
    );
  }

  // --- Display List State ---
  return (
    // Applied standard card classes to the main container
    <div className={cardClasses}>
      {/* Applied standard heading classes */}
      <h3 className={headingClasses}>Manage Geofences</h3>
      {geofences.length === 0 ? (
        <p className="text-gray-500 text-sm">You haven't added any geofences yet.</p>
      ) : (
        <ul className="space-y-3">
          {geofences.map((fence) => (
            <li
              key={fence.id}
              className={`p-3 border rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center transition-opacity duration-150 ${
                fence.isEnabled ? 'opacity-100 bg-white' : 'opacity-60 bg-gray-100'
              }`}
            >
              {/* Fence Info Div */}
              <div className="mb-2 sm:mb-0">
                <p className="font-semibold text-gray-800">{fence.name}</p>
                <p className="text-sm text-gray-500">Radius: {fence.radius} meters</p>
                 <p className={`text-xs font-medium ${fence.isEnabled ? 'text-green-600': 'text-gray-500'}`}>
                    {fence.isEnabled ? 'Status: Enabled' : 'Status: Disabled'}
                 </p>
              </div>

              {/* Buttons Div - Use flex for alignment */}
              <div className="flex space-x-2 mt-2 sm:mt-0 self-end sm:self-center">
                {/* Enable/Disable Button */}
                <button
                  onClick={() => toggleGeofenceStatus(fence.id, fence.isEnabled)}
                  className={`text-white font-bold py-1 px-3 rounded text-xs focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
                    fence.isEnabled
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      // --- CORRECTED LINE BELOW (No asterisk) ---
                      : 'bg-green-500 hover:bg-green-600'
                      // --- END CORRECTION ---
                  }`}
                >
                  {fence.isEnabled ? 'Disable' : 'Enable'}
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteFence(fence.id, fence.name)} // Call delete handler
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GeofenceList;