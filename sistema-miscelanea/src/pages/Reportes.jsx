import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

function Reportes() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filtros
  const [idBusqueda, setIdBusqueda] = useState("");
  const [fechaBusqueda, setFechaBusqueda] = useState("");

  // 🔐 control admin (simple y efectivo)
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const esAdmin = usuario?.role === "admin";

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

  // =========================
  // FILTROS (NO ANULADAS)
  // =========================
  const ventasValidas = ventas.filter((v) => !v.anulada);

  const reportesFiltrados = ventasValidas.filter((v) => {
    const idMatch = idBusqueda
      ? v._id.toString().toLowerCase().includes(idBusqueda.toLowerCase())
      : true;

    const fechaMatch = fechaBusqueda
      ? new Date(v.fecha).toISOString().slice(0, 10) === fechaBusqueda
      : true;

    return idMatch && fechaMatch;
  });

  // =========================
  // ESTADÍSTICAS
  // =========================
  const totalVentas = reportesFiltrados.length;
  const totalIngresos = reportesFiltrados.reduce(
    (acc, v) => acc + Number(v.total || 0),
    0
  );
  const totalGanancias = reportesFiltrados.reduce(
    (acc, v) => acc + Number(v.total_ganancias || 0),
    0
  );

  // =========================
  // ANULAR VENTA (ADMIN)
  // =========================
  const anularVenta = async (ventaId) => {
    if (!window.confirm("¿Seguro que deseas anular esta venta?")) return;

    await axios.post("/.netlify/functions/anular-venta", { ventaId });

    setVentas((prev) =>
      prev.map((v) =>
        v._id === ventaId ? { ...v, anulada: true } : v
      )
    );
  };

  // =========================
  // EXPORTAR PDF
  // =========================
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Ventas", 14, 15);

    const rows = reportesFiltrados.map((v) => [
      v._id.toString().slice(-6),
      new Date(v.fecha).toLocaleString(),
      v.items.length,
      `$${v.total}`,
      `$${v.total_ganancias}`,
    ]);

    doc.autoTable({
      startY: 25,
      head: [["ID", "Fecha", "Items", "Total", "Ganancia"]],
      body: rows,
    });

    doc.save("reporte_ventas.pdf");
  };

  if (loading) return <div className="p-10 text-center text-xl">Cargando...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Reportes de Ventas</h1>

      {/* ======= ESTADÍSTICAS ======= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
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
        <div className="bg-white p-5 rounded shadow">
          <p className="text-gray-500">Ganancia</p>
          <p className="text-3xl font-bold text-yellow-600">
            ${totalGanancias.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ======= FILTROS ======= */}
      <div className="bg-white p-4 rounded shadow flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por ID"
          value={idBusqueda}
          onChange={(e) => setIdBusqueda(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={fechaBusqueda}
          onChange={(e) => setFechaBusqueda(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <button
          onClick={exportarPDF}
          className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Exportar PDF
        </button>
      </div>

      {/* ======= TABLA VENTAS ======= */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Items</th>
              <th>Total</th>
              <th>Ganancia</th>
              {esAdmin && <th>Acción</th>}
            </tr>
          </thead>
          <tbody>
            {reportesFiltrados.map((v) => (
              <tr key={v._id}>
                <td className="text-center">{v._id.toString().slice(-6)}</td>
                <td className="text-center">
                  {new Date(v.fecha).toLocaleString()}
                </td>
                <td className="text-center">{v.items.length}</td>
                <td className="text-center text-green-600 font-bold">
                  ${v.total}
                </td>
                <td className="text-center text-yellow-600 font-bold">
                  ${v.total_ganancias}
                </td>
                {esAdmin && (
                  <td className="text-center">
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

        {reportesFiltrados.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No hay ventas con esos filtros
          </div>
        )}
      </div>

      {/* ======= VENTAS ANULADAS (ADMIN) ======= */}
      {esAdmin && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Ventas Anuladas
          </h2>

          <table className="w-full border bg-red-50">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Ganancia</th>
                <th>Fecha Anulación</th>
              </tr>
            </thead>
            <tbody>
              {ventas
                .filter((v) => v.anulada)
                .map((v) => (
                  <tr key={v._id}>
                    <td className="text-center">{v._id.toString().slice(-6)}</td>
                    <td className="text-center">
                      {new Date(v.fecha).toLocaleString()}
                    </td>
                    <td className="text-center">${v.total}</td>
                    <td className="text-center">${v.total_ganancias}</td>
                    <td className="text-center">
                      {new Date(v.fecha_anulacion).toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Reportes;
