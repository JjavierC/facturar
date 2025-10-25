// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import miLogo from '../components/logo.jfif'; // Importa tu logo

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
      navigate('/'); // Redirige al dashboard principal
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  // --- JSX ACTUALIZADO CON LAS NUEVAS CLASES CSS ---
  return (
    // Usa la clase 'login-container' del index.css
    <div className="login-container">
      
      {/* 1. Título "LOGIN" */}
      <div className="login-title-box">
        <h1 className="login-title">LOGIN</h1>
      </div>

      {/* 2. Logo */}
      <div className="login-logo">
        <img
                src={miLogo} 
                alt="Miscelánea La Económica" 
                className="login-logo-img" // Usa clase de CSS
              />
        </div>

      <form onSubmit={handleSubmit} className="login-form">
        {/* 3. Input USUARIO */}
        <input
          type="text"
          placeholder="USUARIO"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          className="login-input" // Usa clase de CSS
        />
        
        {/* 4. Input CONTRASEÑA */}
        <input
          type="password"
          placeholder="CONTRASEÑA"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
          required
          className="login-input" // Usa clase de CSS
        />

        {/* 5. Botón INICIAR */}
        <button
          type="submit"
          disabled={loading}
          className="login-button" // Usa clase de CSS
        >
          {loading ? 'INGRESANDO...' : 'INICIAR'}
        </button>
      </form>

      {error && (
        <div className="login-error">
          {error}
        </div>
      )}
    </div>
  );
}

export default Login;

