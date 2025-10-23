// src/components/FacturaImprimible.jsx
import React from 'react';

function FacturaImprimible({ venta, ivaPorcentaje }) {
  if (!venta) {
    return <p className="text-center text-gray-500">No hay datos de venta para mostrar.</p>;
  }

  return (
    <div className="factura-print-container p-6 border border-gray-300 rounded-lg bg-white shadow-sm">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">FACTURA DE VENTA</h1>
      
      <div className="mb-6 border-b pb-4">
        <p className="text-sm text-gray-600"><strong>Fecha:</strong> {new Date(venta.fecha_venta).toLocaleString()}</p>
        <p className="text-sm text-gray-600"><strong>ID de Venta:</strong> {venta._id}</p>
        {/* Aquí podrías añadir info del cliente si la tuvieras */}
        <p className="text-sm text-gray-600"><strong>Vendedor:</strong> Cajero (ejemplo)</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">Detalle de Productos:</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cant.</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">P. Unit.</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {venta.items.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-2 text-sm text-gray-900">{item.nombre}</td>
                <td className="px-4 py-2 text-center text-sm text-gray-500">{item.cantidad}</td>
                <td className="px-4 py-2 text-right text-sm text-gray-500">${item.precio.toLocaleString()}</td>
                <td className="px-4 py-2 text-right text-sm text-gray-900 font-medium">${(item.precio * item.cantidad).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between mb-2">
          <span className="text-base text-gray-700">Subtotal:</span>
          <span className="text-base text-gray-800">${venta.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-base text-gray-700">IVA ({ivaPorcentaje || 0}%):</span>
          <span className="text-base text-gray-800">${venta.iva.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
          <span className="text-gray-800">TOTAL A PAGAR:</span>
          <span className="text-indigo-600">${venta.total.toLocaleString()}</span>
        </div>
        {venta.total_ganancias !== undefined && (
          <div className="flex justify-between text-sm text-gray-500 italic mt-2">
            <span>Ganancia Bruta:</span>
            <span>${venta.total_ganancias.toLocaleString()}</span>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-500 mt-6">¡Gracias por su compra!</p>
    </div>
  );
}

export default FacturaImprimible;