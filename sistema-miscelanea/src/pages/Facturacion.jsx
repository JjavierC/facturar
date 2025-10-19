import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TablaVenta from '../components/TablaVenta'; // Importar la tabla de carrito

function Facturacion() {
  const [productosInventario, setProductosInventario] = useState([]);
  const [itemsVenta, setItemsVenta] = useState([]);
  const [skuBusqueda, setSkuBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeVenta, setMensajeVenta] = useState(null);

  // --- Lógica de Carga de Inventario (Función get-productos.js) ---
  const cargarInventario = () => {
    setLoading(true);
    axios.get('/.netlify/functions/get-productos')
      .then(res => {
        setProductosInventario(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar inventario:', err);
        setError('No se pudo cargar el inventario. Revise la API.');
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarInventario();
  }, []); // Carga el inventario al iniciar la página

  // --- Lógica de Cálculo de Totales ---
  const subtotal = itemsVenta.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const ivaRate = 0.19; // IVA en Colombia
  const iva = subtotal * ivaRate; 
  const total = subtotal + iva;

  // --- Lógica para Agregar Producto a la Venta ---
  const agregarProducto = () => {
    if (!skuBusqueda) return;

    // Buscar el producto en el inventario
    const producto = productosInventario.find(p => 
      p.nombre.toLowerCase().includes(skuBusqueda.toLowerCase()) // Búsqueda por nombre
    );

    if (!producto) {
      setMensajeVenta({ type: 'error', text: 'Producto no encontrado.' });
      setSkuBusqueda('');
      return;
    }
    
    // Si ya está en la venta, incrementa la cantidad
    const itemExistente = itemsVenta.find(item => item._id === producto._id);
    if (itemExistente) {
      if (itemExistente.cantidad >= producto.stock) {
        setMensajeVenta({ type: 'error', text: `Stock insuficiente para ${producto.nombre}.` });
        return;
      }
      setItemsVenta(itemsVenta.map(item => 
        item._id === producto._id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      // Si es nuevo, agrégalo
      setItemsVenta([...itemsVenta, { ...producto, cantidad: 1 }]);
    }

    setSkuBusqueda('');
    setMensajeVenta(null);
  };

  // Lógica para manejar cambios en la cantidad o eliminar ítems
  const actualizarItemVenta = (id, nuevaCantidad) => {
    const productoInventario = productosInventario.find(p => p._id === id);

    if (nuevaCantidad <= 0) {
      // Eliminar si la cantidad es 0 o menos
      setItemsVenta(itemsVenta.filter(item => item._id !== id));
      setMensajeVenta(null);
    } else if (nuevaCantidad > productoInventario.stock) {
        setMensajeVenta({ type: 'error', text: `Cantidad excede el stock disponible de ${productoInventario.nombre}.` });
        return;
    } else {
      // Actualizar cantidad
      setItemsVenta(itemsVenta.map(item => 
        item._id === id ? { ...item, cantidad: nuevaCantidad } : item
      ));
      setMensajeVenta(null);
    }
  };

  // --- Lógica de Procesamiento y Guardado de la Venta (guardar-venta.js) ---
  const procesarVenta = async () => {
    if (itemsVenta.length === 0) {
      setMensajeVenta({ type: 'error', text: 'Agrega al menos un producto para facturar.' });
      return;
    }

    setMensajeVenta({ type: 'info', text: 'Procesando venta...' });
    
    const ventaData = {
        items: itemsVenta,
        subtotal: subtotal,
        iva: iva,
        total: total,
    };

    try {
        // 1. Llama a la Netlify Function para guardar la venta y descontar inventario
        const response = await axios.post('/.netlify/functions/guardar-venta', ventaData);

        // 2. Éxito: Mostrar mensaje, resetear, recargar inventario y simular impresión
        setMensajeVenta({ 
            type: 'success', 
            text: `Venta #${response.data.ventaId.substring(0, 8)} registrada. Inventario actualizado.` 
        });
        
        // 3. Simular Impresión (usando el Media Query de CSS)
        setTimeout(() => {
          window.print(); 
        }, 500);

        // 4. Resetear la venta
        setItemsVenta([]);
        
        // 5. Recargar el inventario (para mostrar el stock actualizado)
        cargarInventario(); 

    } catch (error) {
        console.error('Error al procesar venta:', error.response ? error.response.data : error.message);
        setMensajeVenta({ 
            type: 'error', 
            text: 'ERROR al registrar la venta. Revise conexión a DB.' 
        });
    }
  };
  
  // --- UI/RENDER ---
  if (loading) return <div className="text-center p-8">Cargando TPV...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Columna de Búsqueda y Carrito */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">Punto de Venta (POS)</h1>
        
        {/* Input de Búsqueda/Escaneo */}
        <div className="flex space-x-2 p-4 bg-white rounded-lg shadow-md">
          <input
            type="text"
            placeholder="Buscar producto por nombre o escanear ID"
            value={skuBusqueda}
            onChange={(e) => setSkuBusqueda(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && agregarProducto()}
            className="flex-grow rounded-md border-2 border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            onClick={agregarProducto}
            className="bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700"
          >
            Añadir
          </button>
        </div>

        {/* Mensaje de Feedback */}
        {mensajeVenta && (
          <div 
            className={`p-3 rounded-md ${mensajeVenta.type === 'success' ? 'bg-green-100 text-green-700' : mensajeVenta.type === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}
          >
            {mensajeVenta.text}
          </div>
        )}

        {/* Tabla de Productos Seleccionados */}
        <TablaVenta items={itemsVenta} actualizarItem={actualizarItemVenta} />
      </div>

      {/* Columna de Totales y Pago */}
      <div className="bg-white p-6 rounded-lg shadow-xl h-fit lg:sticky lg:top-4">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Resumen de la Venta</h2>
        
        <div className="space-y-3 text-lg">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>IVA (19%):</span>
            <span>${iva.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-2xl border-t pt-3">
            <span>TOTAL:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={procesarVenta}
          className="mt-8 w-full bg-green-600 text-white text-xl py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          disabled={itemsVenta.length === 0}
        >
          Procesar Venta y Facturar
        </button>
      </div>

    </div>
  );
}

export default Facturacion;