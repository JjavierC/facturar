// src/pages/Facturacion.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import TablaVenta from '../components/TablaVenta';
import FacturaImprimible from '../components/FacturaImprimible';
import "../index.css";

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

  // Cargar inventario
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
  }, [ventaExitosa]);

  // Búsqueda
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

  // Agregar producto
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
      setMensaje({ type: 'error', text: `¡"${producto.nombre}" está agotado!` });
      return;
    }

    setItemsVenta(prevItems => {
      const existente = prevItems.find(item => item._id === producto._id);
      if (existente) {
        const nuevaCantidad = existente.cantidad + 1;
        if (nuevaCantidad > productoEnInventario.stock) {
          setMensaje({ type: 'error', text: `Stock insuficiente: ${productoEnInventario.stock}` });
          return prevItems;
        }
        return prevItems.map(item =>
          item._id === producto._id ? { ...item, cantidad: nuevaCantidad } : item
        );
      } else {
        return [...prevItems, { ...producto, cantidad: 1, stock: productoEnInventario.stock }];
      }
    });

    if (busquedaRef.current) busquedaRef.current.focus();
  }, [productosInventario]);

  // Actualizar cantidad
  const actualizarItemEnCarrito = useCallback((idProducto, nuevaCantidad) => {
    setMensaje(null);
    setItemsVenta(prevItems => {
      const productoInventario = productosInventario.find(p => p._id === idProducto);
      if (!productoInventario) return prevItems;
      if (nuevaCantidad <= 0) return prevItems.filter(i => i._id !== idProducto);
      if (nuevaCantidad > productoInventario.stock) {
        setMensaje({ type: 'error', text: `Stock insuficiente para "${productoInventario.nombre}"` });
        return prevItems.map(i => i._id === idProducto ? { ...i, cantidad: productoInventario.stock } : i);
      }
      return prevItems.map(i => i._id === idProducto ? { ...i, cantidad: nuevaCantidad } : i);
    });
  }, [productosInventario]);

  // Cálculos
  const subtotal = itemsVenta.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  const iva = subtotal * (ivaPorcentaje / 100);
  const total = subtotal + iva;

  // Procesar venta
  const procesarVenta = async () => {
    if (itemsVenta.length === 0) {
      setMensaje({ type: 'error', text: 'El carrito está vacío.' });
      return;
    }
    setLoading(true); setMensaje(null);
    try {
      const costoTotal = itemsVenta.reduce((sum, i) => sum + (i.costo || 0) * i.cantidad, 0);
      const ventaData = {
        fecha_venta: new Date().toISOString(),
        items: itemsVenta.map(i => ({
          producto_id: i._id, nombre: i.nombre, precio: i.precio, costo: i.costo, cantidad: i.cantidad
        })),
        subtotal, iva, total, total_ganancias: subtotal - costoTotal,
      };
      const res = await axios.post('/.netlify/functions/guardar-venta', ventaData);
      setMensaje({ type: 'success', text: `¡Venta registrada! ID: ${res.data.ventaId}` });
      setVentaExitosa({ ...ventaData, _id: res.data.ventaId });
      setItemsVenta([]);
    } catch (err) {
      console.error('Error al procesar venta:', err);
      setMensaje({ type: 'error', text: 'Error al registrar la venta.' });
    } finally {
      setLoading(false);
    }
  };

  const handleImprimirFactura = () => { window.print(); setVentaExitosa(null); };

  // -------------------- UI --------------------

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-start py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl p-8 md:p-10 border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 flex items-center justify-center gap-2">
          <span role="img" aria-label="ticket">🧾</span>
          Punto de Venta
        </h1>

        {/* Buscar producto */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Buscar y añadir producto
          </h2>
          <div className="flex gap-2">
            <input
              ref={busquedaRef}
              type="text"
              placeholder="Buscar por nombre o ID..."
              value={busqueda}
              onChange={handleBusquedaChange}
              className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {sugerencias.length > 0 && (
            <ul className="mt-2 border rounded-lg shadow-md bg-white max-h-60 overflow-y-auto">
              {sugerencias.map((prod) => (
                <li
                  key={prod._id}
                  onClick={() => agregarProductoAlCarrito(prod)}
                  className="p-3 hover:bg-indigo-50 cursor-pointer border-b last:border-none transition-colors"
                >
                  <span className="font-medium text-gray-800">{prod.nombre}</span>
                  <span className="text-gray-500 ml-2">
                    ${prod.precio.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Resumen */}
        <section className="mb-10 bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
            Resumen de la venta
          </h2>

          <TablaVenta items={itemsVenta} actualizarItem={actualizarItemEnCarrito} />

          {itemsVenta.length > 0 && (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between mb-2 text-gray-700">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-700">
                <span>IVA ({ivaPorcentaje}%)</span>
                <span>${iva.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between font-bold text-xl border-t pt-3 text-gray-900">
                <span>Total</span>
                <span>${total.toLocaleString('es-CO')}</span>
              </div>
            </div>
          )}

          <button
            onClick={procesarVenta}
            disabled={loading || itemsVenta.length === 0}
            className="mt-8 w-full py-3 text-lg font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Procesar venta y facturar'}
          </button>
        </section>

        {mensaje && (
          <div
            className={`mt-4 p-3 rounded-md text-center text-sm ${
              mensaje.type === 'success'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}
          >
            {mensaje.text}
          </div>
        )}
      </div>

      {/* Modal de factura */}
      {ventaExitosa && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Factura generada</h2>
            <FacturaImprimible venta={ventaExitosa} ivaPorcentaje={ivaPorcentaje} />
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setVentaExitosa(null)}
                className="px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cerrar
              </button>
              <button
                onClick={handleImprimirFactura}
                className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Imprimir factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Facturacion;
