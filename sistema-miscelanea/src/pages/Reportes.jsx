import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

function Reportes() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [idBusqueda, setIdBusqueda] = useState("");
  const [fechaBusqueda, setFechaBusqueda] = useState("");

  // ✅ CONTROL ADMIN SEGURO
  let esAdmin = false;
  try {
    const usuarioRaw = localStorage.getItem("usuario");
    if (usuarioRaw) {
      const usuario = JSON.parse(usuarioRaw);
      esAdmin = usuario?.role === "admin";
    }
  } catch (_) {}

  useEffect(() => {
    axios
      .get("/.netlify/functions/get-ventas")
      .then((res) => {
        setVentas(res.data.ventas || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error al cargar reportes");
        setLoading(false);
      });
  }, []);

  const ventasValidas = ventas.filter((v) => !v.anulada);

  const reportesFiltrados = ventasValidas.filter((v) => {
    const idMatch = idBusqueda
      ? v._id.toString().toLowerCase().includes(idBusqueda.toLowerCase())
      : true;

    const fechaVenta = v.fecha || v.fecha_venta;
    const fechaMatch = fechaBusqueda
      ? new Date(fechaVenta).toISOString().slice(0, 10) === fechaBusqueda
      : true;

    return idMatch && fechaMatch;
  });

  const totalVentas = reportesFiltrados.length;
  const totalIngresos = reportesFiltrados.reduce(
    (acc, v) => acc + Number(v.total || 0),
    0
  );

  const anularVenta = async (ventaId) => {
    if (!window.confirm("¿Anular esta venta?")) return;

    await axios.post("/.netlify/functions/anular-venta", { ventaId });

    setVentas((prev) =>
      prev.map((v) =>
        v._id === ventaId ? { ...v, anulada: true } : v
      )
    );
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Ventas", 14, 15);

    doc.autoTable({
      startY: 25,
      head: [["ID", "Fecha", "Items", "Total"]],
      body: reportesFiltrados.map((v) => [
        v._id.toString().slice(-6),
        new Date(v.fecha || v.fecha_venta).toLocaleString(),
        v.items.length,
        `$${v.total}`,
      ]),
    });

    doc.save("reporte_ventas.pdf");
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Reportes</h1>

      <div className="flex gap-4 mb-6">
        <input
          placeholder="Buscar ID"
          value={idBusqueda}
          onChange={(e) => setIdBusqueda(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={fechaBusqueda}
          onChange={(e) => setFechaBusqueda(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={exportarPDF}
          className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Exportar PDF
        </button>
      </div>

      <table className="w-full bg-white border">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Items</th>
            <th>Total</th>
            {esAdmin && <th>Acción</th>}
          </tr>
        </thead>
        <tbody>
          {reportesFiltrados.map((v) => (
            <tr key={v._id}>
              <td>{v._id.toString().slice(-6)}</td>
              <td>{new Date(v.fecha || v.fecha_venta).toLocaleString()}</td>
              <td>{v.items.length}</td>
              <td>${v.total}</td>
              {esAdmin && (
                <td>
                  <button
                    onClick={() => anularVenta(v._id)}
                    className="text-red-600"
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
  );
}

export default Reportes;
