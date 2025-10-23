// src/pages/Inventario.jsx
import React, { useState, useEffect } from 'react';
import FormularioProducto from '../components/FormularioProducto';
import axios from 'axios'; // Usar axios para consistencia

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recargar, setRecargar] = useState(0); 

  const cargarProductos = () => {
    setLoading(true);
    // Usamos axios para ser consistentes
    axios.get('/.netlify/functions/get-productos')
      .then(res => {
        setProductos(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Error al cargar datos del inventario.");
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarProductos();
  }, [recargar]); 

  const handleProductAdded = () => {
    setRecargar(prev => prev + 1);
  };

  return (
    // CAMBIO: Fondo gris claro para la página
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Inventario</h1>
      
      <FormularioProducto onProductAdded={handleProductAdded} /> 

      {/* CAMBIO: Reemplazamos <pre> con una tabla profesional */}
      <div className="mt-8 bg-white p-4 md:p-6 rounded-lg shadow-xl max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Inventario Actual ({productos.length})</h2>

        {loading && <div className="text-center text-indigo-600 p-4">Cargando lista...</div>}
        {error && <div className="text-center text-red-500 p-4">{error}</div>}
        
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Venta</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{p.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate" title={p.descripcion}>
                      {p.descripcion || <span className="text-gray-400">N/A</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">${p.costo.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-semibold">${p.precio.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inventario;