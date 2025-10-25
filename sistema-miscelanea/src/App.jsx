// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

import Cajero from './pages/cajero';       
import Clientes from './pages/clientes';   

import Facturacion from './pages/Facturacion';
import Inventario from './pages/Inventario';
import Reportes from './pages/Reportes';

function App() {
  return (
    // CAMBIO: Quité el 'p-6' para que el panel Cajero ocupe toda la pantalla
    <div className="min-h-screen bg-gray-50">
      <Navbar /> 
      
      {/* CAMBIO: No usamos <main> para que cada página controle su padding */}
      <Routes>
        {/* --- (RUTAS ACTUALIZADAS) --- */}
        
        {/* 3. La ruta principal "/" ahora es el panel Cajero */}
        <Route path="/" element={<Cajero />} /> 
        
        {/* 4. La página de Facturación ahora vive en "/facturacion" */}
        <Route path="/facturacion" element={<Facturacion />} />
        
        {/* 5. Añadimos la nueva ruta para Clientes */}
        <Route path="/clientes" element={<Clientes />} />

        {/* --- (RUTAS EXISTENTES QUE NO CAMBIAN) --- */}
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/reportes" element={<Reportes />} />
      </Routes>
      
    </div>
  );
}

export default App;