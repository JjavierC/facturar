// src/components/TablaVenta.jsx
import React from 'react';


function TablaVenta({ items, actualizarItem }) {
  
  if (items.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-lg shadow-md">
        <p className="text-gray-500 text-lg">
          Agrega productos escaneando el código de barras o buscándolos por nombre.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock Disp.
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Precio Unit.
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cantidad
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item._id}>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.nombre}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {item.stock} {/* Muestra el stock disponible */}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                ${item.precio.toLocaleString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <input
                  type="number"
                  value={item.cantidad}
                  onChange={(e) =>
                    actualizarItem(item._id, parseInt(e.target.value) || 0)
                  }
                  min="1"
                  max={item.stock} // Límite de stock
                  className="w-20 border rounded text-center p-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                ${(item.precio * item.cantidad).toLocaleString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => actualizarItem(item._id, 0)} // Eliminar enviando 0
                  className="text-red-600 hover:text-red-900"
                  title="Eliminar producto"
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaVenta;