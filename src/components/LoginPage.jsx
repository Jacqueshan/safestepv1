// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { auth } from '../firebase'; // Import the auth instance
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state for feedback

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Start loading

    try {
      if (isSigningUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('User signed up successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in successfully!');
      }
      // No need to setLoading(false) here, as the component will unmount on success
    } catch (err) {
      console.error("Authentication Error:", err);
      // Provide more user-friendly errors if desired
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
         setError('Incorrect email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
          setError('An account with this email already exists.');
      } else {
          setError('Authentication failed. Please try again.');
      }
      setLoading(false); // Stop loading on error
    }
  };

  return (
    // --- Background Container ---
    // Sets the background image, ensures it covers the area and is centered. Position relative for overlay.
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('Image of Dog for background.jpg')" }} // <-- PASTE YOUR URL HERE!
    >
      {/* --- Dark Overlay --- */}
      {/* Creates a semi-transparent dark layer over the background for better text contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-5 backdrop-blur-sm"></div>

      {/* --- Content Container --- */}
      {/* Centers the login card vertically and horizontally. Position relative and z-10 to sit above the overlay. */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">

        {/* --- Login Form Card --- */}
        <div className="p-8 bg-white bg-opacity-60 rounded-lg shadow-xl w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            {isSigningUp ? 'Create Account' : 'Welcome Back!'}
          </h2>
          <form onSubmit={handleAuthAction}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading} // Disable input while loading
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                id="password"
                type="password"
                placeholder="******************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading} // Disable input while loading
              />
            </div>
            {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
            <div className="flex flex-col items-center justify-between">
              <button
                className={`w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out mb-4 ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'
                }`}
                type="submit"
                disabled={loading} // Disable button while loading
              >
                {loading ? 'Processing...' : (isSigningUp ? 'Sign Up' : 'Sign In')}
              </button>
              <button
                  type="button"
                  onClick={() => {setIsSigningUp(!isSigningUp); setError('');}} // Clear error on toggle
                  disabled={loading} // Disable toggle while loading
                  className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 disabled:opacity-50"
              >
                {isSigningUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;