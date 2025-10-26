// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import miLogo from './logo.jfif'; 

const LOGO_URL = miLogo;

// Componente de Enlace (para no repetir código)
function NavLink({ to, children, isActive }) {
  // 1. Usamos las clases de CSS que creamos en index.css
  const className = isActive
    ? 'navbar-clean-link navbar-clean-link-active' // Activo
    : 'navbar-clean-link'; // Inactivo
    
  return (
    <Link to={to} className={className}>
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
    // 2. Contenedor principal del Navbar (usa CSS)
    <nav
      className="navbar-clean-container"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* 3. LOGO (usa CSS) */}
      <Link to="/" className="navbar-clean-logo-link">
        <img
          className="navbar-clean-logo-img"
          src={LOGO_URL}
          alt="Miscelánea La Económica"
        />
      </Link>

      {/* 4. ENLACES (usa CSS) */}
      <div className="navbar-clean-links">
        <NavLink to="/" isActive={location.pathname === '/'}>
          Inicio
        </NavLink>
        
        {/* Este es el link de Admin, que se muestra solo si eres admin */}
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

      {/* 5. MENÚ DE USUARIO (usa CSS) */}
      <div className="navbar-clean-user-menu">
        <span className="navbar-clean-user-text">
          Hola, {usuarioLogueado}
        </span>
        
<button
  onClick={handleLogout}
  className="navbar-clean-logout-button"
  title="Cerrar Sesión"
>
  <span className="logout-text">Cerrar Sesión</span>
</button>

      </div>
    </nav>
  );
}

export default Navbar;