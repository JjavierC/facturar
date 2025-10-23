import React, { useState, useEffect } from "react";
import axios from "axios";

function Reportes() {
  // --- TU LÓGICA FUNCIONAL (SIN CAMBIOS) ---
  const [ventas, setVentas] = useState([]);
  const [idBusqueda, setIdBusqueda] = useState("");
  const [fechaBusqueda, setFechaBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

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

  const reportesFiltrados = ventas.filter((v) => {
    const idMatch = idBusqueda
      ? v._id.toLowerCase().includes(idBusqueda.toLowerCase())
      : true;
    const fechaMatch = fechaBusqueda
      ? new Date(v.fecha_venta || v.fecha).toISOString().slice(0, 10) === fechaBusqueda
      : true;
    return idMatch && fechaMatch;
  });

  const totalVentas = reportesFiltrados.length;
  const sumaTotal = reportesFiltrados.reduce((sum, v) => sum + (v.total || 0), 0);
  const totalGanancia = reportesFiltrados.reduce((sum, v) => sum + (v.total_ganancias || 0), 0);
  // --- FIN DE LA LÓGICA FUNCIONAL ---


  // Estilo de fuente base de Figma
  const figmaFont = { fontFamily: 'Inter, sans-serif' };

  if (loading) return <div className="text-center p-10 text-lg">Cargando reportes...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    // Fondo blanco de la página (según Figma)
    <div className="min-h-screen bg-white" style={figmaFont}>
      
      {/* Header "VENTAS" (Frame 11 de Figma) */}
      <header className="w-full max-w-[1456px] mx-auto mt-8 mb-10 h-[58px] bg-[#0BBEFF] rounded-lg flex justify-center items-center">
        <h1 className="text-4xl font-normal text-white">
          VENTAS
        </h1>
      </header>

      {/* Estadísticas (Se mantienen porque son funcionales) */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 px-6">
        <div className="bg-gray-50 rounded-lg p-6 shadow-md border-l-4 border-cyan-400">
          <h3 className="text-gray-500 text-sm">Total Ventas</h3>
          <p className="text-3xl font-bold text-gray-800 mt-1">{totalVentas}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 shadow-md border-l-4 border-green-400">
          <h3 className="text-gray-500 text-sm">Ingresos Totales</h3>
          <p className="text-3xl font-bold text-green-600 mt-1">
            ${sumaTotal.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 shadow-md border-l-4 border-yellow-400">
          <h3 className="text-gray-500 text-sm">Ganancia Total</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-1">
            ${totalGanancia.toLocaleString()}
          </p>
        </div>
      </section>

      {/* Filtros (Se mantienen porque son funcionales) */}
      <section className="max-w-6xl mx-auto mt-8 bg-gray-50 rounded-lg shadow-md p-6 flex flex-wrap gap-4 justify-between">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label className="font-semibold text-gray-600 text-sm">Buscar por ID:</label>
          <input
            type="text"
            value={idBusqueda}
            onChange={(e) => setIdBusqueda(e.target.value)}
            placeholder="Ej: 68f6dff7..."
            className="border border-gray-300 rounded-lg px-3 py-2 w-56 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label className="font-semibold text-gray-600 text-sm">Filtrar por fecha:</label>
          <input
            type="date"
            value={fechaBusqueda}
            onChange={(e) => setFechaBusqueda(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </section>

      {/* Tabla de Ventas (Adaptada al diseño de Figma) */}
      <section className="max-w-6xl mx-auto mt-10 mb-20 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Cabecera de la tabla con estilos de Figma */}
          <thead className="bg-white border-b-2 border-gray-200">
            <tr>
              {/* Estilos de Figma: 24px, normal, negro */}
              <th className="px-4 py-4 text-left text-2xl font-normal text-black">ID</th>
              <th className="px-4 py-4 text-left text-2xl font-normal text-black">Fecha</th>
              <th className="px-4 py-4 text-left text-2xl font-normal text-black">Total</th>
              <th className="px-4 py-4 text-left text-2xl font-normal text-black">Ganancia</th>
              <th className="px-4 py-4 text-center text-2xl font-normal text-black">Acción</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportesFiltrados.length > 0 ? (
              reportesFiltrados.map((v) => (
                <tr
                  key={v._id}
                  className="hover:bg-gray-50 transition"
                >
                  {/* Celdas de datos con estilos de Figma: 24px, negro */}
                  <td className="px-4 py-4 text-2xl text-black truncate max-w-[140px]">
                    {v._id}
                  </td>
                  <td className="px-4 py-4 text-2xl text-black">
                    {new Date(v.fecha_venta || v.fecha).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-2xl font-semibold text-green-600">
                    ${v.total?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-4 text-2xl font-semibold text-yellow-600">
                    ${v.total_ganancias?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {/* El botón se mantiene igual para no dañar la funcionalidad */}
                    <button
                      onClick={() => setVentaSeleccionada(v)}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-500 text-2xl">
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Modal Detalle de Venta (Se mantiene porque es funcional) */}
      {ventaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
              Detalle de Venta
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {ventaSeleccionada._id}</p>
              <p><strong>Fecha:</strong> {new Date(ventaSeleccionada.fecha_venta || ventaSeleccionada.fecha).toLocaleString()}</p>
              <p><strong>Total:</strong> ${ventaSeleccionada.total.toLocaleString()}</p>
              <p><strong>Ganancia:</strong> ${ventaSeleccionada.total_ganancias?.toLocaleString() || 0}</p>
              <p><strong>Productos:</strong></p>
              <ul className="list-disc pl-6 text-gray-700">
                {ventaSeleccionada.items?.map((item, i) => (
                  <li key={i}>
                    {item.nombre} × {item.cantidad} — ${item.precio.toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setVentaSeleccionada(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reportes;