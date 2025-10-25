// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'; // <-- AÑADE Navigate

// --- 1. IMPORTA TODO LO DEL LOGIN ---
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login'; // <-- TE FALTABA ESTE

// --- 2. IMPORTA TUS PÁGINAS ---
import Cajero from './pages/Cajero';
import Clientes from './pages/Clientes';
import Facturacion from './pages/Facturacion';
import Inventario from './pages/Inventario';
import Reportes from './pages/Reportes';
import CrearUsuarios from './pages/CrearUsuarios'; // <-- AÑADE LA PÁG. DE ADMIN

function App() {
  return (
    // --- 3. BORRA EL NAVBAR DE AQUÍ ---
    // El Navbar ahora se maneja dentro de AppLayout
    
    <Routes>
      {/* --- 4. RUTA PÚBLICA: EL LOGIN --- */}
      {/* Esta ruta está FUERA de la protección */}
      <Route path="/login" element={<Login />} />

      {/* --- 5. RUTAS PROTEGIDAS (NECESITAN LOGIN) --- */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}> {/* El layout CON el Navbar */}
          
          {/* Rutas para Cajero y Admin */}
          <Route path="/" element={<Cajero />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/facturacion" element={<Facturacion />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/reportes" element={<Reportes />} />
          
          {/* --- 6. RUTA DE ADMINISTRADOR --- */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/crear-usuarios" element={<CrearUsuarios />} />
          </Route>

        </Route>
      </Route>
      
      {/* 7. REDIRECCIÓN */}
      {/* Si entran a cualquier otra ruta, los manda a "/" */}
      <Route path="*" element={<Navigate to="/" replace />} />
      
    </Routes>
  );
}

export default App;