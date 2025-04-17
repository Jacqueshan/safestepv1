// src/components/MapComponent.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
// Consolidate imports from @react-google-maps/api
import { GoogleMap, LoadScript, MarkerF, Circle, InfoWindowF } from '@react-google-maps/api';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, GeoPoint, serverTimestamp } from 'firebase/firestore';

// --- Styles & Defaults ---
const containerStyle = { width: '100%', height: '450px', borderRadius: '0.5rem' };
const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // Example: NYC
const defaultCircleOptions = {
    strokeColor: '#FF0000', strokeOpacity: 0.8, strokeWeight: 2,
    fillColor: '#FF0000', fillOpacity: 0.25, clickable: false,
    draggable: false, editable: false, visible: true, zIndex: 1
};
const apiKey = import.meta.env.VITE_Maps_API_KEY;
const mapLibraries = ["places", "drawing", "geometry"]; // Include necessary libraries

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
    const [addressInput, setAddressInput] = useState('');
    const [geocodingError, setGeocodingError] = useState('');
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [devices, setDevices] = useState([]);
    const [loadingDevices, setLoadingDevices] = useState(true);
    const [fetchDevicesError, setFetchDevicesError] = useState('');
    // --- NEW STATE for InfoWindow ---
    const [selectedDeviceId, setSelectedDeviceId] = useState(null); // ID of the marker whose InfoWindow is open

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

    // --- Fetch Geofences (Real-time) ---
    useEffect(() => {
        if (!userId) return;
        setLoadingFences(true); setFetchError('');
        const geofencesCollectionRef = collection(db, 'geofences');
        const q = query(geofencesCollectionRef, where('ownerUid', '==', userId), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fences = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Ensure center has lat/lng before adding
                if (data.center && data.center.latitude != null && data.center.longitude != null) {
                    fences.push({
                        id: doc.id,
                        ...data,
                        center: { lat: data.center.latitude, lng: data.center.longitude },
                        radius: data.radius || 100 // Ensure radius has a default
                    });
                } else {
                    console.warn("Skipping geofence with invalid center data:", doc.id, data);
                }
            });
            setGeofences(fences); setLoadingFences(false);
        }, (err) => {
            console.error("Error fetching geofences:", err);
            setFetchError('Failed to load geofences.'); setLoadingFences(false);
        });
        return () => unsubscribe();
    }, [userId]);

    // --- Fetch Devices (Real-time) ---
    useEffect(() => {
        if (!userId) return;
        setLoadingDevices(true);
        setFetchDevicesError('');
        const devicesCollectionRef = collection(db, 'devices');
        const q = query(devicesCollectionRef, where('ownerUid', '==', userId)); // Optional: orderBy('name', 'asc')
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const devicesArray = [];
            querySnapshot.forEach((doc) => {
                devicesArray.push({ id: doc.id, ...doc.data() });
            });
            setDevices(devicesArray);
            setLoadingDevices(false);
        }, (err) => {
            console.error("Error fetching devices for map:", err);
            setFetchDevicesError('Failed to load device data.');
            setLoadingDevices(false);
        });
        return () => unsubscribe();
    }, [userId]);

    // --- Handle Map Click ---
    const handleMapClick = (event) => {
        if (isAddingFence) {
            setNewFenceCenter({ lat: event.latLng.lat(), lng: event.latLng.lng() });
            setGeocodingError('');
            setAddressInput('');
        }
        // If clicking map *outside* an info window, close the window
        // Note: Clicking ON a marker is handled by the marker's onClick
        setSelectedDeviceId(null);
    };

    // --- Handle Geocode Address ---
    const handleGeocodeAddress = () => {
        // ... (Keep the existing handleGeocodeAddress function) ...
        if (!addressInput) { setGeocodingError('Please enter an address.'); return; }
        if (!geocoderRef.current) { setGeocodingError('Geocoder not ready. Please wait a moment and try again.'); console.error("Geocoder instance not available."); return; }
        setGeocodingError(''); setIsGeocoding(true);
        geocoderRef.current.geocode({ address: addressInput }, (results, status) => {
            setIsGeocoding(false);
            if (status === 'OK' && results && results[0]) {
                const location = results[0].geometry.location;
                const coords = { lat: location.lat(), lng: location.lng() };
                setNewFenceCenter(coords);
                if (map) { map.panTo(coords); map.setZoom(15); }
                setAddFenceError('');
            } else { console.error(`Geocode was not successful for the following reason: ${status}`); setGeocodingError(`Could not find address. Reason: ${status}`); setNewFenceCenter(null); }
        });
    };

    // --- Handle Save Fence ---
    const handleSaveFence = async () => {
        // ... (Keep the existing handleSaveFence function) ...
        if (!newFenceCenter || !newFenceName || !newFenceRadius || Number(newFenceRadius) <= 0) { setAddFenceError('Please set a center point (by clicking map or finding address), provide a name, and a valid radius > 0.'); return; }
        setAddFenceError(''); setIsSaving(true);
        try {
            const geofencesCollectionRef = collection(db, 'geofences');
            await addDoc(geofencesCollectionRef, { ownerUid: userId, name: newFenceName, center: new GeoPoint(newFenceCenter.lat, newFenceCenter.lng), radius: Number(newRadius), createdAt: serverTimestamp(), isEnabled: true }); // Use newRadius here
            console.log('Geofence saved successfully!'); setIsAddingFence(false); setNewFenceCenter(null); setNewFenceName(''); setNewFenceRadius(100); setAddressInput('');
        } catch (err) { console.error("Error saving geofence:", err); setAddFenceError('Failed to save geofence. Please try again.');
        } finally { setIsSaving(false); }
    };


    // --- Render ---
    if (!apiKey) { return <div className="text-red-600 p-4">Error: Maps API Key is missing. Please check your environment variables.</div> }

    return (
        <div> {/* Outer container */}
            {/* --- Geofence Creation Controls --- */}
            <div className="mb-4 p-4 bg-gray-100 rounded border border-gray-300">
                <h4 className="text-md font-semibold mb-2">Create Geofence</h4>
                {!isAddingFence ? (
                    <button
                        onClick={() => setIsAddingFence(true)}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Start Adding Fence
                    </button>
                ) : (
                    <div className="space-y-3">
                        {/* Address Input */}
                        <div>
                            <label htmlFor="addressInput" className="block text-sm font-medium text-gray-700">Find Center by Address</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input type="text" id="addressInput" value={addressInput} onChange={(e) => setAddressInput(e.target.value)} placeholder="Enter address..." className="flex-1 min-w-0 block w-full px-3 py-1.5 rounded-none rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"/>
                                <button type="button" onClick={handleGeocodeAddress} disabled={isGeocoding} className={`inline-flex items-center px-3 py-1.5 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100 ${isGeocoding ? 'cursor-not-allowed opacity-50' : ''}`} >
                                    {isGeocoding ? 'Finding...' : 'Find'}
                                </button>
                            </div>
                            {geocodingError && <p className="text-red-500 text-xs italic mt-1">{geocodingError}</p>}
                        </div>
                        <p className="text-sm text-gray-600">...OR click on the map below to set the center point.</p>
                        {/* Fence Name */}
                        <div>
                            <label htmlFor="fenceName" className="block text-sm font-medium text-gray-700">Fence Name*</label>
                            <input type="text" id="fenceName" value={newFenceName} onChange={(e) => setNewFenceName(e.target.value)} className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" required />
                        </div>
                        {/* Fence Radius */}
                        <div>
                            <label htmlFor="fenceRadius" className="block text-sm font-medium text-gray-700">Radius (meters)*</label>
                            <input type="number" id="fenceRadius" value={newFenceRadius} onChange={(e) => setNewFenceRadius(e.target.value)} className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" required min="1" />
                        </div>
                        {/* Feedback and Buttons */}
                        {newFenceCenter && (<p className="text-xs text-green-700">Center selected: {newFenceCenter.lat.toFixed(4)}, {newFenceCenter.lng.toFixed(4)}</p>)}
                        {addFenceError && <p className="text-red-500 text-xs italic">{addFenceError}</p>}
                        <div className="flex space-x-2">
                            <button onClick={handleSaveFence} disabled={isSaving || !newFenceCenter || !newFenceName || Number(newFenceRadius) <= 0} className={`px-4 py-2 rounded font-semibold text-sm ${(!newFenceCenter || isSaving || !newFenceName || Number(newRadius) <= 0) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'}`}>
                                {isSaving ? 'Saving...' : 'Save Fence'}
                            </button>
                            <button onClick={() => { setIsAddingFence(false); setNewFenceCenter(null); setNewFenceName(''); setNewFenceRadius(100); setAddFenceError(''); setAddressInput(''); setGeocodingError(''); }} className="px-4 py-2 rounded font-semibold text-sm bg-gray-300 hover:bg-gray-400 text-gray-800">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Map Display --- */}
            <LoadScript googleMapsApiKey={apiKey} libraries={mapLibraries}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={defaultCenter}
                    zoom={11}
                    options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={handleMapClick} // Handle clicks on the map base
                >
                    {/* Display Existing Geofences */}
                    {!loadingFences && geofences.map(fence => {
                        const circleOptions = {
                            ...defaultCircleOptions,
                            fillOpacity: fence.isEnabled ? 0.25 : 0.10,
                            strokeOpacity: fence.isEnabled ? 0.8 : 0.3,
                            strokeColor: fence.isEnabled ? '#FF0000' : '#888888',
                            fillColor: fence.isEnabled ? '#FF0000' : '#888888',
                        };
                        return (
                            <Circle
                                key={fence.id}
                                center={fence.center}
                                radius={fence.radius}
                                options={circleOptions}
                            />
                        );
                    })}

                    {/* --- Display Device Markers with InfoWindows --- */}
                    {!loadingDevices && devices.map(device => {
                        // Check if the device has location data (GeoPoint)
                        if (device.latestLocation && device.latestLocation.latitude != null && device.latestLocation.longitude != null) {
                            const position = {
                                lat: device.latestLocation.latitude,
                                lng: device.latestLocation.longitude
                            };

                            return (
                                <MarkerF
                                    key={device.id} // Use device document ID as key
                                    position={position}
                                    title={device.name || device.id} // Show device name on hover
                                    onClick={() => {
                                        // When marker is clicked, set this device as selected
                                        setSelectedDeviceId(device.id);
                                    }}
                                    // Optional: Add custom icon
                                    // icon={'/path/to/your/dog-icon.png'}
                                >
                                    {/* Show InfoWindow only if this marker's device is selected */}
                                    {selectedDeviceId === device.id && (
                                        <InfoWindowF
                                            position={position}
                                            onCloseClick={() => {
                                                // When InfoWindow 'x' is clicked, clear selection
                                                setSelectedDeviceId(null);
                                            }}
                                        >
                                            {/* Content of the InfoWindow */}
                                            <div className="p-1">
                                                <h4 className="font-semibold text-sm">{device.name || device.id}</h4>
                                                {/* Optional: Add more info */}
                                                {device.lastSeen && <p className="text-xs text-gray-500">Last Seen: {device.lastSeen?.toDate().toLocaleTimeString() ?? 'N/A'}</p>}
                                            </div>
                                        </InfoWindowF>
                                    )}
                                </MarkerF>
                            );
                        }
                        // If no location data, render nothing for this device
                        return null;
                    })}
                    {/* --- END OF DEVICE MARKERS --- */}

                    {/* Display Temporary Marker for New Fence Center */}
                    {isAddingFence && newFenceCenter && ( <MarkerF position={newFenceCenter} /> )}

                </GoogleMap>
            </LoadScript>
            {/* Loading/Error messages */}
             {loadingFences && <p className="text-sm text-gray-500 mt-2">Loading geofences...</p>}
             {fetchError && <p className="text-sm text-red-500 mt-2">{fetchError}</p>}
             {loadingDevices && <p className="text-sm text-gray-500 mt-2">Loading device locations...</p>}
             {fetchDevicesError && <p className="text-sm text-red-500 mt-2">{fetchDevicesError}</p>}
        </div> // End of Outer container
    );
}

// Use React.memo if MapComponent is expensive to re-render and props don't change often
// But be careful if props like userId change frequently
export default React.memo(MapComponent);