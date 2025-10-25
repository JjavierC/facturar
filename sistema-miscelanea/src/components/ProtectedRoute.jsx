// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Si no hay token, redirigir a login
    return <Navigate to="/login" replace />;
  }
  
  // Si hay token, renderizar el contenido (en nuestro caso, el AppLayout)
  return <Outlet />;
}

export default ProtectedRoute;