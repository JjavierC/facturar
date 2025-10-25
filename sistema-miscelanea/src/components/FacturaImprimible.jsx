import React from "react";
import logo from "./logo.jfif"; // ✅ Importación correcta del logo

const FormatoMoneda = (num) => {
  if (num == null) return "$0";
  return `$${Number(num).toLocaleString()}`;
};

const FacturaImprimible = ({ venta, ivaPorcentaje = 19 }) => {
  if (!venta) return null;

  const { items = [], subtotal = 0, iva = 0, total = 0, fecha_venta, _id } = venta;

  return (
    <div className="factura-card" role="document" aria-label="Factura">
      {/* === NUEVO ENCABEZADO CON LOGO Y NOMBRE === */}
      <div className="factura-header">
        <img
          src={logo}
          alt="Logo Miscelánea La Económica"
          className="factura-logo"
          style={{
            width: "80px",
            height: "80px",
            objectFit: "contain",
            marginBottom: "8px",
          }}
        />
        <h2 className="factura-nombre" style={{ margin: 0, fontWeight: "800" }}>
          Miscelánea La Económica
        </h2>
        <h1 className="factura-title" style={{ marginTop: "4px" }}>
          FACTURA DE VENTA
        </h1>
      </div>

      {/* === Datos principales === */}
      <div className="factura-meta">
        <div>
          <div className="meta-label">Fecha:</div>
          <div className="meta-value">
            {fecha_venta ? new Date(fecha_venta).toLocaleString() : "-"}
          </div>
        </div>
        <div>
          <div className="meta-label">ID de Venta:</div>
          <div className="meta-value">{_id}</div>
        </div>
        <div>
          <div className="meta-label">Vendedor:</div>
          <div className="meta-value">Cajero (ejemplo)</div>
        </div>
      </div>

      {/* === Tabla de productos === */}
      <h3 className="factura-subtitle">Detalle de Productos:</h3>
      <div className="factura-table-wrapper">
        <table className="factura-table" cellSpacing="0" cellPadding="4">
          <thead>
            <tr>
              <th>PRODUCTO</th>
              <th className="text-center">CANT.</th>
              <th className="text-center">P. UNIT.</th>
              <th className="text-center">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx}>
                <td>{it.nombre || it.producto || "Item"}</td>
                <td className="text-center">{it.cantidad ?? 1}</td>
                <td className="text-center">{FormatoMoneda(it.precio ?? 0)}</td>
                <td className="text-center">
                  {FormatoMoneda((it.precio ?? 0) * (it.cantidad ?? 1))}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "12px 0" }}>
                  No hay productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* === Totales === */}
      <div className="factura-totales">
        <div className="tot-row">
          <div>Subtotal:</div>
          <div>{FormatoMoneda(subtotal)}</div>
        </div>
        <div className="tot-row">
          <div>IVA ({ivaPorcentaje}%):</div>
          <div>{FormatoMoneda(iva)}</div>
        </div>
        <div className="tot-row total-final">
          <div>TOTAL A PAGAR:</div>
          <div>{FormatoMoneda(total)}</div>
        </div>
        <div className="small-note">
          Ganancia Bruta: {FormatoMoneda(venta.total_ganancias ?? 0)}
        </div>
      </div>

      <div className="factura-footer">
        <div>¡Gracias por su compra!</div>
      </div>
    </div>
  );
};

export default FacturaImprimible;
