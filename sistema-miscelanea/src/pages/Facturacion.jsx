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
  const [expanded, setExpanded] = useState(false);

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
        (prod.codigo && prod.codigo.toString().includes(valor))
      );
      setSugerencias(filtered.slice(0, 10));
    } else {
      setSugerencias([]);
    }
  }, [productosInventario]);

  const agregarProductoAlCarrito = (producto) => {
    const existe = itemsVenta.find(item => item._id === producto._id);
    if (existe) {
      setItemsVenta(prev => prev.map(i => i._id === producto._id ? { ...i, cantidad: i.cantidad + 1 } : i));
    } else {
      setItemsVenta(prev => [...prev, { ...producto, cantidad: 1 }]);
    }
    setBusqueda('');
    setSugerencias([]);
    busquedaRef.current?.focus();
  };

  // 3. Actualizar cantidades desde TablaVenta
  const actualizarItemEnCarrito = (id, cambios) => {
    setItemsVenta(prev => prev.map(it => it._id === id ? { ...it, ...cambios } : it));
  };

  // 4. Eliminar item
  const eliminarItem = (id) => {
    setItemsVenta(prev => prev.filter(i => i._id !== id));
  };

  // 5. Cálculos
  const subtotal = itemsVenta.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const ivaCalculado = subtotal * (ivaPorcentaje / 100);
  const total = subtotal + ivaCalculado;

  // 6. Procesar Venta
  const procesarVenta = async () => {
    if (itemsVenta.length === 0) {
      setMensaje({ type: 'error', text: 'El carrito está vacío.' }); return;
    }
    setLoading(true);
    try {
      const payload = {
        items: itemsVenta,
        subtotal,
        iva: ivaCalculado,
        total,
        fecha: new Date().toISOString()
      };
      const res = await axios.post('/.netlify/functions/procesar-venta', payload);
      setVentaExitosa(res.data);
      setItemsVenta([]);
      setMensaje({ type: 'success', text: 'Venta registrada correctamente.' });
    } catch (err) {
      console.error("Error procesando venta:", err);
      setMensaje({ type: 'error', text: 'Error al procesar la venta.' });
    } finally {
      setLoading(false);
    }
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

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Punto de Venta</h1>
          {/* Toggle para expandir/contraer el área de trabajo (no se imprime) */}
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="no-print px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
          >
            {expanded ? 'Contraer' : 'Expandir'}
          </button>
        </div>

        {/* Wrapping visual: limita ancho en pantalla (no afecta impresión) */}
        <div className={expanded ? "w-full" : "factura-card"}>

          {/* Sección de Búsqueda (ya estaba centrada, pero ahora dentro del contenedor principal) */}
          <section className="bg-white p-6 rounded-lg shadow-xl mb-10 max-w-4xl mx-auto relative">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Buscar y Añadir Producto</h2>
            <div className="flex gap-2">
              <input
                ref={busquedaRef}
                value={busqueda}
                onChange={handleBusquedaChange}
                placeholder="Código o nombre del producto..."
                className="flex-1 p-3 border rounded-md"
              />
              <button
                onClick={() => {
                  if (sugerencias.length > 0) agregarProductoAlCarrito(sugerencias[0]);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                disabled={!busqueda}
              >
                Añadir
              </button>
            </div>

            {/* Lista de sugerencias */}
            {sugerencias.length > 0 && busqueda.length > 1 && (
              <ul className="absolute z-10 bg-white border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg left-6 right-6">
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
          <section className="max-w-4xl mx-auto mb-10">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Resumen de la Venta</h2>
            <TablaVenta items={itemsVenta} actualizarItem={actualizarItemEnCarrito} eliminarItem={eliminarItem} />

            {/* Recuadro de Totales */}
            {itemsVenta.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-xl mt-4">
                <div className="flex justify-between text-lg mb-2">
                  <span>Subtotal:</span>
                  <span>${subtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-lg mb-2">
                  <span>IVA ({ivaPorcentaje}%):</span>
                  <span>${ivaCalculado.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-xl font-bold mt-2">
                  <span>Total:</span>
                  <span>${total.toLocaleString('es-CO')}</span>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={procesarVenta}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Procesando...' : 'Procesar Venta'}
                  </button>

                  <button
                    onClick={() => setItemsVenta([])}
                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Vaciar Carrito
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Componente de impresión (NO TOCAR) */}
          <FacturaImprimible venta={ventaExitosa} ivaPorcentaje={ivaPorcentaje} />
        </div>

      </div>
    </div> // Fin del div de fondo gris
  );
}

export default Facturacion;
