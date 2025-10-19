import React from 'react';

function TablaVenta({ items, actualizarItem }) {
  if (items.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-lg shadow-md">
        <p className="text-gray-500">Agrega productos escaneando o buscando por nombre.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unit.</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item._id}>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.nombre}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">${item.precio.toFixed(2)}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                {/* Input para modificar cantidad */}
                <input
                  type="number"
                  value={item.cantidad}
                  onChange={(e) => actualizarItem(item._id, parseInt(e.target.value) || 0)}
                  min="1"
                  max={item.stock}
                  className="w-16 border rounded text-center p-1 text-sm"
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold">${(item.precio * item.cantidad).toFixed(2)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                {/* Botón para eliminar */}
                <button
                  onClick={() => actualizarItem(item._id, 0)}
                  className="text-red-600 hover:text-red-900"
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