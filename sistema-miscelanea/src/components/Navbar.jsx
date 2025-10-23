// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';

// DEBES REEMPLAZAR ESTO con la ruta a tu logo.
const LOGO_URL = null; // Ejemplo: '/logo-real.png'

function Navbar() {
  const location = useLocation();

  // Función para ver si la ruta está activa
  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="w-full h-[96px] bg-[#350BF3] text-white flex items-center px-4 md:px-14 border-b border-black print:hidden" // Ocultar al imprimir
      // La fuente 'Inter' debe estar importada en tu index.css
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Logo */}
      <Link to="/">
        <div
          className="w-[100px] h-[68px] md:w-[120px] rounded-[20px] border border-black bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${LOGO_URL})`,
            backgroundColor: !LOGO_URL ? '#ffffff30' : 'transparent'
          }}
        >
          {!LOGO_URL && (
            <div className="w-full h-full flex items-center justify-center text-sm md:text-lg font-bold">
              LOGO
            </div>
          )}
        </div>
      </Link>

      {/* Enlaces de Navegación (Tus páginas reales) */}
      <div className="flex items-center gap-4 md:gap-10 ml-auto text-xl md:text-[32px] font-normal">
        <Link 
          to="/" 
          // Resalta si la ruta es exacta
          className={isActive('/') ? "text-cyan-300 font-bold" : "hover:text-gray-300"}
        >
          Facturación
        </Link>
        <Link 
          to="/inventario" 
          className={isActive('/inventario') ? "text-cyan-300 font-bold" : "hover:text-gray-300"}
        >
          Inventario
        </Link>
        <Link 
          to="/reportes" 
          className={isActive('/reportes') ? "text-cyan-300 font-bold" : "hover:text-gray-300"}
        >
          Reportes
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;