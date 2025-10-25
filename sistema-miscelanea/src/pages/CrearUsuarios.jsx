// src/pages/CrearUsuarios.jsx
import React, { useState } from 'react';
import axios from 'axios';

function CrearUsuarios() {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [rol, setRol] = useState('cajero'); // 'cajero' por defecto
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token'); // Necesitaremos el token para autenticar esto

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setLoading(true);

    try {
      const res = await axios.post('/.netlify/functions/crear-usuario', 
        { usuario, contraseña, rol },
        { 
          headers: { 'Authorization': `Bearer ${token}` } // (Aún no lo usamos en la API, pero es buena práctica)
        }
      );
      setMensaje({ type: 'success', text: res.data.message });
      setUsuario('');
      setContraseña('');
      setRol('cajero');
    } catch (err) {
      setMensaje({ type: 'error', text: err.response?.data?.error || 'Error al crear usuario.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white rounded-lg shadow-xl mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Crear Nuevo Usuario</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rol</label>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="cajero">Cajero</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Crear Usuario'}
        </button>
      </form>
      
      {mensaje && (
        <div 
          className={`mt-4 p-3 rounded-md text-center ${
            mensaje.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {mensaje.text}
        </div>
      )}
    </div>
  );
}

export default CrearUsuarios;