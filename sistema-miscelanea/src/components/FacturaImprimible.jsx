import React from "react";



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
          src="./logo.jfif"
          alt="Logo Miscelánea La Económica"
          className="factura-logo"
        />
        <h2 className="factura-nombre">Miscelánea La Económica</h2>
        <h1 className="factura-title">FACTURA DE VENTA</h1>
      </div>

      {/* === DATOS DE FACTURA === */}
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

      <h3 className="factura-subtitle">Detalle de Productos:</h3>

      {/* === TABLA DE PRODUCTOS === */}
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

            {/* si no hay items, mostrar fila vacía */}
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

      {/* === TOTALES === */}
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
        <div className="small-note">Ganancia Bruta: {FormatoMoneda(venta.total_ganancias ?? 0)}</div>
      </div>

      {/* === PIE DE FACTURA === */}
      <div className="factura-footer">
        <div>¡Gracias por su compra!</div>
      </div>

      {/* Botones (se ocultan al imprimir) */}
      <div className="factura-actions modal-buttons" style={{ marginTop: 8 }}>
        {/* Estos botones los maneja el componente padre (Facturacion.jsx) */}
      </div>
    </div>
  );
};

export default FacturaImprimible;
