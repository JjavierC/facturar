import React from "react";
import { Link } from "react-router-dom";
import { FaUser, FaBox, FaFileInvoiceDollar, FaDollarSign } from "react-icons/fa";

const Cajero = () => {
  // --- 1. LEEMOS EL ROL DEL USUARIO ---
  const rolUsuario = localStorage.getItem('rol');

  return (
    // --- 2. Añadimos 'position: relative' para que el botón sepa dónde anclarse ---
    <div className="cajero-container" style={{ position: 'relative', minHeight: 'calc(100vh - 96px)' /* Ocupa la pantalla menos el navbar */ }}>
      <h1 className="titulo-cajero">Panel del Cajero</h1>

      <div className="cajero-grid">
        <Link to="/Clientes" className="cajero-card"> {/* Ojo, tu ruta es /Clientes, asegúrate que exista */}
          <FaUser className="cajero-icon" />
          <span>CLIENTE</span>
        </Link>

        <Link to="/inventario" className="cajero-card">
          <FaBox className="cajero-icon" />
          <span>PRODUCTOS</span>
        </Link>

        <Link to="/reportes" className="cajero-card">
          <FaFileInvoiceDollar className="cajero-icon" />
          <span>REPORTES</span>
        </Link>

        <Link to="/facturacion" className="cajero-card">
          <CiShoppingCart className="cajero-icon" />
          <span>AREA DE VENTA</span>
        </Link>
   </div>

      {/* --- 3. AQUÍ ESTÁ EL BOTÓN AZUL --- */}
      {/* Solo se muestra si el rol es 'administrador' */}
      {rolUsuario === 'administrador' && (
        <Link
          to="/admin/crear-usuarios"
          title="Crear nuevo usuario"
          style={{
            position: 'fixed', // Se pega a la esquina de la ventana
            bottom: '32px',    // 32px desde abajo
            right: '32px',     // 32px desde la derecha
            backgroundColor: '#2563EB', // Color azul (como el de tu figma)
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 'bold',
            textDecoration: 'none', // Quita el subrayado del Link
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Sombrita
            zIndex: 50, // Se pone encima de todo
          }}
        >
          Crear Usuario
        </Link>
      )}
    </div>
  );
};

export default Cajero;