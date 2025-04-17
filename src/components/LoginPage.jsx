// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { auth, db } from '../firebase'; // Import auth and db instances
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
// Import Firestore functions
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // <-- ADDED: State for Username input
  const [error, setError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setError('');

    // --- ADDED: Username validation only needed for signup ---
    if (isSigningUp && !username.trim()) {
        setError('Username is required for sign up.');
        return; // Stop if username is empty during signup
    }
    // --- END ADDED ---

    setLoading(true);

    try {
      if (isSigningUp) {
        // --- Sign Up Logic ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User signed up successfully in Auth:', user);

        // --- Create user document in Firestore ---
        console.log('Attempting to create user document in Firestore for UID:', user.uid);
        const userDocRef = doc(db, 'users', user.uid);

        // --- MODIFIED: Use username from state for displayName ---
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: username.trim(), // Use the username state variable
          createdAt: serverTimestamp(),
        };
        // --- END MODIFIED ---

        await setDoc(userDocRef, userData);
        console.log('User document created successfully in Firestore');

        // Clear username field after successful signup
        setUsername(''); // <-- ADDED

      } else {
        // --- Sign In Logic ---
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in successfully!');
      }

    } catch (err) {
      console.error("Authentication or Firestore Error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Incorrect email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else {
        setError('Operation failed. Please check details or try again.');
      }
      setLoading(false); // Stop loading only if there was an error
    }
    // setLoading(false); // No longer needed here if component unmounts on success
  };

  // Inline style for text shadow
  const titleStyle = {
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
  };

  return (
    // --- Background Container ---
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/Image of Dog for background.jpg')" }}
    >
      {/* --- Dark Overlay --- */}
      <div className="absolute inset-0 bg-black bg-opacity-5 backdrop-blur-sm"></div>

      {/* --- Content Container --- */}
      <div className="relative z-10 min-h-screen">

        {/* --- PAGE TITLE (Top Right) --- */}
        <h1 className="absolute top-0 right-0 p-6 sm:p-8 text-4xl sm:text-5xl font-bold text-white" style={titleStyle}>
          SafeStep
        </h1>

        {/* --- Centering Container for the Form --- */}
        <div className="flex items-center justify-center min-h-screen px-4 py-12">

          {/* --- Login Form Card --- */}
          <div className="p-8 bg-white bg-opacity-60 rounded-lg shadow-xl w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              {isSigningUp ? 'Create Account' : 'Welcome Back!'}
            </h2>
            <form onSubmit={handleAuthAction}>

              {/* --- ADDED: Username Field (only shows on signup) --- */}
              {isSigningUp && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                    Username
                  </label>
                  <input
                    className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    id="username"
                    type="text"
                    placeholder="Choose a display name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required // Make username required for signup
                    disabled={loading}
                  />
                </div>
              )}
              {/* --- END ADDED --- */}

              {/* Email Input */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                <input
                  className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 ..."
                  id="email" type="email" placeholder="your@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required disabled={loading}
                />
              </div>
              {/* Password Input */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                <input
                  className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 ..."
                  id="password" type="password" placeholder="******************"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required disabled={loading}
                />
              </div>
              {/* Error Message */}
              {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
              {/* Buttons */}
              <div className="flex flex-col items-center justify-between">
                <button
                  className={`w-full font-bold py-2 px-4 rounded ... mb-4 ${ loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white' }`}
                  type="submit" disabled={loading}
                >
                  {loading ? 'Processing...' : (isSigningUp ? 'Sign Up' : 'Sign In')}
                </button>
                <button
                    type="button"
                    // ADDED setUsername('') here to clear field when toggling
                    onClick={() => {setIsSigningUp(!isSigningUp); setError(''); setUsername('');}}
                    disabled={loading}
                    className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 disabled:opacity-50"
                >
                  {isSigningUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div> 
    </div>
  );
}

export default LoginPage;