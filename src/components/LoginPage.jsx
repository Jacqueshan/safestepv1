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
  const [isSigningUp, setIsSigningUp] = useState(false); // To toggle form state

  const handleAuthAction = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous errors

    try {
      if (isSigningUp) {
        // Sign Up
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('User signed up successfully!');
        // User state will update via onAuthStateChanged in App.jsx
      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in successfully!');
        // User state will update via onAuthStateChanged in App.jsx
      }
    } catch (err) {
      console.error("Authentication Error:", err);
      setError(err.message); // Display error message to user
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isSigningUp ? 'Sign Up' : 'Sign In'}
        </h2>
        <form onSubmit={handleAuthAction}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex flex-col items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mb-4"
              type="submit"
            >
              {isSigningUp ? 'Sign Up' : 'Sign In'}
            </button>
            <button
                type="button" // Important: type="button" to prevent form submission
                onClick={() => setIsSigningUp(!isSigningUp)}
                className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            >
              {isSigningUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;