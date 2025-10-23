import { Link, useLocation } from 'react-router-dom';

// DEBES REEMPLAZAR ESTO con la ruta a tu logo.
// El diseño de Figma usa un logo de 120x68px.
const LOGO_URL = '/logo.png'; // Ejemplo: '/img/mi-logo.png'

function Navbar() {
  const location = useLocation();

  // Función para ver si la ruta está activa
  const isActive = (path) => location.pathname.includes(path);

  return (
    <nav
      className="w-full h-[96px] bg-[#350BF3] text-white flex items-center px-14 border-b border-black"
      // La fuente 'Inter' debe estar importada en tu index.css
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Logo */}
      <Link to="/">
        <div
          className="w-[120px] h-[68px] rounded-[20px] border border-black bg-cover bg-center"
          // Si no tienes logo, usa un color de fondo temporal
          style={{ 
            backgroundImage: `url(${LOGO_URL})`,
            backgroundColor: !LOGO_URL ? '#ffffff30' : 'transparent'
          }}
        >
          {/* Si no hay logo, muestra un texto placeholder */}
          {!LOGO_URL && (
            <div className="w-full h-full flex items-center justify-center text-lg font-bold">
              LOGO
            </div>
          )}
        </div>
      </Link>

      {/* Enlaces de Navegación (Alineados a la derecha, idénticos a Figma) */}
      <div className="flex items-center gap-10 ml-auto text-[32px] font-normal">
        <Link 
          to="/inicio" 
          className={isActive('/inicio') ? "text-cyan-300 font-bold" : "hover:text-gray-300"}
        >
          inicio
        </Link>
        <Link 
          to="/clientes" 
          className={isActive('/clientes') ? "text-cyan-300 font-bold" : "hover:text-gray-300"}
        >
          clientes
        </Link>
        <Link 
          to="/productos" 
          className={isActive('/productos') ? "text-cyan-300 font-bold" : "hover:text-gray-300"}
        >
          productos
        </Link>
        <Link 
          to="/ventas" 
          className={isActive('/ventas') || isActive('/reportes') ? "text-cyan-300 font-bold" : "hover:text-gray-300"}
        >
          ventas
        </Link>
        <Link 
          to="/facturas" 
          className={isActive('/facturas') ? "text-cyan-300 font-bold" : "hover:text-gray-300"}
        >
          facturas
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;