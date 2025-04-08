// src/components/MapComponent.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, MarkerF, Circle } from '@react-google-maps/api';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, GeoPoint, serverTimestamp } from 'firebase/firestore';

// --- Styles & Defaults ---
const containerStyle = { width: '100%', height: '450px', borderRadius: '0.5rem' };
const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // Example: NYC
const defaultCircleOptions = { /* ... (keep previous options) ... */
    strokeColor: '#FF0000', strokeOpacity: 0.8, strokeWeight: 2,
    fillColor: '#FF0000', fillOpacity: 0.25, clickable: false,
    draggable: false, editable: false, visible: true, zIndex: 1
};
const apiKey = import.meta.env.VITE_Maps_API_KEY;

// --- Main Component ---
function MapComponent({ userId }) {
    // --- State ---
    const [map, setMap] = useState(null);
    const [geofences, setGeofences] = useState([]);
    const [loadingFences, setLoadingFences] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [isAddingFence, setIsAddingFence] = useState(false);
    const [newFenceCenter, setNewFenceCenter] = useState(null);
    const [newFenceRadius, setNewFenceRadius] = useState(100);
    const [newFenceName, setNewFenceName] = useState('');
    const [addFenceError, setAddFenceError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [addressInput, setAddressInput] = useState(''); // State for address input
    const [geocodingError, setGeocodingError] = useState(''); // State for geocoding errors
    const [isGeocoding, setIsGeocoding] = useState(false); // Loading state for geocoding

    // Ref for the Geocoder instance
    const geocoderRef = useRef(null);

    // --- Callbacks ---
    const onLoad = useCallback(function callback(mapInstance) {
        setMap(mapInstance);
        // Initialize Geocoder once map (and thus API) is loaded
        if (window.google && window.google.maps) {
            geocoderRef.current = new window.google.maps.Geocoder();
        } else {
            console.error("Google Maps API not loaded for Geocoder initialization.");
        }
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
        geocoderRef.current = null; // Clean up geocoder ref
    }, []);

    // --- Fetch Geofences ---
    useEffect(() => {
        // ... (keep the existing useEffect for fetching geofences) ...
         if (!userId) return;
         setLoadingFences(true); setFetchError('');
         const geofencesCollectionRef = collection(db, 'geofences');
         const q = query(geofencesCollectionRef, where('ownerUid', '==', userId), orderBy('createdAt', 'desc'));
         const unsubscribe = onSnapshot(q, (querySnapshot) => {
           const fences = [];
           querySnapshot.forEach((doc) => {
             const data = doc.data();
             if (data.center && data.center.latitude != null && data.center.longitude != null) {
               fences.push({ id: doc.id, ...data, center: { lat: data.center.latitude, lng: data.center.longitude }, radius: data.radius || 100 });
             } else { console.warn("Skipping fence with invalid center data:", doc.id, data); }
           });
           setGeofences(fences); setLoadingFences(false);
         }, (err) => { console.error("Error fetching geofences:", err); setFetchError('Failed to load geofences.'); setLoadingFences(false); });
         return () => unsubscribe();
    }, [userId]);

    // --- Handle Map Click ---
    const handleMapClick = (event) => {
        if (isAddingFence) {
            setNewFenceCenter({ lat: event.latLng.lat(), lng: event.latLng.lng() });
            setGeocodingError(''); // Clear geocoding error if map is clicked
            setAddressInput(''); // Clear address input if map is clicked
        }
    };

    // --- Handle Geocode Address --- NEW FUNCTION ---
    const handleGeocodeAddress = () => {
        if (!addressInput) {
            setGeocodingError('Please enter an address.');
            return;
        }
        if (!geocoderRef.current) {
            setGeocodingError('Geocoder not ready. Please wait a moment and try again.');
            console.error("Geocoder instance not available.");
            return;
        }

        setGeocodingError('');
        setIsGeocoding(true);

        geocoderRef.current.geocode({ address: addressInput }, (results, status) => {
            setIsGeocoding(false);
            if (status === 'OK' && results && results[0]) {
                const location = results[0].geometry.location;
                const coords = { lat: location.lat(), lng: location.lng() };
                setNewFenceCenter(coords);
                // Pan map to the new location
                if (map) {
                    map.panTo(coords);
                    map.setZoom(15); // Adjust zoom level after geocoding
                }
                setAddFenceError(''); // Clear fence saving error if geocoding succeeds
            } else {
                console.error(`Geocode was not successful for the following reason: ${status}`);
                setGeocodingError(`Could not find address. Reason: ${status}`);
                setNewFenceCenter(null); // Clear center if geocoding fails
            }
        });
    };

    // --- Handle Save Fence ---
    const handleSaveFence = async () => {
       // ... (Keep the existing handleSaveFence function - it uses newFenceCenter which is now set by click OR geocoding) ...
        if (!newFenceCenter || !newFenceName || !newFenceRadius || Number(newFenceRadius) <= 0) {
            setAddFenceError('Please set a center point (by clicking map or finding address), provide a name, and a valid radius > 0.'); return; }
        setAddFenceError(''); setIsSaving(true);
        try {
            const geofencesCollectionRef = collection(db, 'geofences');
            await addDoc(geofencesCollectionRef, { ownerUid: userId, name: newFenceName, center: new GeoPoint(newFenceCenter.lat, newFenceCenter.lng), radius: Number(newFenceRadius), createdAt: serverTimestamp(), isEnabled: true});
            console.log('Geofence saved successfully!'); setIsAddingFence(false); setNewFenceCenter(null); setNewFenceName(''); setNewFenceRadius(100); setAddressInput('');
        } catch (err) { console.error("Error saving geofence:", err); setAddFenceError('Failed to save geofence. Please try again.');
        } finally { setIsSaving(false); }
    };

    // --- Render ---
    if (!apiKey) { /* ... API Key error check ... */ return <div>Error...</div> }

    return (
        <div> {/* Outer container */}
            {/* --- Geofence Creation Controls --- */}
            <div className="mb-4 p-4 bg-gray-100 rounded border border-gray-300">
                <h4 className="text-md font-semibold mb-2">Create Geofence</h4>
                {!isAddingFence ? (
                    <button onClick={() => setIsAddingFence(true)} /* ... Start Adding Button ... */ > Start Adding Fence </button>
                ) : (
                    <div className="space-y-3">
                        {/* --- Address Input --- NEW SECTION --- */}
                        <div>
                            <label htmlFor="addressInput" className="block text-sm font-medium text-gray-700">Find Center by Address</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input
                                    type="text"
                                    id="addressInput"
                                    value={addressInput}
                                    onChange={(e) => setAddressInput(e.target.value)}
                                    placeholder="Enter address (e.g., 1600 Amphitheatre Pkwy, Mountain View)"
                                    className="flex-1 min-w-0 block w-full px-3 py-1.5 rounded-none rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={handleGeocodeAddress}
                                    disabled={isGeocoding}
                                    className={`inline-flex items-center px-3 py-1.5 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${isGeocoding ? 'cursor-not-allowed' : ''}`}
                                >
                                    {isGeocoding ? 'Finding...' : 'Find'}
                                </button>
                            </div>
                            {geocodingError && <p className="text-red-500 text-xs italic mt-1">{geocodingError}</p>}
                        </div>

                        <p className="text-sm text-gray-600">...OR click on the map below to set the center point.</p>

                        {/* --- Fence Name & Radius Inputs (Keep these) --- */}
                        <div> {/* Name Input ... */}
                            <label htmlFor="fenceName" /* ... */>Fence Name*</label>
                            <input type="text" id="fenceName" value={newFenceName} onChange={(e) => setNewFenceName(e.target.value)} /* ... */ required />
                        </div>
                        <div> {/* Radius Input ... */}
                            <label htmlFor="fenceRadius" /* ... */>Radius (meters)*</label>
                            <input type="number" id="fenceRadius" value={newFenceRadius} onChange={(e) => setNewFenceRadius(e.target.value)} /* ... */ required />
                        </div>

                        {newFenceCenter && (<p className="text-xs text-green-700">Center selected: {newFenceCenter.lat.toFixed(4)}, {newFenceCenter.lng.toFixed(4)}</p>)}
                        {addFenceError && <p className="text-red-500 text-xs italic">{addFenceError}</p>}
                        <div className="flex space-x-2"> {/* Save/Cancel Buttons ... */}
                           <button onClick={handleSaveFence} disabled={isSaving || !newFenceCenter} /* ... */ > {isSaving ? 'Saving...' : 'Save Fence'} </button>
                           <button onClick={() => { /* ... Reset state ... */ setIsAddingFence(false); /* ... etc */ }} /* ... */ > Cancel </button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Map Display --- */}
            {/* LoadScript and GoogleMap structure remains the same */}
            <LoadScript googleMapsApiKey={apiKey}>
                <GoogleMap
                    mapContainerStyle={containerStyle} center={defaultCenter} zoom={11}
                    options={{ /* ... */ }} onLoad={onLoad} onUnmount={onUnmount}
                    onClick={handleMapClick} // Still allow map click to set center
                >
                    {/* Display Existing Geofences */}
          {!loadingFences && geofences.map(fence => {
              // Define options based on isEnabled status
              const circleOptions = {
                  ...defaultCircleOptions, // Start with defaults from outside the map function
                  fillOpacity: fence.isEnabled ? 0.25 : 0.10, // Less visible fill if disabled
                  strokeOpacity: fence.isEnabled ? 0.8 : 0.3, // Less visible stroke if disabled
                  strokeColor: fence.isEnabled ? '#FF0000' : '#888888', // Red if enabled, Gray if disabled
                  fillColor: fence.isEnabled ? '#FF0000' : '#888888',   // Red if enabled, Gray if disabled
              };

              return (
                  <Circle
                      key={fence.id}
                      center={fence.center}
                      radius={fence.radius}
                      options={circleOptions} // Pass the dynamic options here
                  />
              );
          })}

                    {/* Display Temporary Marker for New Fence Center - Remains the same */}
                    {isAddingFence && newFenceCenter && ( <MarkerF position={newFenceCenter} /> )}

                </GoogleMap>
            </LoadScript>
            {/* Loading/Error messages for fetching fences - Remains the same */}
            {loadingFences && <p>Loading geofences...</p>}
            {fetchError && <p>{fetchError}</p>}
        </div>
    );
}

export default React.memo(MapComponent);