import React, { useState, useEffect } from "react";
import FacturaImprimible from "./FacturaImprimible";

const Facturacion = () => {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [carrito, setCarrito] = useState([]);
  const [ivaPorcentaje, setIvaPorcentaje] = useState(19);
  const [ventaExitosa, setVentaExitosa] = useState(null);

  useEffect(() => {
    const productosGuardados = JSON.parse(localStorage.getItem("productos")) || [];
    setProductos(productosGuardados);
  }, []);

  const agregarAlCarrito = () => {
    if (!productoSeleccionado) return;

    const producto = productos.find((p) => p.nombre === productoSeleccionado);
    if (!producto) return;

    const itemExistente = carrito.find((item) => item.nombre === producto.nombre);
    let nuevoCarrito;

    if (itemExistente) {
      nuevoCarrito = carrito.map((item) =>
        item.nombre === producto.nombre
          ? { ...item, cantidad: item.cantidad + cantidad }
          : item
      );
    } else {
      nuevoCarrito = [...carrito, { ...producto, cantidad }];
    }

    setCarrito(nuevoCarrito);
    setProductoSeleccionado("");
    setCantidad(1);
  };

  const eliminarDelCarrito = (nombre) => {
    const nuevoCarrito = carrito.filter((item) => item.nombre !== nombre);
    setCarrito(nuevoCarrito);
  };

  const calcularSubtotal = () =>
    carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);

  const calcularIVA = () => (calcularSubtotal() * ivaPorcentaje) / 100;
  const calcularTotal = () => calcularSubtotal() + calcularIVA();

  const registrarVenta = () => {
    if (carrito.length === 0) return alert("El carrito está vacío.");

    const nuevaVenta = {
      _id: Date.now().toString(),
      items: carrito,
      subtotal: calcularSubtotal(),
      iva: calcularIVA(),
      total: calcularTotal(),
      total_ganancias: carrito.reduce(
        (total, item) =>
          total + (item.precio - item.costo) * item.cantidad,
        0
      ),
      fecha_venta: new Date().toISOString(),
    };

    const ventasGuardadas = JSON.parse(localStorage.getItem("ventas")) || [];
    localStorage.setItem(
      "ventas",
      JSON.stringify([...ventasGuardadas, nuevaVenta])
    );

    setVentaExitosa(nuevaVenta);
    setCarrito([]);
  };

  const handleImprimirFactura = () => {
    window.print();
  };

  return (
    <>
      {/* Contenido principal de la interfaz */}
      <div className="p-4 md:p-8 bg-gray-100 min-h-screen no-print">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Sistema de Facturación
        </h1>

        {/* Selección de producto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <select
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
            className="border rounded-md p-2 w-full"
          >
            <option value="">Seleccionar producto</option>
            {productos.map((producto) => (
              <option key={producto.nombre} value={producto.nombre}>
                {producto.nombre} - ${producto.precio}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value))}
            className="border rounded-md p-2 w-full"
          />

          <button
            onClick={agregarAlCarrito}
            className="bg-green-600 text-white rounded-md px-4 py-2 hover:bg-green-700"
          >
            Agregar al carrito
          </button>
        </div>

        {/* Carrito */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-bold mb-3 text-gray-700">Carrito</h2>
          {carrito.length === 0 ? (
            <p className="text-gray-500">No hay productos en el carrito.</p>
          ) : (
            <table className="w-full border">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-2 text-left">Producto</th>
                  <th className="p-2 text-center">Cantidad</th>
                  <th className="p-2 text-center">Precio</th>
                  <th className="p-2 text-center">Subtotal</th>
                  <th className="p-2 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {carrito.map((item) => (
                  <tr key={item.nombre} className="border-t text-gray-700">
                    <td className="p-2">{item.nombre}</td>
                    <td className="p-2 text-center">{item.cantidad}</td>
                    <td className="p-2 text-center">${item.precio}</td>
                    <td className="p-2 text-center">
                      ${item.precio * item.cantidad}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => eliminarDelCarrito(item.nombre)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Totales */}
        <div className="mt-6 bg-white shadow-md rounded-lg p-4 text-right text-gray-700">
          <p>Subtotal: ${calcularSubtotal()}</p>
          <p>IVA ({ivaPorcentaje}%): ${calcularIVA()}</p>
          <p className="font-bold text-lg">Total: ${calcularTotal()}</p>

          <button
            onClick={registrarVenta}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Registrar Venta
          </button>
        </div>
      </div>

      {/* Modal de factura (fuera del área no imprimible) */}
      {ventaExitosa && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 print-modal-wrapper">
          <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative factura-print-container">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 modal-buttons">
              Factura Generada
            </h2>
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
    </>
  );
};

export default Facturacion;
