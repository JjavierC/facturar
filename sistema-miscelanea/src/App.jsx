import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Facturacion from './pages/Facturacion';
import Inventario from './pages/Inventario';
import Reportes from './pages/Reportes';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar /> 
      
      <main className="p-6">
        <Routes>
          {/* Ruta principal, redirige a Facturación */}
          <Route path="/" element={<Facturacion />} /> 
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/reportes" element={<Reportes />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;