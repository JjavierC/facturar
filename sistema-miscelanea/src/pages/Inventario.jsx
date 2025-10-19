// src/pages/Inventario.jsx
import React, { useState, useEffect } from 'react';
import FormularioProducto from '../components/FormularioProducto'; // <--- Importar el formulario

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Estado para forzar la recarga de la lista
  const [recargar, setRecargar] = useState(0); 

  // Función para cargar los productos (se ejecuta al inicio y cuando se agrega uno)
  const cargarProductos = () => {
    setLoading(true);
    // Llama a la Netlify Function get-productos
    fetch('/.netlify/functions/get-productos')
      .then(res => {
        if (!res.ok) {
          throw new Error('Error al conectar con la API de productos');
        }
        return res.json();
      })
      .then(data => {
        setProductos(data);
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
  }, [recargar]); // Se ejecuta al inicio y cada vez que 'recargar' cambia

  // Función que el formulario llamará para forzar la recarga
  const handleProductAdded = () => {
    setRecargar(prev => prev + 1);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Inventario</h1>
      
      {/* 1. Formulario para agregar productos */}
      <FormularioProducto onProductAdded={handleProductAdded} /> 

      {/* 2. Lista de inventario (o mensajes de estado) */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-inner">
        <h2 className="text-2xl font-semibold mb-4">Inventario Actual ({productos.length})</h2>

        {loading && <div className="text-center text-indigo-600">Cargando lista...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        
        {!loading && !error && (
          <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto text-sm">
            {/* Mostrar los datos en formato JSON legible */}
            {JSON.stringify(productos, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

export default Inventario;