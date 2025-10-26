// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import miLogo from './logo.jfif'; 
// 1. Importa el ícono para "Cerrar Sesión"
import { LogOut } from 'lucide-react'; 

const LOGO_URL = miLogo;

// 2. Componente de Enlace (para no repetir código)
function NavLink({ to, children, isActive }) {
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${
          isActive
            ? 'bg-gray-100 text-blue-600' // Estilo Activo
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900' // Estilo Inactivo
        }
      `}
    >
      {children}
    </Link>
  );
}

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
  const rolUsuario = localStorage.getItem('rol');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <nav
      // 3. CAMBIOS DE DISEÑO PRINCIPALES:
      // - Fondo blanco, altura 64px (h-16), sombra sutil
      className="w-full h-16 bg-white shadow-md flex items-center px-4 md:px-6 print:hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* 4. LOGO (más pequeño y sin borde) */}
      <Link to="/" className="flex-shrink-0 flex items-center">
        <img
          className="h-10 w-auto" // Logo más pequeño
          src={LOGO_URL}
          alt="Miscelánea La Económica"
        />
      </Link>

      {/* 5. ENLACES (después del logo, con el nuevo estilo) */}
      <div className="hidden md:flex items-center gap-2 ml-6">
        <NavLink to="/" isActive={location.pathname === '/'}>
          Inicio
        </NavLink>
        
        {/* Enlace de Admin (como lo teníamos antes) */}
        {rolUsuario === 'administrador' && (
          <NavLink 
            to="/admin/crear-usuarios" 
            isActive={location.pathname === '/admin/crear-usuarios'}
          >
            Usuarios
          </NavLink>
        )}
        
        <NavLink to="/clientes" isActive={location.pathname === '/clientes'}>
          Clientes
        </NavLink>
        <NavLink to="/facturacion" isActive={location.pathname === '/facturacion'}>
          Facturación
        </NavLink>
        <NavLink to="/inventario" isActive={location.pathname === '/inventario'}>
          Productos
        </NavLink>
        <NavLink to="/reportes" isActive={location.pathname === '/reportes'}>
          Reportes
        </NavLink>
      </div>

      {/* 6. MENÚ DE USUARIO (a la derecha, limpio) */}
      <div className="ml-auto flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700 hidden md:block">
          Hola, {usuarioLogueado}
        </span>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors"
          title="Cerrar Sesión"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:block">Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
