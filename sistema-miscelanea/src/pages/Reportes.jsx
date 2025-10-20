import React, { useState } from "react";

function Reportes() {
  const [idBusqueda, setIdBusqueda] = useState("");
  const [fechaBusqueda, setFechaBusqueda] = useState("");

  // Datos de ejemplo (puedes reemplazar con datos reales desde MongoDB)
  const reportes = [

  ];

  // Filtro por ID o fecha
  const reportesFiltrados = reportes.filter(
    (r) =>
      (idBusqueda ? r.id.toString().includes(idBusqueda) : true) &&
      (fechaBusqueda ? r.fecha_venta === fechaBusqueda : true)
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra de navegación */}
      <nav className="bg-[#3A00FF] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="font-bold text-lg tracking-wide">Cajero</div>
        <ul className="flex space-x-6 text-sm font-medium">
 
        </ul>
      </nav>

      {/* Contenedor principal */}
      <main className="max-w-6xl mx-auto mt-10 bg-white shadow-lg rounded-2xl overflow-hidden">
        {/* Encabezado */}
        <div className="bg-cyan-400 text-white py-3 text-center font-semibold text-xl">
          facturas
        </div>

        {/* Filtros */}
        <div className="bg-cyan-200 flex flex-wrap justify-center gap-4 p-4">
          <div className="flex items-center bg-white rounded-lg px-3 shadow-md">
            <span className="mr-2 font-semibold text-sm">POR ID</span>
            <input
              type="text"
              value={idBusqueda}
              onChange={(e) => setIdBusqueda(e.target.value)}
              placeholder="id"
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
                <th className="border px-3 py-2">ID_CLIENTE</th>
                <th className="border px-3 py-2">CLIENTE</th>
                <th className="border px-3 py-2">FECHA_VENTA</th>
                <th className="border px-3 py-2">TOTAL</th>
                <th className="border px-3 py-2">TOTAL_GANANCIAS</th>
              </tr>
            </thead>
            <tbody>
              {reportesFiltrados.length > 0 ? (
                reportesFiltrados.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{r.id}</td>
                    <td className="border px-3 py-2">{r.id_cliente}</td>
                    <td className="border px-3 py-2 capitalize">{r.cliente}</td>
                    <td className="border px-3 py-2">{r.fecha_venta}</td>
                    <td className="border px-3 py-2">${r.total.toLocaleString()}</td>
                    <td className="border px-3 py-2">${r.ganancia.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-4 text-gray-500">
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
