import React from "react";
import { Link } from "react-router-dom";
import { FaUser, FaBox, FaFileInvoiceDollar, FaDollarSign } from "react-icons/fa";

const Cajero = () => {
  return (
    <div className="cajero-container">
      <h1 className="titulo-cajero">Panel del Cajero</h1>

      <div className="cajero-grid">
        <Link to="/Clientes" className="cajero-card">
          <FaUser className="cajero-icon" />
          <span>CLIENTE</span>
        </Link>

        <Link to="/inventario" className="cajero-card">
          <FaBox className="cajero-icon" />
          <span>PRODUCTOS</span>
        </Link>

        <Link to="/reportes" className="cajero-card">
          <FaFileInvoiceDollar className="cajero-icon" />
          <span>FACTURAS</span>
        </Link>

        <Link to="/facturacion" className="cajero-card">
          <FaDollarSign className="cajero-icon" />
          <span>VENTAS</span>
        </Link>
      </div>
    </div>
  );
};

export default Cajero;
