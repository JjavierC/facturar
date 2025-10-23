// src/pages/Reportes.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

function Reportes() {
  const [ventas, setVentas] = useState([]);
  const [totalGananciasGlobal, setTotalGananciasGlobal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para los filtros
  const [idBusqueda, setIdBusqueda] = useState("");
  const [fechaBusqueda, setFechaBusqueda] = useState("");

  useEffect(() => {
    axios.get("/.netlify/functions/get-ventas")
      .then((res) => {
        setVentas(res.data.ventas || []);
        // Guardamos el total de ganancias de TODAS las ventas
        setTotalGananciasGlobal(res.data.totalGanancias || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar reportes:", err);
        setError("Error al cargar reportes. Verifique conexión.");
        setLoading(false);
      });
  }, []);

  // --- LÓGICA DE FILTROS ---
  const reportesFiltrados = ventas.filter((v) => {
    const idMatch = idBusqueda
      ? v._id.toLowerCase().includes(idBusqueda.toLowerCase())
      : true;
    const fechaMatch = fechaBusqueda
      ? new Date(v.fecha_venta || v.fecha).toISOString().slice(0, 10) === fechaBusqueda
      : true;
    return idMatch && fechaMatch;
  });

  // --- LÓGICA DE ESTADÍSTICAS (BASADA EN FILTROS) ---
  const totalVentasFiltradas = reportesFiltrados.length;
  const sumaTotalFiltrada = reportesFiltrados.reduce((sum, v) => sum + (v.total || 0), 0);
  const totalGananciaFiltrada = reportesFiltrados.reduce((sum, v) => sum + (v.total_ganancias || 0), 0);
  
  const figmaFont = { fontFamily: 'Inter, sans-serif' };

  if (loading) return <div className="text-center p-10 text-2xl" style={figmaFont}>Cargando...</div>;
  if (error) return <div className="text-center p-10 text-red-500 text-2xl" style={figmaFont}>{error}</div>;

  return (
    // CAMBIO: Quitado el ancho fijo. Ahora es responsive.
    <div className="w-full min-h-[982px] bg-white mx-auto p-4 md:p-8" style={figmaFont}>
      
      {/* Header "VENTAS" (Figma) */}
      <header className="w-full max-w-[1456px] mx-auto h-[58px] bg-[#0BBEFF] rounded-lg flex justify-center items-center">
        <h1 className="text-3xl md:text-4xl font-normal text-white">
          VENTAS
        </h1>
      </header>
      
      {/* CAMBIO: Tarjetas de estadísticas (Funcionales) */}
      <section className="max-w-6xl mx-auto my-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-6 shadow-md border-l-4 border-cyan-400">
          <h3 className="text-gray-500 text-sm">Total Ventas (Filtradas)</h3>
          <p className="text-3xl font-bold text-gray-800 mt-1">{totalVentasFiltradas}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 shadow-md border-l-4 border-green-400">
          <h3 className="text-gray-500 text-sm">Ingresos (Filtrados)</h3>
          <p className="text-3xl font-bold text-green-600 mt-1">
            ${sumaTotalFiltrada.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 shadow-md border-l-4 border-yellow-400">
          <h3 className="text-gray-500 text-sm">Ganancia (Filtrada)</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-1">
            ${totalGananciaFiltrada.toLocaleString()}
          </p>
        </div>
      </section>

      {/* CAMBIO: Filtros (Funcionales) */}
      <section className="max-w-6xl mx-auto my-8 bg-gray-50 rounded-lg shadow-md p-6 flex flex-wrap gap-4 justify-between">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label className="font-semibold text-gray-600 text-sm">Buscar por ID Venta:</label>
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

      {/* Tabla de Ventas (Estilo Figma, pero con datos reales) */}
      <section className="w-full max-w-[1462px] mx-auto mt-8 overflow-x-auto">
        <table className="tabla-figma w-full border-collapse border border-black">
          <thead>
            <tr className="h-[55px] bg-gray-50">
              <th className="border border-black text-2xl font-normal text-black text-center p-2">ID Venta</th>
              <th className="border border-black text-2xl font-normal text-black text-center p-2">Fecha</th>
              <th className="border border-black text-2xl font-normal text-black text-center p-2">Items</th>
              <th className="border border-black text-2xl font-normal text-black text-center p-2">Total Venta</th>
              <th className="border border-black text-2xl font-normal text-black text-center p-2">Total Ganancia</th>
            </tr>
          </thead>
          <tbody>
            {reportesFiltrados.map((v) => (
              <tr key={v._id} className="h-[60px] even:bg-white odd:bg-gray-50">
                <td className="border border-black text-lg font-normal text-black text-center p-2 truncate max-w-[150px]" title={v._id}>
                  {v._id.substring(v._id.length - 6)} {/* Mostramos últimos 6 dígitos */}
                </td>
                <td className="border border-black text-lg font-normal text-black text-center p-2">
                  {new Date(v.fecha_venta || v.fecha).toLocaleString()}
                </td>
                <td className="border border-black text-lg font-normal text-black text-center p-2">
                  {v.items.length}
                </td>
                <td className="border border-black text-lg font-bold text-green-700 text-center p-2">
                  ${v.total?.toLocaleString()}
                </td>
                <td className="border border-black text-lg font-bold text-yellow-700 text-center p-2">
                  ${v.total_ganancias?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reportesFiltrados.length === 0 && (
          <div className="w-full text-center p-10 text-2xl text-gray-500 border border-t-0 border-black">
            No se encontraron ventas con esos filtros.
          </div>
        )}
      </section>
    </div>
  );
}

export default Reportes;