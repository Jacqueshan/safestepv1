// src/components/MainContent.jsx
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { db } from '../firebase'; // Import Firestore instance
// Import Firestore functions needed
import { doc, onSnapshot, collection, query, where, orderBy } from "firebase/firestore";

// Import all child components
import MapComponent from './MapComponent';
import GeofenceList from './GeofenceList';
import DeviceForm from './DeviceForm';
import DeviceListComponent from './DeviceListComponent';
import ProfileEditor from './ProfileEditor';
import LocationHistoryLog from './LocationHistoryLog';

// Receive the user prop from App.jsx (this contains the auth user object)
function MainContent({ user }) {
  const userId = user?.uid;

  // State for Display Name
  const [displayName, setDisplayName] = useState('');
  // State for SOS Message
  const [sosMessage, setSosMessage] = useState('');
  // State for devices list
  const [devicesList, setDevicesList] = useState([]);
  // State for the device ID whose history we want to show
  const [targetDeviceId, setTargetDeviceId] = useState(null);

  // Effect to fetch user profile data (displayName) using onSnapshot
  useEffect(() => {
    if (!userId) {
      setDisplayName('');
      return;
    }
    const userDocRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const profileData = docSnap.data();
        setDisplayName(profileData.displayName || '');
      } else {
        console.log("No user profile found in Firestore for UID:", userId);
        setDisplayName('');
      }
    }, (error) => {
      console.error("Error listening to user profile:", error);
      setDisplayName('');
    });
    return () => unsubscribe();
  }, [userId]);

  // Effect to fetch devices list and set the target device ID for history
  useEffect(() => {
    if (!userId) {
      setDevicesList([]);
      setTargetDeviceId(null);
      return; // Exit if no user
    };
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
      setDevicesList(devicesArray);
      const firstDeviceId = devicesArray.length > 0 ? devicesArray[0].id : null;
      setTargetDeviceId(firstDeviceId);
      console.log("Fetched devices, target ID for history:", firstDeviceId || 'None');
    }, (err) => {
      console.error("Error fetching devices in MainContent:", err);
      setDevicesList([]);
      setTargetDeviceId(null);
    });
    return () => unsubscribe();
  }, [userId]);

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

      {/* Dashboard Title */}
      <h2 className={`${headingClasses} text-2xl sm:text-3xl`}>
        Welcome, {displayName || user?.email || 'User'}!
      </h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Map Area */}
        <div className={`${cardClasses} lg:col-span-2 flex flex-col`}>
          <h3 className={headingClasses}>Map Overview</h3>
          <div className="flex-grow min-h-[450px]">
            <MapComponent userId={userId} />
          </div>
          {/* SOS Button Section - Reduced top margin/padding */}
          <div className="mt-4 pt-4 border-t border-gray-200"> {/* <-- CHANGED mt-4 pt-4 to mt-2 pt-2 */}
            <button type="button" onClick={handleSosClick} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out text-lg">
              SOS - Report Dog Lost / Outside Zone
            </button>
            {sosMessage && (<p className="mt-3 text-center text-red-700 font-semibold text-sm">{sosMessage}</p>)}
          </div>
          {/* Location History Log Section */}
          <div className="mt-4 pt-4 border-t border-gray-200">
             <h4 className="text-lg font-semibold text-gray-700 mb-2">Recent History (Last 12 Hours)</h4>
             <LocationHistoryLog deviceId={targetDeviceId} />
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          <ProfileEditor userId={userId} />
          {/* Remember to apply standard styles inside these components */}
          <DeviceForm userId={userId} />
          <DeviceListComponent userId={userId} />
          <GeofenceList userId={userId} />
        </div>

      </div>
    </main>
  );
}

export default MainContent;