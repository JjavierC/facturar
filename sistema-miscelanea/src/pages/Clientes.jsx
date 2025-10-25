// src/pages/Clientes.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // ¡Ahora sí lo usamos!

function Clientes() {
  const [clientes, setClientes] = useState([]);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
  });
  
  const [loading, setLoading] = useState(true); // Empezamos en true
  const [mensaje, setMensaje] = useState(null);
  

  const [recargar, setRecargar] = useState(0);

  // --- 1. LEER CLIENTES DE LA API ---
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        setLoading(true);
        setMensaje(null);
        // Esta es la llamada real a la API que creamos
        const res = await axios.get('/.netlify/functions/get-clientes');
        setClientes(res.data);
      } catch (err) {
        setMensaje({ type: 'error', text: 'Error al cargar clientes.' });
      } finally {
        setLoading(false);
      }
    };
    
    cargarClientes();
  }, [recargar]); // Se ejecuta al inicio y cada vez que 'recargar' cambia

  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 2. GUARDAR CLIENTE EN LA API ---
  const handleRegistrar = async (e) => {
    e.preventDefault();
    setMensaje(null);
    if (!formData.nombre || !formData.apellido || !formData.cedula) {
      setMensaje({ type: 'error', text: 'Todos los campos son obligatorios.' });
      return;
    }

    try {
      setLoading(true); // Mostramos que está "guardando"
      
      // Esta es la llamada POST a la API que creamos
      await axios.post('/.netlify/functions/add-cliente', formData);

      setMensaje({ type: 'success', text: `Cliente "${formData.nombre}" registrado.` });
      setFormData({ nombre: '', apellido: '', cedula: '' }); // Limpiamos el formulario
      setRecargar(prev => prev + 1); // Forzamos a recargar la lista de clientes
      
    } catch (error) {
      setMensaje({ type: 'error', text: 'Error al guardar el cliente.' });
      setLoading(false);
    }
    // No ponemos finally(setLoading(false)) porque el useEffect ya lo hará
  };
  
  return (
    <div className="p-4 md:p-8 bg-white min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        REGISTRAR CLIENTE
      </h1>

      {/* Formulario de Registro */}
      <form 
        onSubmit={handleRegistrar} 
        className="max-w-4xl mx-auto bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 mb-10"
      >
        {/* ... (el formulario sigue igual que antes) ... */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-6">
          <button 
            type="submit" 
            disabled={loading} // Deshabilitamos el botón si está cargando
            className="px-6 py-2 bg-[#350BF3] text-white rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Registrar'}
          </button>
          <button 
            type="button" 
            className="px-6 py-2 bg-yellow-500 text-white rounded-md font-semibold hover:bg-yellow-600"
          >
            Actualizar
          </button>
          <button 
            type="button" 
            className="px-6 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600"
          >
            Eliminar
          </button>
        </div>
      </form>

      {/* Mensaje de feedback */}
      {mensaje && (
        <div 
          className={`max-w-4xl mx-auto text-center p-3 rounded-md mb-8 ${
            mensaje.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {mensaje.text}
        </div>
      )}

      {/* Tabla de Clientes */}
      <div className="max-w-6xl mx-auto overflow-x-auto shadow-lg">
        <table className="w-full border-collapse border border-black">
          {/* ... (el <thead> sigue igual) ... */}
          <thead>
            <tr className="bg-gray-100 h-[55px]">
              <th className="border border-black p-2 text-xl font-medium">ID</th>
              <th className="border border-black p-2 text-xl font-medium">Nombre</th>
              <th className="border border-black p-2 text-xl font-medium">Apellido</th>
              <th className="border border-black p-2 text-xl font-medium">Cédula</th>
            </tr>
          </thead>
          
          <tbody>
            {loading && (
              <tr>
                <td colSpan="4" className="text-center p-4 text-lg">Cargando clientes...</td>
              </tr>
            )}
            {!loading && clientes.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center p-4 text-lg text-gray-500">No hay clientes registrados.</td>
              </tr>
            )}
            
            {/* AHORA MOSTRAMOS LOS DATOS REALES DE LA API */}
            {!loading && clientes.map((cliente) => (
              <tr key={cliente._id} className="h-[60px] even:bg-white odd:bg-gray-50 text-center">
                <td className="border border-black p-2 text-lg">{cliente._id.slice(-6)}</td>
                <td className="border border-black p-2 text-lg capitalize">{cliente.nombre}</td>
                <td className="border border-black p-2 text-lg capitalize">{cliente.apellido}</td>
                <td className="border border-black p-2 text-lg">{cliente.cedula}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Clientes;