import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

function Reportes() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [idBusqueda, setIdBusqueda] = useState("");
  const [fechaBusqueda, setFechaBusqueda] = useState("");

  // ✅ ADMIN (simple y seguro)
  const esAdmin = true; // ← luego lo conectamos a auth real

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

  // ======================
  // FILTROS
  // ======================
  const ventasActivas = ventas.filter((v) => !v.anulada);

  const ventasFiltradas = ventasActivas.filter((v) => {
    const idOk = idBusqueda
      ? v._id.toString().includes(idBusqueda)
      : true;

    const fecha = v.fecha || v.fecha_venta;
    const fechaOk = fechaBusqueda
      ? new Date(fecha).toISOString().slice(0, 10) === fechaBusqueda
      : true;

    return idOk && fechaOk;
  });

  // ======================
  // TOTALES
  // ======================
  const totalVentas = ventasFiltradas.length;
  const totalIngresos = ventasFiltradas.reduce(
    (acc, v) => acc + Number(v.total || 0),
    0
  );

  // ======================
  // ANULAR VENTA
  // ======================
  const anularVenta = async (id) => {
    if (!window.confirm("¿Anular esta venta?")) return;

    await axios.post("/.netlify/functions/anular-venta", { ventaId: id });

    setVentas((prev) =>
      prev.map((v) =>
        v._id === id ? { ...v, anulada: true } : v
      )
    );
  };

  // ======================
  // EXPORTAR PDF
  // ======================
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Ventas", 14, 15);

    doc.autoTable({
      startY: 25,
      head: [["ID", "Fecha", "Items", "Total"]],
      body: ventasFiltradas.map((v) => [
        v._id.toString().slice(-6),
        new Date(v.fecha || v.fecha_venta).toLocaleString(),
        v.items.length,
        `$${v.total}`,
      ]),
    });

    doc.save("reporte_ventas.pdf");
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold text-center mb-8">
        Reportes de Ventas
      </h1>

      {/* ===== RESUMEN ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
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

      {/* ===== FILTROS ===== */}
      <div className="bg-white p-4 rounded shadow flex flex-wrap gap-4 mb-6">
        <input
          className="border px-3 py-2 rounded"
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
        <button
          onClick={exportarPDF}
          className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Exportar PDF
        </button>
      </div>

      {/* ===== TABLA ===== */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Fecha</th>
              <th className="p-3 border">Items</th>
              <th className="p-3 border">Total</th>
              {esAdmin && <th className="p-3 border">Acción</th>}
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.map((v) => (
              <tr key={v._id} className="text-center">
                <td className="p-2 border">
                  {v._id.toString().slice(-6)}
                </td>
                <td className="p-2 border">
                  {new Date(v.fecha || v.fecha_venta).toLocaleString()}
                </td>
                <td className="p-2 border">{v.items.length}</td>
                <td className="p-2 border text-green-600 font-semibold">
                  ${v.total}
                </td>
                {esAdmin && (
                  <td className="p-2 border">
                    <button
                      onClick={() => anularVenta(v._id)}
                      className="text-red-600 hover:underline"
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
          <div className="p-6 text-center text-gray-500">
            No hay ventas con esos filtros
          </div>
        )}
      </div>

      {/* ===== ANULADAS ===== */}
      {esAdmin && (
        <div className="mt-12">
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
                        {new Date(v.fecha || v.fecha_venta).toLocaleString()}
                      </td>
                      <td className="p-2 border">${v.total}</td>
                      <td className="p-2 border">
                        {new Date(v.fecha_anulacion).toLocaleString()}
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

export default Reportes;
