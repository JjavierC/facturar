// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

import Cajero from './pages/Cajero';       
import Clientes from './pages/Clientes';   

import Facturacion from './pages/Facturacion';
import Inventario from './pages/Inventario';
import Reportes from './pages/Reportes';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar /> 
      
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