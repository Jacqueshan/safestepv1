// src/components/Header.jsx
import React from 'react';

function Header() {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <nav className="container mx-auto px-6 py-3">
        <h1 className="text-xl font-bold">SafeStep GPS Tracker</h1>
        {/* We can add login/logout buttons or user info here later */}
      </nav>
    </header>
  );
}

export default Header;