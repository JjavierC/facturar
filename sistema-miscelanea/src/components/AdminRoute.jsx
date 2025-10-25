// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function AdminRoute() {
  const rol = localStorage.getItem('rol');
  
  if (rol !== 'administrador') {
    // Si no es admin, redirigir al inicio
    return <Navigate to="/" replace />;
  }
  
  // Si es admin, renderizar la página de admin
  return <Outlet />;
}

export default AdminRoute;