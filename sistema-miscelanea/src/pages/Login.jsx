// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import miLogo from '../components/logo.jfif'; // Importa tu logo (ajusta la ruta si es necesario)

function Login() {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post('/.netlify/functions/login', {
        usuario,
        contraseña,
      });

      // Guardamos el token y el rol en el almacenamiento local
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('rol', res.data.rol);
      localStorage.setItem('usuario', res.data.usuario);

      // Redirigir según el rol
      if (res.data.rol === 'administrador') {
        navigate('/'); // El admin va al dashboard principal
      } else {
        navigate('/'); // El cajero también va al dashboard principal
      }
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white py-12">
      
      {/* 1. Título "LOGIN" */}
      <div className="bg-cyan-400 rounded-lg px-8 py-2 mb-6">
        <h1 className="text-white text-3xl font-bold">LOGIN</h1>
      </div>

      {/* 2. Logo */}
      <div className="w-80 h-32 mb-6 rounded-lg overflow-hidden border">
        <img 
          src={miLogo} 
          alt="Miscelánea La Económica" 
          className="w-full h-full object-cover" 
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
        {/* 3. Input USUARIO */}
        <input
          type="text"
          placeholder="USUARIO"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          className="w-80 p-3 bg-gray-200 rounded-md text-lg placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {/* 4. Input CONTRASEÑA */}
        <input
          type="password"
          placeholder="CONTRASEÑA"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
          required
          className="w-80 p-3 bg-gray-200 rounded-md text-lg placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* 5. Botón INICIAR */}
        <button
          type="submit"
          disabled={loading}
          className="w-80 p-3 bg-blue-600 text-white rounded-md text-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'INGRESANDO...' : 'INICIAR'}
        </button>
      </form>

      {error && (
        <div className="mt-6 text-red-500 text-center font-semibold">
          {error}
        </div>
      )}
    </div>
  );
}

export default Login;