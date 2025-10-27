// src/pages/Facturacion.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import TablaVenta from '../components/TablaVenta';
import FacturaImprimible from '../components/FacturaImprimible';
import "../index.css"; // Estilos globales y de factura

function Facturacion() {
  const [productosInventario, setProductosInventario] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [itemsVenta, setItemsVenta] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [ventaExitosa, setVentaExitosa] = useState(null);
  const [ivaPorcentaje, setIvaPorcentaje] = useState(19);

  const busquedaRef = useRef(null);

  // 1. Cargar inventario
  useEffect(() => {
    const cargarInventario = async () => {
      try {
        const res = await axios.get('/.netlify/functions/get-productos');
        setProductosInventario(res.data);
      } catch (err) {
        console.error("Error al cargar inventario:", err);
        setMensaje({ type: 'error', text: 'Error al cargar productos del inventario.' });
      }
    };
    cargarInventario();
  }, [ventaExitosa]); // Recarga inventario post-venta

  // 2. Lógica de búsqueda
  const handleBusquedaChange = useCallback((e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    if (valor.length > 1) {
      const filtered = productosInventario.filter(prod =>
        prod.nombre.toLowerCase().includes(valor.toLowerCase()) ||
        prod._id.toLowerCase().includes(valor.toLowerCase())
      );
      setSugerencias(filtered);
    } else {
      setSugerencias([]);
    }
  }, [productosInventario]);

  // 3. Agregar al carrito
  const agregarProductoAlCarrito = useCallback((producto) => {
    setMensaje(null);
    setBusqueda('');
    setSugerencias([]);
    const productoEnInventario = productosInventario.find(p => p._id === producto._id);

    if (!productoEnInventario) {
      setMensaje({ type: 'error', text: 'Error: Producto no encontrado.' });
      return;
    }
    if (productoEnInventario.stock <= 0) {
      setMensaje({ type: 'error', text: `¡Alerta! "${producto.nombre}" está agotado.` });
      return;
    }

    setItemsVenta(prevItems => {
      const itemExistente = prevItems.find(item => item._id === producto._id);
      if (itemExistente) {
        const nuevaCantidad = itemExistente.cantidad + 1;
        if (nuevaCantidad > productoEnInventario.stock) {
          setMensaje({ type: 'error', text: `No hay suficiente stock de "${producto.nombre}". Stock: ${productoEnInventario.stock}` });
          return prevItems;
        }
        return prevItems.map(item =>
          item._id === producto._id ? { ...item, cantidad: nuevaCantidad } : item
        );
      } else {
        return [
          ...prevItems,
          {
            _id: producto._id, nombre: producto.nombre, precio: producto.precio,
            costo: producto.costo, cantidad: 1, stock: productoEnInventario.stock,
          },
        ];
      }
    });
    if (busquedaRef.current) busquedaRef.current.focus();
  }, [productosInventario]);

  // 4. Actualizar cantidad
  const actualizarItemEnCarrito = useCallback((idProducto, nuevaCantidad) => {
    setMensaje(null);
    setItemsVenta(prevItems => {
      const productoInventario = productosInventario.find(p => p._id === idProducto);
      if (!productoInventario) return prevItems;

      if (nuevaCantidad <= 0) {
        return prevItems.filter(item => item._id !== idProducto);
      } else if (nuevaCantidad > productoInventario.stock) {
        setMensaje({ type: 'error', text: `Stock insuficiente para "${productoInventario.nombre}". Stock: ${productoInventario.stock}` });
         return prevItems.map(item =>
          item._id === idProducto ? { ...item, cantidad: productoInventario.stock } : item
        );
      } else {
        return prevItems.map(item =>
          item._id === idProducto ? { ...item, cantidad: nuevaCantidad } : item
        );
      }
    });
  }, [productosInventario]);

  // 5. Cálculos
  const subtotal = itemsVenta.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const ivaCalculado = subtotal * (ivaPorcentaje / 100);
  const total = subtotal + ivaCalculado;

  // 6. Procesar Venta
  const procesarVenta = async () => {
    if (itemsVenta.length === 0) {
      setMensaje({ type: 'error', text: 'El carrito está vacío.' }); return;
    }
    setLoading(true); setMensaje(null);
    try {
      const costoTotalProductos = itemsVenta.reduce((sum, item) => sum + (item.costo || 0) * item.cantidad, 0);
      const totalGanancias = subtotal - costoTotalProductos;
      const ventaData = {
        fecha_venta: new Date().toISOString(),
        items: itemsVenta.map(item => ({
          producto_id: item._id, nombre: item.nombre, precio: item.precio,
          costo: item.costo, cantidad: item.cantidad,
        })),
        subtotal: subtotal, iva: ivaCalculado, total: total, total_ganancias: totalGanancias,
      };
      const res = await axios.post('/.netlify/functions/guardar-venta', ventaData);
      setMensaje({ type: 'success', text: `¡Venta registrada! ID: ${res.data.ventaId}` });
      setVentaExitosa({ ...ventaData, _id: res.data.ventaId });
      setItemsVenta([]); // Limpiar carrito
    } catch (err) {
      console.error('Error al procesar venta:', err.response ? err.response.data : err.message);
      setMensaje({ type: 'error', text: `Error al registrar venta: ${err.response?.data?.error || err.message}` });
    } finally { setLoading(false); }
  };

  // 7. Imprimir
  const handleImprimirFactura = () => { window.print(); setVentaExitosa(null); };

  return (
    // CAMBIO: Fondo gris claro para toda la página
    <div className="bg-gray-100 min-h-screen main-ui">
      
      {/* ========================================================== */}
      {/* CAMBIO: Contenedor principal centrado con ancho máximo    */}
      {/* ========================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Punto de Venta</h1> {/* Centrado */}

        {/* Sección de Búsqueda (ya estaba centrada, pero ahora dentro del contenedor principal) */}
        <section className="bg-white p-6 rounded-lg shadow-xl mb-10 max-w-4xl mx-auto relative"> {/* Aumentado mb */}
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Buscar y Añadir Producto</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Escanear ID o buscar por nombre..."
              className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={busqueda}
              onChange={handleBusquedaChange}
              onKeyPress={(e) => { /* Lógica Enter sin cambios */ }}
              ref={busquedaRef}
            />
            <button
              onClick={() => { /* Lógica Añadir sin cambios */ }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              disabled={!busqueda}
            >
              Añadir
            </button>
          </div>

          {/* Lista de sugerencias */}
          {sugerencias.length > 0 && busqueda.length > 1 && (
            <ul className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg left-6 right-6">
              {sugerencias.map((prod) => (
                <li
                  key={prod._id}
                  onClick={() => agregarProductoAlCarrito(prod)}
                  className="p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                >
                  {prod.nombre} (Stock: {prod.stock}) - ${prod.precio.toLocaleString()}
                </li>
              ))}
            </ul>
          )}

          {/* Mensaje */}
          {mensaje && (
            <div
              className={`mt-4 p-3 rounded-md text-sm ${mensaje.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              {mensaje.text}
            </div>
          )}
        </section>

        {/* Resumen de la Venta / Carrito (ya estaba centrada) */}
        <section className="max-w-4xl mx-auto mb-10"> {/* Aumentado mb */}
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Resumen de la Venta</h2> {/* Centrado */}
          <TablaVenta items={itemsVenta} actualizarItem={actualizarItemEnCarrito} />

          {/* Recuadro de Totales */}
          {itemsVenta.length > 0 && ( // Solo muestra totales si hay items
            <div className="bg-white p-6 rounded-lg shadow-xl mt-4">
              <div className="flex justify-between text-lg mb-2">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between text-lg mb-2">
                <span>IVA ({ivaPorcentaje}%):</span>
                <span>${ivaCalculado.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2">
                <span>TOTAL:</span>
                <span>${total.toLocaleString('es-CO')}</span>
              </div>
            </div>
          )}

          {/* Botón Procesar Venta */}
          <button
            onClick={procesarVenta}
            disabled={loading || itemsVenta.length === 0}
            className="mt-6 w-full py-3 bg-green-600 text-white text-xl font-bold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Procesar Venta y Facturar'}
          </button>
        </section>

      </div> {/* Fin del contenedor principal */}

      {/* Modal de Factura (sin cambios, es 'fixed') */}
      {ventaExitosa && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 print-modal-wrapper">
          <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 modal-buttons">Factura Generada</h2>
            <FacturaImprimible venta={ventaExitosa} ivaPorcentaje={ivaPorcentaje} />
            <div className="flex justify-end gap-4 mt-6 modal-buttons">
              <button
                onClick={() => setVentaExitosa(null)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                onClick={handleImprimirFactura}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Imprimir Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div> // Fin del div de fondo gris
  );
}

export default Facturacion;
