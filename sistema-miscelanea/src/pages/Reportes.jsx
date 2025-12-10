import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import '../components/FacturaImprimible';


function safeDateString(d) {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleString();
  } catch {
    return "—";
  }
}

function safeISODate(d) {
  if (!d) return null;
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}

export default function Reportes() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [idBusqueda, setIdBusqueda] = useState("");
  const [fechaBusqueda, setFechaBusqueda] = useState("");

  // Para exportar por rango
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // simple flag admin (ajusta a tu auth cuando quieras)
  const esAdmin = true;

  useEffect(() => {
    let mounted = true;
    axios
      .get("/.netlify/functions/get-ventas")
      .then((res) => {
        if (!mounted) return;
        setVentas(res.data.ventas || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("get-ventas error", err);
        if (!mounted) return;
        setError("Error al cargar reportes");
        setLoading(false);
      });
    return () => (mounted = false);
  }, []);

  // Filtrar ventas activas (no anuladas)
  const ventasActivas = ventas.filter((v) => !v.anulada);

  const ventasFiltradas = ventasActivas.filter((v) => {
    const idOk = idBusqueda
      ? (v._id || "").toString().toLowerCase().includes(idBusqueda.toLowerCase())
      : true;

    const fechaRaw = v.fecha || v.fecha_venta;
    const fechaOk = fechaBusqueda
      ? (() => {
          const d = safeISODate(fechaRaw);
          if (!d) return false;
          return d.slice(0, 10) === fechaBusqueda;
        })()
      : true;

    return idOk && fechaOk;
  });

  const totalVentas = ventasFiltradas.length;
  const totalIngresos = ventasFiltradas.reduce((acc, v) => acc + Number(v.total || 0), 0);

  // ======== Anular venta (devuelve stock y marca anulada) ========
  const anularVenta = async (id) => {
    if (!window.confirm("¿Seguro que deseas anular esta venta?")) return;
    try {
      await axios.post("/.netlify/functions/anular-venta", { ventaId: id });
      setVentas((prev) =>
        prev.map((v) =>
          (v._id || "").toString() === (id || "").toString()
            ? { ...v, anulada: true, fecha_anulacion: new Date().toISOString() }
            : v
        )
      );
    } catch (err) {
      console.error("Error anular venta:", err);
      alert("Error al anular la venta");
    }
  };

  // ======== Exportar resumen filtrado a PDF (botón general) ========
  const exportarPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(14);
    doc.text("Reporte de Ventas", 40, 40);

    const rows = ventasFiltradas.map((v) => [
      (v._id || "").toString().slice(-6),
      safeDateString(v.fecha || v.fecha_venta),
      String((v.items || []).length),
      `$${Number(v.total || 0).toLocaleString()}`,
    ]);

    doc.autoTable({
      startY: 64,
      head: [["ID", "Fecha", "Items", "Total"]],
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [245, 245, 247], textColor: [17, 24, 39] },
    });

    const y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 14 : 100;
    doc.setFontSize(11);
    doc.text(`Total ventas: ${totalVentas}`, 40, y);
    doc.text(`Ingresos: $${totalIngresos.toLocaleString()}`, 160, y);
    doc.save(`reporte_ventas_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // ======== Imprimir/Exportar una venta específica (PDF factura) ========
  const imprimirVenta = (venta) => {
    if (!venta) {
      alert("Venta inválida");
      return;
    }

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.text("Factura de Venta", 40, 40);

    doc.setFontSize(10);
    doc.text(`ID: ${(venta._id || "").toString()}`, 40, 64);
    doc.text(`Fecha: ${safeDateString(venta.fecha || venta.fecha_venta)}`, 40, 80);

    // Tabla de items
    const items = (venta.items || []).map((it) => {
      const nombre = it.nombre || it.producto || "Item";
      const cantidad = Number(it.cantidad || 0);
      const precio = Number(it.precio || it.precio_unit || 0);
      const subtotal = Number(it.subtotal ?? precio * cantidad);
      return [nombre, String(cantidad), `$${precio.toLocaleString()}`, `$${subtotal.toLocaleString()}`];
    });

    doc.autoTable({
      startY: 100,
      head: [["Producto", "Cant.", "P. Unit.", "Subtotal"]],
      body: items,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [249, 250, 251] },
      columnStyles: { 1: { halign: "center" }, 2: { halign: "right" }, 3: { halign: "right" } },
    });

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 18 : 160;

    const subtotalCalc = Number(venta.subtotal ?? (venta.items || []).reduce((s, it) => s + (Number(it.subtotal ?? (Number(it.precio || 0) * Number(it.cantidad || 0))) ), 0));
    const iva = Number(venta.iva || 0);
    const total = Number(venta.total || subtotalCalc + iva || 0);

    doc.setFontSize(11);
    doc.text(`Subtotal: $${subtotalCalc.toLocaleString()}`, 40, finalY);
    doc.text(`IVA: $${iva.toLocaleString()}`, 40, finalY + 16);
    doc.setFontSize(13);
    doc.text(`TOTAL: $${total.toLocaleString()}`, 40, finalY + 36);

    doc.save(`factura_${(venta._id || "").toString().slice(-6)}.pdf`);
  };

  // ======== Exportar por rango de fechas (facturas separadas en un PDF por páginas) ========
  const exportarPorRango = () => {
    if (!fechaInicio || !fechaFin) {
      alert("Selecciona fecha inicio y fecha fin.");
      return;
    }

    const start = new Date(fechaInicio);
    const end = new Date(fechaFin + "T23:59:59");

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      alert("Rango de fechas inválido.");
      return;
    }

    const filtradas = ventasActivas.filter((v) => {
      const f = new Date(v.fecha || v.fecha_venta);
      if (isNaN(f.getTime())) return false;
      return f >= start && f <= end;
    });

    if (!filtradas.length) {
      alert("No hay ventas en ese rango.");
      return;
    }

    // Generar un PDF con páginas separadas por factura
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    filtradas.forEach((venta, idx) => {
      if (idx > 0) doc.addPage();

      doc.setFontSize(16);
      doc.text("Factura de Venta", 40, 40);
      doc.setFontSize(10);
      doc.text(`ID: ${(venta._id || "").toString()}`, 40, 64);
      doc.text(`Fecha: ${safeDateString(venta.fecha || venta.fecha_venta)}`, 40, 80);

      const items = (venta.items || []).map((it) => {
        const nombre = it.nombre || it.producto || "Item";
        const cantidad = Number(it.cantidad || 0);
        const precio = Number(it.precio || it.precio_unit || 0);
        const subtotal = Number(it.subtotal ?? precio * cantidad);
        return [nombre, String(cantidad), `$${precio.toLocaleString()}`, `$${subtotal.toLocaleString()}`];
      });

      doc.autoTable({
        startY: 100,
        head: [["Producto", "Cant.", "P. Unit.", "Subtotal"]],
        body: items,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [249, 250, 251] },
        columnStyles: { 1: { halign: "center" }, 2: { halign: "right" }, 3: { halign: "right" } },
      });

      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 18 : 160;
      const subtotalCalc = Number(venta.subtotal ?? (venta.items || []).reduce((s, it) => s + (Number(it.subtotal ?? (Number(it.precio || 0) * Number(it.cantidad || 0))) ), 0));
      const iva = Number(venta.iva || 0);
      const total = Number(venta.total || subtotalCalc + iva || 0);

      doc.setFontSize(11);
      doc.text(`Subtotal: $${subtotalCalc.toLocaleString()}`, 40, finalY);
      doc.text(`IVA: $${iva.toLocaleString()}`, 40, finalY + 16);
      doc.setFontSize(13);
      doc.text(`TOTAL: $${total.toLocaleString()}`, 40, finalY + 36);
    });

    doc.save(`facturas_${fechaInicio}_a_${fechaFin}.pdf`);
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold text-center mb-8">Reportes de Ventas</h1>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded shadow">
          <p className="text-gray-500">Ventas</p>
          <p className="text-3xl font-bold">{totalVentas}</p>
        </div>
        <div className="bg-white p-5 rounded shadow">
          <p className="text-gray-500">Ingresos</p>
          <p className="text-3xl font-bold text-green-600">${totalIngresos.toLocaleString()}</p>
        </div>
      </div>

      {/* Filtros y export */}
      <div className="bg-white p-4 rounded shadow flex flex-wrap gap-4 mb-6">
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

        <div className="ml-auto flex gap-2 items-center">
          <button
            onClick={exportarPDF}
            className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-2 rounded shadow"
            title="Exportar listado filtrado a PDF"
          >
            📄 Exportar PDF (filtrado)
          </button>
        </div>
      </div>

      {/* Tabla ventas activas */}
      <div className="overflow-x-auto bg-white rounded shadow mb-8">
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
              <tr key={(v._id || "").toString()} className="h-[56px] text-center hover:bg-gray-50 transition">
                <td className="p-2 border">{(v._id || "").toString().slice(-6)}</td>
                <td className="p-2 border">{safeDateString(v.fecha || v.fecha_venta)}</td>
                <td className="p-2 border">{(v.items || []).length}</td>
                <td className="p-2 border text-green-600 font-semibold">${Number(v.total || 0).toLocaleString()}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => imprimirVenta(v)}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
                    title="Exportar factura a PDF"
                  >
                    📄
                  </button>
                </td>
                {esAdmin && (
                  <td className="p-2 border">
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

      {/* Rango de fechas para exportar facturas en lote */}
      <div className="bg-white p-4 rounded shadow flex flex-wrap gap-3 items-center mb-8">
        <label className="text-gray-600">Exportar facturas por rango:</label>
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
          className="ml-auto bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded shadow"
          title="Exportar facturas (cada factura en página separada)"
        >
          📄 Exportar facturas (rango)
        </button>
      </div>

      {/* Ventas anuladas (admin) */}
      {esAdmin && (
        <div className="mt-6">
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
                    <tr key={(v._id || "").toString()} className="h-[56px] text-center hover:bg-red-50 transition">
                      <td className="p-2 border">{(v._id || "").toString().slice(-6)}</td>
                      <td className="p-2 border">{safeDateString(v.fecha || v.fecha_venta)}</td>
                      <td className="p-2 border">${Number(v.total || 0).toLocaleString()}</td>
                      <td className="p-2 border">{safeDateString(v.fecha_anulacion)}</td>
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
