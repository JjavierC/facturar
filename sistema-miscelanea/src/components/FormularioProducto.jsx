// src/components/FormularioProducto.jsx
import React, { useState } from 'react';
import axios from 'axios';

function FormularioProducto({ onProductAdded }) {
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    costo: '', // <-- CAMBIO: Campo de costo añadido
    stock: '',
    descripcion: ''
  });
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setCargando(true);

    if (!formData.nombre || !formData.precio || !formData.stock || !formData.costo) { // <-- CAMBIO: Costo es obligatorio
      setMensaje({ type: 'error', text: '¡Error! Rellena todos los campos (Nombre, Precio, Costo, Stock).' });
      setCargando(false);
      return;
    }

    try {
      const response = await axios.post('/.netlify/functions/add-producto', {
        ...formData,
        precio: parseFloat(formData.precio),
        costo: parseFloat(formData.costo), // <-- CAMBIO: Enviar costo como número
        stock: parseInt(formData.stock, 10),
      });

      setMensaje({ type: 'success', text: `¡Producto "${formData.nombre}" agregado con éxito!` });
      
      setFormData({
        nombre: '',
        precio: '',
        costo: '', // <-- CAMBIO: Limpiar costo
        stock: '',
        descripcion: ''
      });

      if (onProductAdded) {
        onProductAdded(); 
      }

    } catch (error) {
      console.error('Error al agregar producto:', error.response ? error.response.data : error.message);
      setMensaje({ type: 'error', text: 'Fallo al conectar con la base de datos.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl mb-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Añadir Nuevo Producto</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Nombre del Producto */}
          <div className="md:col-span-3">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre del Producto (*)</label>
            <input
              type="text"
              name="nombre"
              id="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Precio de Venta */}
          <div>
            <label htmlFor="precio" className="block text-sm font-medium text-gray-700">Precio de Venta ($) (*)</label>
            <input
              type="number"
              name="precio"
              id="precio"
              value={formData.precio}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Costo del Producto (NUEVO) */}
          <div>
            <label htmlFor="costo" className="block text-sm font-medium text-gray-700">Costo ($) (*)</label>
            <input
              type="number"
              name="costo"
              id="costo"
              value={formData.costo}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Stock */}
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Cantidad en Stock (*)</label>
            <input
              type="number"
              name="stock"
              id="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Descripción */}
          <div className="md:col-span-3">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
            <textarea
              name="descripcion"
              id="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
            ></textarea>
          </div>
        </div>

        {mensaje && (
          <div 
            className={`mt-4 p-3 rounded-md ${mensaje.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            {mensaje.text}
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={cargando}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {cargando ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormularioProducto;