import React, { useState, useEffect } from "react";
import axios from "axios";

function Reportes() {
  const [ventas, setVentas] = useState([]);
  const [idBusqueda, setIdBusqueda] = useState("");
  const [fechaBusqueda, setFechaBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Cargar ventas desde la función get-ventas ---
  useEffect(() => {
    axios.get("/.netlify/functions/get-ventas")
      .then((res) => {
        setVentas(res.data.ventas || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar reportes:", err);
        setError("Error al cargar reportes. Verifique conexión.");
        setLoading(false);
      });
  }, []);

  // --- Filtro por ID o fecha ---
  const reportesFiltrados = ventas.filter((v) => {
    const idMatch = idBusqueda
      ? v._id.toString().toLowerCase().includes(idBusqueda.toLowerCase())
      : true;

    const fechaMatch = fechaBusqueda
      ? new Date(v.fecha_venta || v.fecha)
          .toISOString()
          .slice(0, 10) === fechaBusqueda
      : true;

    return idMatch && fechaMatch;
  });

  if (loading) return <div className="text-center p-10">Cargando reportes...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra de navegación */}
      <nav className="bg-[#3A00FF] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="font-bold text-lg tracking-wide">Cajero</div>
      </nav>

      {/* Contenedor principal */}
      <main className="max-w-6xl mx-auto mt-10 bg-white shadow-lg rounded-2xl overflow-hidden">
        {/* Encabezado */}
        <div className="bg-cyan-400 text-white py-3 text-center font-semibold text-xl">
          Reporte de Ventas
        </div>

        {/* Filtros */}
        <div className="bg-cyan-200 flex flex-wrap justify-center gap-4 p-4">
          <div className="flex items-center bg-white rounded-lg px-3 shadow-md">
            <span className="mr-2 font-semibold text-sm">POR ID</span>
            <input
              type="text"
              value={idBusqueda}
              onChange={(e) => setIdBusqueda(e.target.value)}
              placeholder="Buscar por ID"
              className="border-none outline-none bg-transparent text-gray-700 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center bg-white rounded-lg px-3 shadow-md">
            <span className="mr-2 font-semibold text-sm">POR FECHA</span>
            <input
              type="date"
              value={fechaBusqueda}
              onChange={(e) => setFechaBusqueda(e.target.value)}
              className="border-none outline-none bg-transparent text-gray-700"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto p-4">
          <table className="w-full text-center border border-gray-300">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="border px-3 py-2">ID</th>
                <th className="border px-3 py-2">FECHA VENTA</th>
                <th className="border px-3 py-2">TOTAL</th>
                <th className="border px-3 py-2">GANANCIA</th>
                <th className="border px-3 py-2">PRODUCTOS</th>
              </tr>
            </thead>
            <tbody>
              {reportesFiltrados.length > 0 ? (
                reportesFiltrados.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 text-xs">{v._id}</td>
                    <td className="border px-3 py-2">
                      {new Date(v.fecha_venta || v.fecha).toLocaleString()}
                    </td>
                    <td className="border px-3 py-2 font-semibold">
                      ${v.total?.toLocaleString() || 0}
                    </td>
                    <td className="border px-3 py-2 text-green-600 font-semibold">
                      ${v.total_ganancias?.toLocaleString() || 0}
                    </td>
                    <td className="border px-3 py-2">
                      {v.items?.map((i) => i.nombre).join(", ")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 text-gray-500">
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Reportes;
