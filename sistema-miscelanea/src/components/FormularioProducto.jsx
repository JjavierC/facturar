import React, { useState } from 'react';
import axios from 'axios'; // Usaremos axios porque lo instalaste y es más limpio que fetch

function FormularioProducto({ onProductAdded }) {
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '',
    descripcion: '' // Campo opcional
  });
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Maneja el cambio de los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Maneja el envío del formulario a la Netlify Function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setCargando(true);

    // Validación básica
    if (!formData.nombre || !formData.precio || !formData.stock) {
      setMensaje({ type: 'error', text: '¡Error! Por favor, rellena todos los campos obligatorios.' });
      setCargando(false);
      return;
    }

    try {
      // 1. Envía los datos a la Netlify Function que creamos
      const response = await axios.post('/.netlify/functions/add-producto', {
        ...formData,
        // Asegurar que los números se envíen como números
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock, 10),
      });

      // 2. Maneja el éxito
      setMensaje({ type: 'success', text: `¡Producto "${formData.nombre}" agregado con éxito!` });
      
      // 3. Limpia el formulario
      setFormData({
        nombre: '',
        precio: '',
        stock: '',
        descripcion: ''
      });

      // 4. Notifica al componente padre (Inventario.jsx) para recargar la lista
      if (onProductAdded) {
        onProductAdded(); 
      }

    } catch (error) {
      // 5. Maneja el error de la API
      console.error('Error al agregar producto:', error.response ? error.response.data : error.message);
      setMensaje({ type: 'error', text: 'Fallo al conectar con la base de datos o error interno. Revisa la consola.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Añadir Nuevo Producto</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Nombre del Producto */}
          <div>
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

          {/* Precio */}
          <div>
            <label htmlFor="precio" className="block text-sm font-medium text-gray-700">Precio de Venta ($) (*)</label>
            <input
              type="number"
              name="precio"
              id="precio"
              value={formData.precio}
              onChange={handleChange}
              step="0.01" // Permite decimales
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Stock */}
          <div className="md:col-span-1">
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Cantidad en Stock (*)</label>
            <input
              type="number"
              name="stock"
              id="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
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

        {/* Mensajes de feedback */}
        {mensaje && (
          <div 
            className={`mt-4 p-3 rounded-md ${mensaje.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            {mensaje.text}
          </div>
        )}

        {/* Botón de Enviar */}
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