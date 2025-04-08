// src/components/Header.jsx
import React from 'react';

function Header() {
  // You might add props later to receive user info or the signOut function
  return (
    <header className="bg-blue-600 text-white shadow-md">
      {/* Use container, mx-auto, and padding for nice spacing */}
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4"> {/* Adjusted padding slightly */}
        {/* Changed text-xl to text-3xl */}
        <h1 className="text-3xl font-bold">
          SafeStep GPS Tracker
        </h1>
        {/* Login/logout buttons or user info could go here, maybe aligned right */}
      </nav>
    </header>
  );
}

export default Header;