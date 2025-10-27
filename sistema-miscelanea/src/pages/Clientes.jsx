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
  
  // --- NUEVO: Estado para saber qué cliente está seleccionado ---
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null); 
  
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [recargar, setRecargar] = useState(0);

  // --- 1. LEER CLIENTES DE LA API ---
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        setLoading(true);
        // No limpiamos el mensaje aquí para que duren
        const res = await axios.get('/.netlify/functions/get-clientes');
        setClientes(res.data);
      } catch (err) {
        setMensaje({ type: 'error', text: 'Error al cargar clientes.' });
      } finally {
        setLoading(false);
      }
    };
    cargarClientes();
  }, [recargar]);

  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- NUEVO: Función para limpiar el formulario y la selección ---
  const limpiarFormulario = () => {
    setClienteSeleccionado(null);
    setFormData({ nombre: '', apellido: '', cedula: '' });
    setMensaje(null);
  };

  // --- NUEVO: Función para seleccionar un cliente de la tabla ---
  const handleSelectCliente = (cliente) => {
    if (loading) return; // No hacer nada si está cargando
    
    // Si se hace clic en el mismo cliente, se deselecciona
    if (clienteSeleccionado && clienteSeleccionado._id === cliente._id) {
      limpiarFormulario();
    } else {
      setClienteSeleccionado(cliente);
      setFormData({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        cedula: cliente.cedula,
      });
      setMensaje(null); // Limpia mensajes al seleccionar
    }
  };

  // --- 2. GUARDAR CLIENTE EN LA API (Registrar) ---
  const handleRegistrar = async (e) => {
    e.preventDefault();
    setMensaje(null);
    if (!formData.nombre || !formData.apellido || !formData.cedula) {
      setMensaje({ type: 'error', text: 'Todos los campos son obligatorios.' });
      return;
    }
    
    if (clienteSeleccionado) {
      setMensaje({ type: 'error', text: 'Cliente seleccionado. Use "Actualizar" o "Limpiar".' });
      return;
    }

    try {
      setLoading(true); 
      await axios.post('/.netlify/functions/add-cliente', formData);
      setMensaje({ type: 'success', text: `Cliente "${formData.nombre}" registrado.` });
      limpiarFormulario(); // Limpiamos
      setRecargar(prev => prev + 1); // Recargamos la tabla
    } catch (error) {
      setMensaje({ type: 'error', text: 'Error al guardar el cliente.' });
      setLoading(false);
    }
  };

  // --- 3. NUEVO: Función para ACTUALIZAR ---
const handleActualizar = async () => {
  if (!clienteSeleccionado) return;

  setMensaje(null);
  setLoading(true);

  // Debug: confirma el id en consola
  console.log('[DEBUG] Actualizando cliente:', clienteSeleccionado);

  try {
    // Usar params es más confiable que concatenar en la URL
    await axios.put('/.netlify/functions/update-cliente', formData, {
      params: { id: clienteSeleccionado._id }
    });

    setMensaje({ type: 'success', text: `Cliente "${formData.nombre}" actualizado.` });
    limpiarFormulario();
    setRecargar(prev => prev + 1);
  } catch (error) {
    // Mostrar detalle en consola y al usuario
    console.error('[ERROR] update-cliente:', error.response?.data || error.message);
    const texto = error.response?.data?.message || error.response?.data?.error || 'Error al actualizar el cliente.';
    setMensaje({ type: 'error', text: texto });
    setLoading(false);
  }
};

  // --- 4. NUEVO: Función para ELIMINAR ---
const handleEliminar = async () => {
  if (!clienteSeleccionado) return;

  if (!window.confirm(`¿Seguro que quieres eliminar a ${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}?`)) {
    return;
  }

  setMensaje(null);
  setLoading(true);

  // Debug: confirma el id en consola
  console.log('[DEBUG] Eliminando cliente:', clienteSeleccionado);

  try {
    // Usar params en delete
    await axios.delete('/.netlify/functions/delete-cliente', {
      params: { id: clienteSeleccionado._id }
    });

    setMensaje({ type: 'success', text: 'Cliente eliminado.' });
    limpiarFormulario();
    setRecargar(prev => prev + 1);
  } catch (error) {
    console.error('[ERROR] delete-cliente:', error.response?.data || error.message);
    const texto = error.response?.data?.message || error.response?.data?.error || 'Error al eliminar el cliente.';
    setMensaje({ type: 'error', text: texto });
    setLoading(false);
  }
};
  
  return (
    <div className="p-4 md:p-8 bg-white min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        REGISTRAR CLIENTE
      </h1>

      <form 
        onSubmit={handleRegistrar} // El submit del form sigue siendo "Registrar"
        className="max-w-4xl mx-auto bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 mb-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text" name="nombre" value={formData.nombre} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input
              type="text" name="apellido" value={formData.apellido} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
            <input
              type="text" name="cedula" value={formData.cedula} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        {/* --- CAMBIO: Botones con nueva lógica --- */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          <button 
            type="submit" // Botón de Registrar (usa el onSubmit del form)
            disabled={loading || !!clienteSeleccionado} // Desactivado si carga o si hay selección
            className="px-6 py-2 bg-[#350BF3] text-white rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading && !clienteSeleccionado ? 'Guardando...' : 'Registrar'}
          </button>
          
          <button 
            type="button" // Es tipo "button" para no disparar el onSubmit
            onClick={handleActualizar} // Llama a la función de actualizar
            disabled={loading || !clienteSeleccionado} // Desactivado si carga o si NO hay selección
            className="px-6 py-2 bg-yellow-500 text-white rounded-md font-semibold hover:bg-yellow-600 disabled:opacity-50"
          >
            {loading && !!clienteSeleccionado ? 'Actualizando...' : 'Actualizar'}
          </button>
          
          <button 
            type="button" 
            onClick={handleEliminar}
            disabled={loading || !clienteSeleccionado} // Desactivado si carga o si NO hay selección
            className="px-6 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 disabled:opacity-50"
          >
            Eliminar
          </button>
          
          {/* --- NUEVO: Botón para limpiar --- */}
          {/* Se muestra solo si hay un cliente seleccionado */}
          {clienteSeleccionado && (
            <button 
              type="button" 
              onClick={limpiarFormulario}
              disabled={loading}
              className="px-6 py-2 bg-gray-500 text-white rounded-md font-semibold hover:bg-gray-600"
            >
              Limpiar / Cancelar
            </button>
          )}
        </div>
      </form>

      {mensaje && (
        <div 
          className={`max-w-4xl mx-auto text-center p-3 rounded-md mb-8 ${
            mensaje.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {mensaje.text}
        </div>
      )}

      <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">
        Lista de Clientes (Haz clic para seleccionar)
      </h2>
      
      {/* --- CAMBIO: Tabla de Clientes (ahora seleccionable) --- */}
      <div className="max-w-6xl mx-auto overflow-x-auto shadow-lg">
        <table className="w-full border-collapse border border-black">
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
            
            {!loading && clientes.map((cliente) => (
              <tr 
                key={cliente._id} 
                // --- NUEVO: onClick para seleccionar y estilo de fondo ---
                onClick={() => handleSelectCliente(cliente)}
                className={`h-[60px] text-center cursor-pointer ${
                  clienteSeleccionado?._id === cliente._id 
                    ? 'bg-blue-200 hover:bg-blue-300' // Fila seleccionada
                    : 'even:bg-white odd:bg-gray-50 hover:bg-gray-100' // Fila normal
                }`}
              >
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