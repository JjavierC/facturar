// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import miLogo from './logo.jfif'; 

const LOGO_URL = miLogo;

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

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

      <div className="flex items-center gap-4 md:gap-8 ml-auto text-xl md:text-[28px] font-normal">

        {/* --- 1. ENLACE NUEVO: Inicio --- */}
        <Link 
          to="/" 
          className={isActive('/') ? activeLinkStyle : linkStyle}
        >
          Inicio
        </Link>

        {/* --- 2. ENLACE NUEVO: Clientes --- */}
        <Link 
          to="/clientes" 
          className={isActive('/clientes') ? activeLinkStyle : linkStyle}
        >
          Clientes
        </Link>
        
        {/* --- 3. ENLACE EXISTENTE (Ruta actualizada) --- */}
        <Link 
          to="/facturacion" // <-- CAMBIO: Ya no es "/"
          className={isActive('/facturacion') ? activeLinkStyle : linkStyle}
        >
          Facturación
        </Link>
        
        {/* --- 4. ENLACE EXISTENTE (Sin cambios) --- */}
        <Link 
          to="/inventario" 
          className={isActive('/inventario') ? activeLinkStyle : linkStyle}
        >
          Productos
        </Link>
        
        {/* --- 5. ENLACE EXISTENTE (Sin cambios) --- */}
        <Link 
          to="/reportes" 
          className={isActive('/reportes') ? activeLinkStyle : linkStyle}
        >
          Reportes
        </Link>

      </div>
    </nav>
  );
}

export default Navbar;