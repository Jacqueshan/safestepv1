// src/components/LocationHistoryLog.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
// Import necessary Firestore functions, including Timestamp
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';

function LocationHistoryLog({ deviceId }) {
  const [historyPoints, setHistoryPoints] = useState([]);
  const [loading, setLoading] = useState(false); // Initially false until deviceId is known
  const [error, setError] = useState('');

  useEffect(() => {
    // Only run query if we have a valid deviceId
    if (!deviceId) {
      setHistoryPoints([]); // Clear history if no device selected/available
      setLoading(false);
      setError('');
      return; // Exit effect
    }

    setLoading(true);
    setError('');

    // Calculate timestamp 12 hours ago
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const twelveHoursAgoTimestamp = Timestamp.fromDate(twelveHoursAgo);

    // Reference the subcollection
    const locationsRef = collection(db, 'devices', deviceId, 'locations');

    // Create the query
    const q = query(
      locationsRef,
      where('timestamp', '>=', twelveHoursAgoTimestamp), // Filter by timestamp >= 12 hours ago
      orderBy('timestamp', 'desc') // Show newest points first
      // limit(100) // Optional: Limit the number of points shown
    );

    // Listen for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const points = [];
      if (querySnapshot.empty) {
        console.log(`No location history found for device ${deviceId} in the last 12 hours.`);
      }
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Ensure data has timestamp and location before adding
        if (data.timestamp && data.location?.latitude != null && data.location?.longitude != null) {
           points.push({
             id: doc.id,
             timestamp: data.timestamp.toDate(), // Convert Firestore Timestamp to JS Date
             location: {
                 lat: data.location.latitude,
                 lng: data.location.longitude,
             }
           });
        } else {
            console.warn("Skipping history point with invalid data:", doc.id, data);
        }
      });
      setHistoryPoints(points);
      setLoading(false);
    }, (err) => {
      console.error(`Error fetching location history for device ${deviceId}:`, err);
      setError('Failed to load location history.');
      setLoading(false);
    });

    // Cleanup listener
    return () => unsubscribe();

  }, [deviceId]); // Re-run effect ONLY if deviceId changes

  // --- Render Logic ---

  if (!deviceId) {
      return <p className="text-sm text-gray-500 italic">Select a device to view history.</p>; // Or hide section
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  return (
    // Make the list scrollable if it gets too long
    <div className="max-h-60 overflow-y-auto border rounded p-2 bg-gray-50">
      {historyPoints.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No location points recorded in the last 12 hours for this device.</p>
      ) : (
        <ul className="space-y-1 text-xs">
          {historyPoints.map(point => (
            <li key={point.id} className="border-b last:border-b-0 py-1">
              <span className="font-medium text-gray-600">
                {/* Format timestamp nicely */}
                {point.timestamp.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'medium' })}
              </span>
              <span className="text-gray-500 ml-2">
                ({point.location.lat.toFixed(4)}, {point.location.lng.toFixed(4)})
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LocationHistoryLog;