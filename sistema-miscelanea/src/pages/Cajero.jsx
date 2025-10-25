// src/pages/Cajero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserAlt, FaBoxes, FaFileInvoiceDollar, FaDollarSign } from 'react-icons/fa';

// Este componente es el botón grande del menú
function MenuBoton({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="bg-gray-100 border border-gray-300 rounded-xl shadow-md p-8
                 flex flex-col items-center justify-center gap-4 
                 hover:bg-gray-200 hover:shadow-lg transition-all transform hover:-translate-y-1"
      style={{ minHeight: '180px' }}
    >
      {icon}
      <span className="text-2xl font-semibold text-gray-700">{label}</span>
    </Link>
  );
}

function Cajero() {
  return (
    <div className="p-8 md:p-12 bg-white min-h-screen">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
        Panel del Cajero
      </h1>
      
      {/* Grid 2x2 para los botones del menú.
        Usamos los paths que definiremos en App.jsx 
      */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        
        <MenuBoton 
          to="/clientes" 
          label="CLIENTE" 
          icon={<FaUserAlt className="text-6xl text-blue-500" />} 
        />
        
        <MenuBoton 
          to="/inventario" 
          label="PRODUCTOS" 
          icon={<FaBoxes className="text-6xl text-orange-500" />} 
        />
        
        <MenuBoton 
          to="/reportes" 
          label="FACTURAS" 
          icon={<FaFileInvoiceDollar className="text-6xl text-green-500" />} 
        />
        
        <MenuBoton 
          to="/facturacion" 
          label="VENTAS" 
          icon={<FaDollarSign className="text-6xl text-purple-500" />} 
        />

      </div>
    </div>
  );
}

export default Cajero;