import { Link } from 'react-router-dom';

// NOTA: Reemplaza 'URL_DE_TU_LOGO.png' con la ruta real a tu imagen de logo.
const LOGO_URL = null; // o 'URL_DE_TU_LOGO.png'

function Navbar() {
  return (
    <nav
      className="w-full h-[96px] bg-[#350BF3] text-white flex items-center justify-between px-14 border-b border-black"
      // La fuente 'Inter' debe estar importada en tu index.css
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Logo (según especificación de Figma) */}
      <Link to="/">
        <div
          className="w-[120px] h-[68px] rounded-[20px] border border-black bg-cover bg-center bg-white/20 flex items-center justify-center"
          style={{ backgroundImage: LOGO_URL ? `url(${LOGO_URL})` : 'none' }}
        >
          {/* Placeholder si no hay logo */}
          {!LOGO_URL && (
            <span className="font-bold text-lg">LOGO</span>
          )}
        </div>
      </Link>

      {/* Enlaces de Navegación (funcionales, con estilo de Figma) */}
      {/* Usamos tus enlaces existentes para no dañar la funcionalidad */}
      <div className="flex space-x-10">
        <Link
          to="/"
          // Estilo de Figma: 32px, blanco, normal
          className="text-white hover:text-gray-300 text-3xl font-normal transition-colors"
        >
          Facturación
        </Link>
        <Link
          to="/inventario"
          className="text-white hover:text-gray-300 text-3xl font-normal transition-colors"
        >
          Inventario
        </Link>
        <Link
          to="/reportes"
          // Resaltamos el enlace de la página actual, como en el ejemplo
          className="text-cyan-300 font-bold text-3xl transition-colors"
        >
          Reportes
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;