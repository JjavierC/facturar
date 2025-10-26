// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom'; // <-- 1. IMPORTA useNavigate
import miLogo from './logo.jfif'; 

const LOGO_URL = miLogo;

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navigate = useNavigate(); // <-- 2. INICIALIZA useNavigate
  const usuarioLogueado = localStorage.getItem('usuario') || 'Usuario'; // Para el "Hola, ..."

  // --- 3. FUNCIÓN PARA CERRAR SESIÓN ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    navigate('/login'); // Redirige al login
  };

  // Estilos para los enlaces (así no repetimos código)
  const linkStyle = "hover:text-gray-300";
  const activeLinkStyle = "text-cyan-300 font-bold";

  return (
    <nav
      className="w-full h-[96px] bg-[#350BF3] text-white flex items-center px-4 md:px-14 border-b border-black print:hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <Link to="/">
        <div
          className="w-[100px] h-[68px] md:w-[120px] rounded-[20px] border border-black bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${LOGO_URL})`,
            backgroundColor: !LOGO_URL ? '#ffffff30' : 'transparent'
          }}
        >
          {/* ... (el logo se queda igual) ... */}
        </div>
      </Link>

      {/* Ajuste: Este div ahora contiene tus enlaces Y el botón de logout.
        Cambié el gap y el tamaño de texto un poco para que todo quepa.
      */}
      <div className="flex items-center gap-4 md:gap-6 ml-auto text-lg md:text-[24px] font-normal">

        {/* --- Tus enlaces (sin cambios) --- */}
        <Link 
          to="/" 
          className={isActive('/') ? activeLinkStyle : linkStyle}
        >
          Inicio
        </Link>
        <Link 
          to="/clientes" 
          className={isActive('/clientes') ? activeLinkStyle : linkStyle}
        >
          Clientes
        </Link>
        <Link 
          to="/facturacion"
          className={isActive('/facturacion') ? activeLinkStyle : linkStyle}
        >
          Facturación
        </Link>
        <Link 
          to="/inventario" 
          className={isActive('/inventario') ? activeLinkStyle : linkStyle}
        >
          Productos
        </Link>
        <Link 
          to="/reportes" 
          className={isActive('/reportes') ? activeLinkStyle : linkStyle}
        >
          Reportes
        </Link>

        {/* --- 4. COSA DE CERRAR SESIÓN AÑADIDA --- */}
        <div className="flex items-center gap-3 pl-4">
          <span className="text-sm text-gray-300 hidden md:block">
            Hola, {usuarioLogueado}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
        
      </div>
    </nav>
  );
}

export default Navbar;