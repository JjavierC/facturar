// src/components/AppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Tu Navbar existente

function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* El <Outlet> renderizará la página de la ruta actual (Cajero, Clientes, etc.) */}
      <Outlet />
    </div>
  );
}

export default AppLayout;