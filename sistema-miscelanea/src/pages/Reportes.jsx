import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import FacturaImprimible from "../components/FacturaImprimible"; // si lo usas en futuro

function safeToStringId(id) {
  if (!id) return "";
  try {
    // si es ObjectId o string
    return id.toString();
  } catch {
    return String(id);
  }
}

function formatDateSafe(input) {
  if (!input) return "—";
  try {
    const d = new Date(input);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  } catch {
    return "—";
  }
}

export default function Reportes() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [idBusqueda, setIdBusqueda] = useState("");
  const [fechaBusqueda, setFechaBusqueda] = useState("");

  // admin seguro: intenta leer localStorage, si falla deja false
  let esAdmin = false;
  try {
    const raw = localStorage.getItem("usuario");
    if (raw) {
      const u = JSON.parse(raw);
      esAdmin = u?.role === "admin";
    }
  } catch {
    esAdmin = false;
  }

  useEffect(() => {
    axios
      .get("/.netlify/functions/get-ventas")
      .then((res) => {
        setVentas(res.data.ventas || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("get-ventas error:", err);
        setError("Error al cargar reportes");
        setLoading(false);
      });
  }, []);

  // filtros: ventas activas (no anuladas)
  const ventasActivas = ventas.filter((v) => !v.anulada);

  const ventasFiltradas = ventasActivas.filter((v) => {
    const idOk = idBusqueda
      ? safeToStringId(v._id).toLowerCase().includes(idBusqueda.toLowerCase())
      : true;

    const fechaRaw = v.fecha || v.fecha_venta;
    const fechaOk = fechaBusqueda
      ? (() => {
          try {
            const d = new Date(fechaRaw);
            if (isNaN(d.getTime())) return false;
            return d.toISOString().slice(0, 10) === fechaBusqueda;
          } catch {
            return false;
          }
        })()
      : true;

    return idOk && fechaOk;
  });

  // totales
  const totalVentas = ventasFiltradas.length;
  const totalIngresos = ventasFiltradas.reduce((acc, v) => acc + Number(v.total || 0), 0);

  // anular venta (admin only)
  const anularVenta = async (id) => {
    if (!esAdmin) {
      alert("No autorizado");
      return;
    }

    if (!window.confirm("¿Seguro que deseas anular esta venta?")) return;

    try {
      await axios.post("/.netlify/functions/anular-venta", { ventaId: id });

      // actualizar estado: marcar anulada y agregar fecha_anulacion
      setVentas((prev) =>
        prev.map((v) =>
          safeToStringId(v._id) === safeToStringId(id)
            ? { ...v, anulada: true, fecha_anulacion: new Date().toISOString() }
            : v
        )
      );
    } catch (err) {
      console.error("Error anular venta:", err);
      alert("Error al anular la venta");
    }
  };

  // exportar PDF de todas las ventas filtradas (resumen)
  const exportarPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(14);
    doc.text("Reporte de Ventas", 40, 40);

    const rows = ventasFiltradas.map((v) => [
      safeToStringId(v._id).slice(-6),
      formatDateSafe(v.fecha || v.fecha_venta),
      String((v.items || []).length),
      `$${Number(v.total || 0).toLocaleString()}`,
    ]);

    doc.autoTable({
      startY: 60,
      head: [["ID", "Fecha", "Items", "Total"]],
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [245, 245, 247], textColor: [17, 24, 39] },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 170 },
        2: { cellWidth: 50, halign: "center" },
        3: { cellWidth: 80, halign: "right" },
      },
    });

    const totalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : 100;
    doc.setFontSize(11);
    doc.text(`Total ventas: ${totalVentas}`, 40, totalY);
    doc.text(`Ingresos: $${totalIngresos.toLocaleString()}`, 40, totalY + 16);

    doc.save(`reporte_ventas_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // imprimir una venta específica (detalle/factura)
  const imprimirVenta = (venta) => {
    if (!venta) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    doc.setFontSize(16);
    doc.text("Factura de Venta", 40, 40);

    doc.setFontSize(10);
    doc.text(`ID: ${safeToStringId(venta._id).slice(-8)}`, 40, 58);
    doc.text(`Fecha: ${formatDateSafe(venta.fecha || venta.fecha_venta)}`, 40, 72);

    // items
    const body = (venta.items || []).map((it) => {
      const nombre = it.nombre || it.producto || "Item";
      const cantidad = Number(it.cantidad || 1);
      const precio = Number(it.precio || 0);
      const subtotal = Number(it.subtotal ?? precio * cantidad);
      return [nombre, String(cantidad), `$${precio.toLocaleString()}`, `$${subtotal.toLocaleString()}`];
    });

    doc.autoTable({
      startY: 96,
      head: [["Producto", "Cant.", "P. Unit.", "Subtotal"]],
      body,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [249, 250, 251] },
      columnStyles: { 1: { halign: "center" }, 2: { halign: "right" }, 3: { halign: "right" } },
    });

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 18 : 140;
    doc.setFontSize(12);
    doc.text(`Subtotal: $${Number(venta.subtotal || 0).toLocaleString()}`, 40, finalY);
    doc.text(`IVA: $${Number(venta.iva || 0).toLocaleString()}`, 40, finalY + 16);
    doc.setFontSize(14);
    doc.text(`TOTAL: $${Number(venta.total || 0).toLocaleString()}`, 40, finalY + 34);

    doc.save(`venta_${safeToStringId(venta._id).slice(-6)}.pdf`);
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold text-center mb-6">Reportes de Ventas</h1>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-5 rounded shadow">
          <p className="text-gray-500">Ventas</p>
          <p className="text-3xl font-bold">{totalVentas}</p>
        </div>
        <div className="bg-white p-5 rounded shadow">
          <p className="text-gray-500">Ingresos</p>
          <p className="text-3xl font-bold text-green-600">${totalIngresos.toLocaleString()}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded shadow flex flex-wrap gap-3 items-center mb-6">
        <input
          className="border px-3 py-2 rounded w-44"
          placeholder="Buscar por ID"
          value={idBusqueda}
          onChange={(e) => setIdBusqueda(e.target.value)}
        />
        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={fechaBusqueda}
          onChange={(e) => setFechaBusqueda(e.target.value)}
        />

        <div className="ml-auto flex gap-2">
          <button
            onClick={exportarPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow"
            title="Exportar ventas filtradas a PDF"
          >
            📄 Exportar PDF
          </button>
        </div>
      </div>

      {/* Tabla ventas activas */}
      <div className="overflow-x-auto bg-white rounded shadow mb-6">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Fecha</th>
              <th className="p-3 border">Items</th>
              <th className="p-3 border">Total</th>
              {esAdmin && <th className="p-3 border">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.map((v) => (
              <tr key={safeToStringId(v._1d || v._id)} className="text-center hover:bg-gray-50 transition">
                <td className="p-2 border">{safeToStringId(v._id).slice(-6)}</td>
                <td className="p-2 border">{formatDateSafe(v.fecha || v.fecha_venta)}</td>
                <td className="p-2 border">{(v.items || []).length}</td>
                <td className="p-2 border text-green-600 font-semibold">${Number(v.total || 0).toLocaleString()}</td>
                {esAdmin && (
                  <td className="p-2 border flex gap-2 justify-center">
                    <button
                      onClick={() => imprimirVenta(v)}
                      className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                    >
                      PDF
                    </button>

                    <button
                      onClick={() => anularVenta(v._id)}
                      className="px-3 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition"
                    >
                      Anular
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {ventasFiltradas.length === 0 && (
          <div className="p-6 text-center text-gray-500">No hay ventas con esos filtros</div>
        )}
      </div>

      {/* Ventas anuladas (solo admin) */}
      {esAdmin && (
        <div>
          <h2 className="text-xl font-semibold text-red-600 mb-4">Ventas Anuladas</h2>

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
                    <tr key={safeToStringId(v._id)} className="text-center hover:bg-red-50 transition">
                      <td className="p-2 border">{safeToStringId(v._id).slice(-6)}</td>
                      <td className="p-2 border">{formatDateSafe(v.fecha || v.fecha_venta)}</td>
                      <td className="p-2 border">${Number(v.total || 0).toLocaleString()}</td>
                      <td className="p-2 border">{formatDateSafe(v.fecha_anulacion)}</td>
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
