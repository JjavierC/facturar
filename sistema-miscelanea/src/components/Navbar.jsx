import { Link, useLocation } from 'react-router-dom';
import miLogo from './logo.jfif'; 

const LOGO_URL = miLogo;

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

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
          {!LOGO_URL && (
            <div className="w-full h-full flex items-center justify-center text-sm md:text-lg font-bold">
              LOGO
            </div>
          )}
        </div>
      </Link>

      <div className="flex items-center gap-4 md:gap-10 ml-auto text-xl md:text-[32px] font-normal">
        <Link 
          to="/" 
          className={isActive('/') ? "text-cyan-300 font-bold" : "hover:text-gray-300"}
        >
          Facturación
        </Link>
        <Link 
          to="/inventario" 
          className={isActive('/inventario') ? "text-cyan-300 font-bold" : "hover:text-gray-300"}
        >
          Productos
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