// src/pages/Inventario.jsx
import React, { useState, useEffect } from 'react';
import FormularioProducto from '../components/FormularioProducto';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recargar, setRecargar] = useState(0);

  const [mensajeEliminar, setMensajeEliminar] = useState(null);

  // ESTADOS NUEVOS PARA EDITAR
  const [productoEditar, setProductoEditar] = useState(null);
  const [mensajeEditar, setMensajeEditar] = useState(null);

  const cargarProductos = () => {
    setLoading(true);
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

  const handleEliminarProducto = async (productoId, nombreProducto) => {
    if (!window.confirm(`¿Eliminar "${nombreProducto}"?`)) return;

    setMensajeEliminar(null);
    try {
      const res = await axios.delete(`/.netlify/functions/delete-producto?id=${productoId}`);
      setMensajeEliminar({ type: 'success', text: res.data.message });
      setRecargar(prev => prev + 1);
    } catch (err) {
      console.error("Error eliminando producto:", err);
      setMensajeEliminar({ type: 'error', text: 'Error al eliminar el producto.' });
    }
  };

  // ================================
  // ACTUALIZAR PRODUCTO (EDITAR)
  // ================================
  const actualizarProducto = async () => {
    try {
      await axios.put(
        `/.netlify/functions/update-producto?id=${productoEditar._id}`,
        productoEditar
      );

      setMensajeEditar("Producto actualizado correctamente.");

      setTimeout(() => {
        setProductoEditar(null);
        setRecargar((prev) => prev + 1);
      }, 600);

    } catch (err) {
      console.error(err);
      setMensajeEditar("Error actualizando el producto.");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Inventario</h1>

      <FormularioProducto onProductAdded={handleProductAdded} />

      <div className="mt-8 bg-white p-4 md:p-6 rounded-lg shadow-xl max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Inventario Actual ({productos.length})</h2>

        {mensajeEliminar && (
          <div
            className={`mb-4 p-3 rounded-md text-center ${
              mensajeEliminar.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {mensajeEliminar.text}
          </div>
        )}

        {loading && <div className="text-center text-indigo-600 p-4">Cargando...</div>}
        {error && <div className="text-center text-red-500 p-4">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Venta</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((p) => (
                  <tr key={p._id}>
                    <td className="px-4 py-3 text-sm">{p.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.descripcion}</td>
                    <td className="px-4 py-3 text-sm text-red-600">${p.costo}</td>
                    <td className="px-4 py-3 text-sm text-green-600 font-semibold">${p.precio}</td>
                    <td className="px-4 py-3 text-sm font-bold">{p.stock}</td>

                    <td className="px-4 py-3 text-center flex gap-3 justify-center">
                      <button
                        onClick={() => setProductoEditar(p)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-100"
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() => handleEliminarProducto(p._id, p.nombre)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        {!loading && productos.length === 0 && (
          <p className="text-center text-gray-500 p-6">No hay productos.</p>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL PARA EDITAR PRODUCTO */}
      {/* ======================================================== */}
      {productoEditar && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md animate-fade">

            <h2 className="text-xl font-bold mb-4">Editar Producto</h2>

            <label className="block mb-2">Nombre</label>
            <input
              className="border p-2 rounded w-full mb-3"
              value={productoEditar.nombre}
              onChange={(e) => setProductoEditar({ ...productoEditar, nombre: e.target.value })}
            />

            <label className="block mb-2">Descripción</label>
            <input
              className="border p-2 rounded w-full mb-3"
              value={productoEditar.descripcion}
              onChange={(e) => setProductoEditar({ ...productoEditar, descripcion: e.target.value })}
            />

            <label className="block mb-2">Costo</label>
            <input
              type="number"
              className="border p-2 rounded w-full mb-3"
              value={productoEditar.costo}
              onChange={(e) => setProductoEditar({ ...productoEditar, costo: e.target.value })}
            />

            <label className="block mb-2">Precio Venta</label>
            <input
              type="number"
              className="border p-2 rounded w-full mb-3"
              value={productoEditar.precio}
              onChange={(e) => setProductoEditar({ ...productoEditar, precio: e.target.value })}
            />

            <label className="block mb-2">Stock</label>
            <input
              type="number"
              className="border p-2 rounded w-full mb-3"
              value={productoEditar.stock}
              onChange={(e) => setProductoEditar({ ...productoEditar, stock: e.target.value })}
            />

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setProductoEditar(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={actualizarProducto}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Guardar
              </button>
            </div>

            {mensajeEditar && (
              <p className="text-center mt-3 text-green-600 font-semibold">{mensajeEditar}</p>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default Inventario;
