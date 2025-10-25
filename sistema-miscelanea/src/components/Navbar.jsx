// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import miLogo from './logo.jfif'; 

const LOGO_URL = miLogo;

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  
  const navigate = useNavigate(); 
  const usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
  const rolUsuario = localStorage.getItem('rol'); // <-- 1. OBTENEMOS EL ROL

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    navigate('/login'); 
  };

  // Estilos para los enlaces
  const linkStyle = "hover:text-gray-300";
  const activeLinkStyle = "text-cyan-300 font-bold";

  return (
    <nav
      className="w-full h-[96px] bg-[#350BF3] text-white flex items-center px-4 md:px-8 print:hidden"
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
        </div>
      </Link>

      {/* --- ENLACES DEL NAVBAR --- */}
      {/* Ajuste: Reducimos el gap y tamaño de texto para que quepa todo */}
      <div className="flex items-center gap-4 md:gap-5 ml-4 text-lg md:text-[22px] font-normal">
        <Link 
          to="/" 
          className={isActive('/') ? activeLinkStyle : linkStyle}
        >
          Inicio
        </Link>
        
        {/* --- 2. AQUÍ ESTÁ EL LINK QUE QUIERES --- */}
        {/* Solo aparece si el rol es 'administrador' */}
        {rolUsuario === 'administrador' && (
          <Link 
            to="/admin/crear-usuarios" 
            className={isActive('/admin/crear-usuarios') ? activeLinkStyle : linkStyle}
          >
            Usuarios
          </Link>
        )}
        
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
      </div>

      {/* --- BOTÓN DE CERRAR SESIÓN (A LA DERECHA) --- */}
      <div className="ml-auto flex items-center gap-4">
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
    </nav>
  );
}

export default Navbar;