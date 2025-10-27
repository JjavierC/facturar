// src/pages/Inventario.jsx
import React, { useState, useEffect } from 'react';
import FormularioProducto from '../components/FormularioProducto';
import axios from 'axios'; 
// Importamos un ícono para el botón de eliminar
import { Trash2 } from 'lucide-react'; 

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recargar, setRecargar] = useState(0); 
  
  // --- NUEVO: Estado para mensajes de éxito/error al eliminar ---
  const [mensajeEliminar, setMensajeEliminar] = useState(null);

  const cargarProductos = () => {
    setLoading(true);
    setError(null); // Limpiamos errores anteriores al cargar
    setMensajeEliminar(null); // Limpiamos mensajes de eliminar al cargar
    axios.get('/.netlify/functions/get-productos')
      .then(res => {
        setProductos(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando productos:", err);
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

  // --- NUEVA FUNCIÓN: Para eliminar producto ---
  const handleEliminarProducto = async (productoId, nombreProducto) => {
    // Confirmación
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${nombreProducto}"? Esta acción marcará el producto como inactivo.`)) {
      return;
    }

    setMensajeEliminar(null); // Limpiamos mensajes anteriores
    try {
      // Llamamos a la nueva API de backend
      const res = await axios.delete(`/.netlify/functions/delete-producto?id=${productoId}`);
      setMensajeEliminar({ type: 'success', text: res.data.message });
      setRecargar(prev => prev + 1); // Recargamos la lista
    } catch (err) {
      console.error("Error eliminando producto:", err.response ? err.response.data : err);
      setMensajeEliminar({ type: 'error', text: err.response?.data?.error || 'Error al eliminar el producto.' });
    }
    // No necesitamos setLoading aquí, la recarga se encarga
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Inventario</h1>
      
      <FormularioProducto onProductAdded={handleProductAdded} /> 

      <div className="mt-8 bg-white p-4 md:p-6 rounded-lg shadow-xl max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Inventario Actual ({productos.length})</h2>

        {/* --- NUEVO: Mostramos mensajes de eliminar aquí --- */}
        {mensajeEliminar && (
          <div 
            className={`mb-4 p-3 rounded-md text-center ${
              mensajeEliminar.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {mensajeEliminar.text}
          </div>
        )}

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
                  {/* --- NUEVA COLUMNA: Acciones --- */}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((p) => (
                  // Usamos p._id si viene del backend, o p.id si lo genera el frontend (mejor usar _id)
                  <tr key={p._id || p.id}> 
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{p.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate" title={p.descripcion}>
                      {p.descripcion || <span className="text-gray-400">N/A</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">${p.costo.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-semibold">${p.precio.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">{p.stock}</td>
                    {/* --- NUEVO BOTÓN: Eliminar --- */}
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleEliminarProducto(p._id || p.id, p.nombre)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-100 transition-colors"
                        title="Eliminar Producto"
                      >
                        <Trash2 size={18} /> {/* Ícono de papelera */}
                      </button>
                      {/* Aquí podrías añadir un botón de Editar en el futuro */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
         {!loading && !error && productos.length === 0 && (
           <div className="text-center text-gray-500 p-6">No hay productos en el inventario.</div>
         )}
      </div>
    </div>
  );
}

export default Inventario;
