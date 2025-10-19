import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo / Título */}
          <Link to="/" className="text-xl font-bold text-indigo-600">
            Miscelánea POS
          </Link>

          {/* Enlaces de Navegación */}
          <div className="flex space-x-4">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium"
            >
              Facturación
            </Link>
            <Link 
              to="/inventario" 
              className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium"
            >
              Inventario
            </Link>
            <Link 
              to="/reportes" 
              className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium"
            >
              Reportes
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;