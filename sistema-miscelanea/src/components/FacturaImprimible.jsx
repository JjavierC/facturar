import React from "react";
import logo from "./logo.jfif"; // Asegúrate que la ruta sea correcta en tu proyecto

const FormatoMoneda = (num) => {
  if (num == null) return "$0";
  // Si num ya tiene formato, intentar convertir; si falla, devolver $0
  const n = Number(num) || 0;
  return `$${n.toLocaleString()}`;
};

const FacturaImprimible = ({ venta, ivaPorcentaje = 19 }) => {
  if (!venta) return null;

  const {
    items = [],
    subtotal = 0,
    iva = 0,
    total = 0,
    fecha = null,
    fecha_venta = null,
    fecha_anulacion = null,
    _id,
  } = venta;

  const fechaTexto = (() => {
    const f = fecha || fecha_venta;
    if (!f) return "—";
    try {
      return new Date(f).toLocaleString();
    } catch {
      return "—";
    }
  })();

  const fechaAnulTexto = (() => {
    if (!fecha_anulacion) return "—";
    try {
      return new Date(fecha_anulacion).toLocaleString();
    } catch {
      return "—";
    }
  })();

  return (
    <div
      className="factura-card"
      role="document"
      aria-label="Factura de venta"
      style={{
        fontFamily: "Inter, sans-serif",
        color: "#111827",
        maxWidth: 780,
        margin: "0 auto",
        padding: 18,
      }}
    >
      {/* Header */}
      <div
        className="factura-header"
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: 12,
          marginBottom: 12,
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{ width: 80, height: 80, objectFit: "contain", borderRadius: 6 }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Miscelánea La Económica</div>
          <div style={{ color: "#6b7280", marginTop: 2 }}>Factura de venta</div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Fecha</div>
          <div style={{ fontWeight: 600 }}>{fechaTexto}</div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>ID</div>
          <div style={{ fontWeight: 600 }}>{_id ? _id.toString().slice(-6) : "—"}</div>
        </div>
      </div>

      {/* Meta */}
      <div
        className="factura-meta"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Vendedor</div>
          <div style={{ fontWeight: 600 }}>Cajero</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Estado</div>
          <div style={{ fontWeight: 600 }}>
            {venta.anulada ? "ANULADA" : "ACTIVA"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Fecha anulación</div>
          <div style={{ fontWeight: 600 }}>{fechaAnulTexto}</div>
        </div>
      </div>

      {/* Tabla productos */}
      <h3 style={{ margin: "8px 0 6px 0" }}>Detalle de productos</h3>
      <div className="factura-table-wrapper" style={{ overflowX: "auto" }}>
        <table
          className="factura-table"
          cellSpacing="0"
          cellPadding="6"
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
        >
          <thead>
            <tr style={{ background: "#f9fafb", color: "#374151", textAlign: "left" }}>
              <th style={{ padding: 8, borderBottom: "1px solid #e5e7eb" }}>PRODUCTO</th>
              <th style={{ padding: 8, borderBottom: "1px solid #e5e7eb", textAlign: "center" }}>
                CANT.
              </th>
              <th style={{ padding: 8, borderBottom: "1px solid #e5e7eb", textAlign: "right" }}>
                P. UNIT.
              </th>
              <th style={{ padding: 8, borderBottom: "1px solid #e5e7eb", textAlign: "right" }}>
                TOTAL
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>
                  No hay productos.
                </td>
              </tr>
            ) : (
              items.map((it, idx) => {
                const nombre = it.nombre || it.producto || "Item";
                const cantidad = Number(it.cantidad) || 1;
                const precio = Number(it.precio || it.precio_unit || it.costo || 0) || 0;
                const subtotalItem = Number(it.subtotal) || precio * cantidad;
                return (
                  <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: 8 }}>{nombre}</td>
                    <td style={{ padding: 8, textAlign: "center" }}>{cantidad}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>{FormatoMoneda(precio)}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      {FormatoMoneda(subtotalItem)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div
        className="factura-totales"
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          flexDirection: "column",
          maxWidth: 360,
          marginLeft: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
          <div style={{ color: "#6b7280" }}>Subtotal</div>
          <div style={{ fontWeight: 600 }}>{FormatoMoneda(subtotal)}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
          <div style={{ color: "#6b7280" }}>IVA ({ivaPorcentaje}%)</div>
          <div style={{ fontWeight: 600 }}>{FormatoMoneda(iva)}</div>
        </div>
        <div
          className="tot-final"
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderTop: "1px dashed #e5e7eb",
            marginTop: 6,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 16 }}>TOTAL A PAGAR</div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{FormatoMoneda(total)}</div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="factura-footer"
        style={{
          marginTop: 18,
          borderTop: "1px solid #e5e7eb",
          paddingTop: 12,
          color: "#6b7280",
          fontSize: 13,
          textAlign: "center",
        }}
      >
        ¡Gracias por su compra!
      </div>
    </div>
  );
};

export default FacturaImprimible;
