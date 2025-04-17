// src/components/ProfileEditor.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import Firestore instance
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; // Import Firestore functions

// Define standard styles matching other components (optional)
const cardClasses = "bg-white p-6 rounded-xl shadow-lg border border-gray-200";
const headingClasses = "text-xl font-semibold text-gray-800 mb-4";
const inputClasses = "shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent";
const buttonClasses = (loading) => `w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-700 text-white' // Different color button
}`;

function ProfileEditor({ userId }) {
  const [currentDisplayName, setCurrentDisplayName] = useState(''); // Store fetched name
  const [newDisplayName, setNewDisplayName] = useState(''); // Controlled input
  const [isLoading, setIsLoading] = useState(false); // For fetch/save loading
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch current profile data on mount/userId change
  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      setError('');
      const userDocRef = doc(db, 'users', userId);
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const profileData = docSnap.data();
          const name = profileData.displayName || ''; // Fallback to empty string
          setCurrentDisplayName(name);
          setNewDisplayName(name); // Pre-fill input with current name
        } else {
          console.log("No profile document found for user:", userId);
          setCurrentDisplayName(''); // Set to empty if no profile exists
          setNewDisplayName('');
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Couldn't load profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Handle saving the new display name
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!newDisplayName.trim()) {
      setError("Display name cannot be empty.");
      return;
    }
    if (newDisplayName.trim() === currentDisplayName) {
       setError("No changes detected.");
       return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    const userDocRef = doc(db, 'users', userId);

    try {
      // Use setDoc with merge: true to update the displayName field
      // This will create the document if it doesn't exist, or update/add the field if it does.
      await setDoc(userDocRef, { displayName: newDisplayName.trim() }, { merge: true });

      setSuccessMessage("Display name updated successfully!");
      setCurrentDisplayName(newDisplayName.trim()); // Update local current name
      console.log("Profile updated");
      setTimeout(() => setSuccessMessage(''), 4000); // Clear message after 4s

    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update display name. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cardClasses}>
      <h3 className={headingClasses}>Your Profile</h3>
      {isLoading && !currentDisplayName ? ( // Show spinner only on initial load
         <div className="flex justify-center items-center h-[100px]">
             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
         </div>
      ) : (
        <form onSubmit={handleProfileUpdate}>
          <div className="mb-4">
            <label htmlFor="displayName" className="block text-gray-700 text-sm font-bold mb-2">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className={inputClasses}
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          {successMessage && <p className="text-green-600 text-xs italic mb-4">{successMessage}</p>}
          <button type="submit" disabled={isLoading || newDisplayName.trim() === currentDisplayName} className={buttonClasses(isLoading || newDisplayName.trim() === currentDisplayName)}>
            {isLoading ? 'Saving...' : 'Save Name'}
          </button>
        </form>
      )}
    </div>
  );
}

export default ProfileEditor;