import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* =====================
   Helpers fechas seguras
===================== */
function safeDateString(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-CO", { timeZone: "America/Bogota" });
}

function safeISODate(d) {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

export default function Reportes() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [idBusqueda, setIdBusqueda] = useState("");
  const [fechaBusqueda, setFechaBusqueda] = useState("");

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const esAdmin = true;

  /* =====================
     Cargar ventas
  ===================== */
  useEffect(() => {
    axios
      .get("/.netlify/functions/get-ventas")
      .then((res) => {
        setVentas(res.data.ventas || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar reportes");
        setLoading(false);
      });
  }, []);

  /* =====================
     FILTRAR SOLO VENTAS DEL DÍA AUTOMÁTICAMENTE
  ===================== */

  // Fecha actual en Colombia (YYYY-MM-DD)
  const hoyColombia = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Bogota",
  });

  // Solo ventas activas
  const ventasActivas = ventas.filter((v) => !v.anulada);

  // Filtrar ventas del día automáticamente
  const ventasDelDia = ventasActivas.filter((v) => {
    const fechaRaw = v.fecha || v.fecha_venta;

    const fechaVenta = new Date(fechaRaw).toLocaleDateString("en-CA", {
      timeZone: "America/Bogota",
    });

    return fechaVenta === hoyColombia;
  });

  /* =====================
     Filtros manuales sobre las del día
  ===================== */
  const ventasFiltradas = ventasDelDia.filter((v) => {
    const idOk = idBusqueda
      ? (v._id || "").toString().includes(idBusqueda)
      : true;

    const fechaRaw = v.fecha || v.fecha_venta;
    const fechaOk = fechaBusqueda
      ? safeISODate(fechaRaw)?.slice(0, 10) === fechaBusqueda
      : true;

    return idOk && fechaOk;
  });

  const totalVentas = ventasFiltradas.length;
  const totalIngresos = ventasFiltradas.reduce(
    (acc, v) => acc + Number(v.total || 0),
    0
  );

  /* =====================
     Anular venta
  ===================== */
  const anularVenta = async (id) => {
    if (!window.confirm("¿Seguro que deseas anular esta venta?")) return;

    await axios.post("/.netlify/functions/anular-venta", { ventaId: id });

    setVentas((prev) =>
      prev.map((v) =>
        v._id === id
          ? { ...v, anulada: true, fecha_anulacion: new Date().toISOString() }
          : v
      )
    );
  };

  /* =====================
     PDF listado filtrado
  ===================== */
  const exportarPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    doc.setFontSize(16);
    doc.text("Reporte de Ventas del Día", 40, 40);

    autoTable(doc, {
      startY: 70,
      head: [["ID", "Fecha", "Items", "Total"]],
      body: ventasFiltradas.map((v) => [
        (v._id || "").toString().slice(-6),
        safeDateString(v.fecha || v.fecha_venta),
        (v.items || []).length,
        `$${Number(v.total || 0).toLocaleString()}`,
      ]),
      styles: { fontSize: 10 },
    });

    doc.save("reporte_ventas_dia.pdf");
  };

  /* =====================
     PDF factura individual
  ===================== */
  const imprimirVenta = (venta) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    doc.setFontSize(16);
    doc.text("Factura de Venta", 40, 40);

    doc.setFontSize(10);
    doc.text(`ID: ${(venta._id || "").toString()}`, 40, 70);
    doc.text(
      `Fecha: ${safeDateString(venta.fecha || venta.fecha_venta)}`,
      40,
      88
    );

    autoTable(doc, {
      startY: 110,
      head: [["Producto", "Cantidad", "Precio", "Subtotal"]],
      body: (venta.items || []).map((i) => [
        i.nombre || i.producto || "Item",
        i.cantidad,
        `$${Number(i.precio || 0).toLocaleString()}`,
        `$${Number(
          i.subtotal ?? i.precio * i.cantidad
        ).toLocaleString()}`,
      ]),
      styles: { fontSize: 10 },
    });

    const y = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.text(
      `TOTAL: $${Number(venta.total || 0).toLocaleString()}`,
      40,
      y
    );

    doc.save(`factura_${venta._id.toString().slice(-6)}.pdf`);
  };

  /* =====================
     PDF por rango
  ===================== */
  const exportarPorRango = () => {
    if (!fechaInicio || !fechaFin) {
      alert("Selecciona ambas fechas");
      return;
    }

    const start = new Date(fechaInicio);
    const end = new Date(fechaFin + "T23:59:59");

    const filtradas = ventasActivas.filter((v) => {
      const f = new Date(v.fecha || v.fecha_venta);
      return f >= start && f <= end;
    });

    if (!filtradas.length) {
      alert("No hay ventas en ese rango");
      return;
    }

    const doc = new jsPDF({ unit: "pt", format: "a4" });

    filtradas.forEach((venta, idx) => {
      if (idx > 0) doc.addPage();

      doc.setFontSize(16);
      doc.text("Factura de Venta", 40, 40);

      doc.setFontSize(10);
      doc.text(`ID: ${venta._id}`, 40, 70);
      doc.text(
        `Fecha: ${safeDateString(venta.fecha || venta.fecha_venta)}`,
        40,
        88
      );

      autoTable(doc, {
        startY: 110,
        head: [["Producto", "Cant.", "Precio", "Subtotal"]],
        body: (venta.items || []).map((i) => [
          i.nombre || i.producto || "Item",
          i.cantidad,
          `$${Number(i.precio || 0).toLocaleString()}`,
          `$${Number(
            i.subtotal ?? i.precio * i.cantidad
          ).toLocaleString()}`,
        ]),
        styles: { fontSize: 10 },
      });

      const y = doc.lastAutoTable.finalY + 20;
      doc.text(
        `TOTAL: $${Number(venta.total || 0).toLocaleString()}`,
        40,
        y
      );
    });

    doc.save(`facturas_${fechaInicio}_a_${fechaFin}.pdf`);
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold text-center mb-8">
        Ventas del Día
      </h1>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded shadow">
          <p className="text-gray-500">Ventas</p>
          <p className="text-3xl font-bold">{totalVentas}</p>
        </div>
        <div className="bg-white p-5 rounded shadow">
          <p className="text-gray-500">Ingresos</p>
          <p className="text-3xl font-bold text-green-600">
            ${totalIngresos.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded shadow flex flex-wrap gap-3 mb-6">
        <input
          className="border px-3 py-2 rounded"
          placeholder="Buscar ID"
          value={idBusqueda}
          onChange={(e) => setIdBusqueda(e.target.value)}
        />
        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={fechaBusqueda}
          onChange={(e) => setFechaBusqueda(e.target.value)}
        />

        <button
          onClick={exportarPDF}
          className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded"
        >
          📄 Exportar PDF
        </button>
      </div>

      {/* Tabla ventas del día */}
      <div className="bg-white rounded shadow overflow-x-auto mb-8">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Fecha</th>
              <th className="p-3 border">Items</th>
              <th className="p-3 border">Total</th>
              <th className="p-3 border">PDF</th>
              {esAdmin && <th className="p-3 border">Acción</th>}
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.map((v) => (
              <tr key={v._id} className="text-center hover:bg-gray-50">
                <td className="p-2 border">
                  {v._id.toString().slice(-6)}
                </td>
                <td className="p-2 border">
                  {safeDateString(v.fecha || v.fecha_venta)}
                </td>
                <td className="p-2 border">{(v.items || []).length}</td>
                <td className="p-2 border text-green-600 font-semibold">
                  ${Number(v.total || 0).toLocaleString()}
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => imprimirVenta(v)}
                    className="px-3 py-1 bg-indigo-100 rounded"
                  >
                    📄
                  </button>
                </td>
                {esAdmin && (
                  <td className="p-2 border">
                    <button
                      onClick={() => anularVenta(v._id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded"
                    >
                      Anular
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Exportar por rango */}
      <div className="bg-white p-4 rounded shadow flex gap-3 items-center mb-10">
        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />
        <button
          onClick={exportarPorRango}
          className="ml-auto bg-green-600 text-white px-4 py-2 rounded"
        >
          📄 Exportar rango
        </button>
      </div>

      {/* Ventas anuladas */}
      {esAdmin && (
        <div>
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Ventas Anuladas
          </h2>

          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-red-50">
                <tr>
                  <th className="p-3 border">ID</th>
                  <th className="p-3 border">Fecha</th>
                  <th className="p-3 border">Total</th>
                  <th className="p-3 border">Fecha Anulación</th>
                </tr>
              </thead>
              <tbody>
                {ventas
                  .filter((v) => v.anulada)
                  .map((v) => (
                    <tr key={v._id} className="text-center">
                      <td className="p-2 border">
                        {v._id.toString().slice(-6)}
                      </td>
                      <td className="p-2 border">
                        {safeDateString(v.fecha || v.fecha_venta)}
                      </td>
                      <td className="p-2 border">
                        ${Number(v.total || 0).toLocaleString()}
                      </td>
                      <td className="p-2 border">
                        {safeDateString(v.fecha_anulacion)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
