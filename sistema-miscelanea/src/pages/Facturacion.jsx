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

  // --- Lógica (sin cambios) ---
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

  const subtotal = itemsVenta.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const ivaCalculado = subtotal * (ivaPorcentaje / 100);
  const total = subtotal + ivaCalculado;

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

  const handleImprimirFactura = () => { window.print(); setVentaExitosa(null); };
  // --- Fin Lógica ---


  return (
    // CAMBIO 1: Fondo gris y padding vertical general
    <div className="bg-gray-100 min-h-screen py-8 main-ui">

      {/* ========================================================== */}
      {/* CAMBIO 2: ESTE ES EL RECUADRO BLANCO CENTRADO           */}
      {/* Añadimos bg-white, rounded-lg, shadow-xl, p-6 md:p-8   */}
      {/* ========================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow-xl p-6 md:p-8">

        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Punto de Venta</h1>

        {/* --- CAMBIO 3: Sección de Búsqueda (Quitamos estilos de tarjeta) --- */}
        <section className="mb-10 relative">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Buscar y Añadir Producto</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Escanear ID o buscar por nombre..."
              className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={busqueda}
              onChange={handleBusquedaChange}
              ref={busquedaRef}
            />
            <button
              onClick={() => { /* Lógica Añadir */ }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              disabled={!busqueda}
            >
              Añadir
            </button>
          </div>

          {/* Lista de sugerencias (ajustamos left/right) */}
          {sugerencias.length > 0 && busqueda.length > 1 && (
            <ul className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg left-0 right-0">
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

        {/* --- CAMBIO 4: Resumen de la Venta (Quitamos estilos de tarjeta) --- */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Resumen de la Venta</h2>
          {/* TablaVenta ya tenía fondo blanco, lo mantenemos */}
          <TablaVenta items={itemsVenta} actualizarItem={actualizarItemEnCarrito} />

          {/* Recuadro de Totales (se mantiene como tarjeta interna) */}
          {itemsVenta.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-xl mt-4 border border-gray-200">
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

      </div> {/* Fin del recuadro blanco centrado */}

      {/* Modal de Factura (sin cambios, queda fuera del recuadro) */}
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


// --- Añadimos de nuevo las funciones para que el código sea completo ---
// (Estas funciones no cambiaron, solo se copian aquí para referencia)

const handleBusquedaChange = function (e) {
  const valor = e.target.value;
  this.setBusqueda(valor);
  if (valor.length > 1) {
    const filtered = this.productosInventario.filter(prod =>
      prod.nombre.toLowerCase().includes(valor.toLowerCase()) ||
      prod._id.toLowerCase().includes(valor.toLowerCase())
    );
    this.setSugerencias(filtered);
  } else {
    this.setSugerencias([]);
  }
};

const agregarProductoAlCarrito = function (producto) {
  this.setMensaje(null);
  this.setBusqueda('');
  this.setSugerencias([]);
  const productoEnInventario = this.productosInventario.find(p => p._id === producto._id);

  if (!productoEnInventario) {
    this.setMensaje({ type: 'error', text: 'Error: Producto no encontrado.' });
    return;
  }
  if (productoEnInventario.stock <= 0) {
    this.setMensaje({ type: 'error', text: `¡Alerta! "${producto.nombre}" está agotado.` });
    return;
  }

  this.setItemsVenta(prevItems => {
    const itemExistente = prevItems.find(item => item._id === producto._id);
    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + 1;
      if (nuevaCantidad > productoEnInventario.stock) {
        this.setMensaje({ type: 'error', text: `No hay suficiente stock de "${producto.nombre}". Stock: ${productoEnInventario.stock}` });
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
  if (this.busquedaRef.current) this.busquedaRef.current.focus();
};

const actualizarItemEnCarrito = function (idProducto, nuevaCantidad) {
  this.setMensaje(null);
  this.setItemsVenta(prevItems => {
    const productoInventario = this.productosInventario.find(p => p._id === idProducto);
    if (!productoInventario) return prevItems;

    if (nuevaCantidad <= 0) {
      return prevItems.filter(item => item._id !== idProducto);
    } else if (nuevaCantidad > productoInventario.stock) {
      this.setMensaje({ type: 'error', text: `Stock insuficiente para "${productoInventario.nombre}". Stock: ${productoInventario.stock}` });
       return prevItems.map(item =>
        item._id === idProducto ? { ...item, cantidad: productoInventario.stock } : item
      );
    } else {
      return prevItems.map(item =>
        item._id === idProducto ? { ...item, cantidad: nuevaCantidad } : item
      );
    }
  });
};

const procesarVenta = async function () {
  if (this.itemsVenta.length === 0) {
    this.setMensaje({ type: 'error', text: 'El carrito está vacío.' }); return;
  }
  this.setLoading(true); this.setMensaje(null);
  try {
    const costoTotalProductos = this.itemsVenta.reduce((sum, item) => sum + (item.costo || 0) * item.cantidad, 0);
    const totalGanancias = this.subtotal - costoTotalProductos; // Assuming subtotal is available in scope
    const ventaData = {
      fecha_venta: new Date().toISOString(),
      items: this.itemsVenta.map(item => ({
        producto_id: item._id, nombre: item.nombre, precio: item.precio,
        costo: item.costo, cantidad: item.cantidad,
      })),
      subtotal: this.subtotal, // Assuming subtotal is available in scope
      iva: this.ivaCalculado, // Assuming ivaCalculado is available in scope
      total: this.total, // Assuming total is available in scope
      total_ganancias: totalGanancias,
    };
    const res = await axios.post('/.netlify/functions/guardar-venta', ventaData);
    this.setMensaje({ type: 'success', text: `¡Venta registrada! ID: ${res.data.ventaId}` });
    this.setVentaExitosa({ ...ventaData, _id: res.data.ventaId });
    this.setItemsVenta([]); // Limpiar carrito
  } catch (err) {
    console.error('Error al procesar venta:', err.response ? err.response.data : err.message);
    this.setMensaje({ type: 'error', text: `Error al registrar venta: ${err.response?.data?.error || err.message}` });
  } finally { this.setLoading(false); }
};

const handleImprimirFactura = function () { window.print(); this.setVentaExitosa(null); };

// Bind methods if necessary, or ensure they are called correctly with 'this' context if defined outside the component
Facturacion.prototype.handleBusquedaChange = handleBusquedaChange;
Facturacion.prototype.agregarProductoAlCarrito = agregarProductoAlCarrito;
Facturacion.prototype.actualizarItemEnCarrito = actualizarItemEnCarrito;
Facturacion.prototype.procesarVenta = procesarVenta;
Facturacion.prototype.handleImprimirFactura = handleImprimirFactura;
// --- Fin funciones añadidas ---

export default Facturacion;

