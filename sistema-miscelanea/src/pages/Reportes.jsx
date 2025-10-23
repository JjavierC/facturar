import React, { useState, useEffect } from "react";
import axios from "axios";

function Reportes() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const figmaFont = { fontFamily: 'Inter, sans-serif' };

  if (loading) return <div className="text-center p-10 text-2xl" style={figmaFont}>Cargando...</div>;
  if (error) return <div className="text-center p-10 text-red-500 text-2xl" style={figmaFont}>{error}</div>;

  // Creamos un array de 10 filas. Si hay datos, los usamos. Si no, quedan vacíos.
  const displayRows = new Array(10).fill(null);
  ventas.slice(0, 10).forEach((venta, index) => {
    displayRows[index] = venta;
  });

  return (
    // Contenedor principal con el tamaño fijo de Figma
    <div className="w-[1512px] h-[982px] bg-white mx-auto" style={figmaFont}>
      
      {/* Header "VENTAS" (Frame 11 de Figma) */}
      {/* Márgenes calculados de Figma: 
        Navbar (96px) + Margen (75px) + Barra Ventas (58px) + Margen (51px) + Tabla
      */}
      <header className="w-[1456px] mx-auto mt-[75px] h-[58px] bg-[#0BBEFF] rounded-lg flex justify-center items-center">
        <h1 className="text-4xl font-normal text-white">
          VENTAS
        </h1>
      </header>

      {/* Tabla de Ventas (Idéntica a la imagen de Figma)
        El diseño de Figma es una IMAGEN de una tabla. La recreamos aquí.
        Añadimos la clase 'tabla-figma' que definiremos en el CSS.
      */}
      <section className="w-[1462px] mx-auto mt-[51px]">
        <table className="tabla-figma w-full border-collapse border border-black">
          <thead>
            {/* Cabecera idéntica a Figma */}
            <tr className="h-[55px]">
              <th className="border border-black text-2xl font-normal text-black text-center">ID</th>
              <th className="border border-black text-2xl font-normal text-black text-center">ID_USUARIO</th>
              <th className="border border-black text-2xl font-normal text-black text-center">ID_PRODUCTO</th>
              <th className="border border-black text-2xl font-normal text-black text-center">FECHA_VENTA</th>
              <th className="border border-black text-2xl font-normal text-black text-center">TOTAL_VENTAS</th>
              <th className="border border-black text-2xl font-normal text-black text-center">TOTAL_GANANCIAS</th>
            </tr>
          </thead>
          <tbody>
            {/* Mapeamos los datos de la API. 
              Mostramos "N/A" (No Aplicable) para los datos que Figma pide pero tu API no tiene.
            */}
            {displayRows.map((v, index) => (
              <tr key={v ? v._id : index} className="h-[60px]">
                <td className="border border-black text-2xl font-normal text-black text-center">
                  {v ? index + 1 : ''}
                </td>
                <td className="border border-black text-2xl font-normal text-black text-center">
                  {v ? 'N/A' : ''} {/* Tu API no tiene ID_USUARIO */}
                </td>
                <td className="border border-black text-2xl font-normal text-black text-center">
                  {v ? 'N/A' : ''} {/* Tu API no tiene ID_PRODUCTO */}
                </td>
                <td className="border border-black text-2xl font-normal text-black text-center">
                  {v ? new Date(v.fecha_venta || v.fecha).toLocaleDateString() : ''}
                </td>
                <td className="border border-black text-2xl font-normal text-black text-center">
                  {v ? v.total?.toLocaleString() : ''}
                </td>
                <td className="border border-black text-2xl font-normal text-black text-center">
                  {v ? v.total_ganancias?.toLocaleString() : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Reportes;