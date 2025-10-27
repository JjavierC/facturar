// src/components/TablaVenta.jsx
import React from 'react';

function TablaVenta({ items, actualizarItem }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-lg shadow-md border border-gray-200">
        <p className="text-gray-500 text-lg">
          Agrega productos escaneando el código de barras o buscándolos por nombre.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-inner border border-gray-200">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="px-5 py-3 text-left font-semibold">Producto</th>
            <th className="px-5 py-3 text-center font-semibold">Stock Disp.</th>
            <th className="px-5 py-3 text-center font-semibold">Precio Unit.</th>
            <th className="px-5 py-3 text-center font-semibold">Cantidad</th>
            <th className="px-5 py-3 text-right font-semibold">Total</th>
            <th className="px-5 py-3 text-center font-semibold">Acción</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr
              key={item._id}
              className={`${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-indigo-50 transition-colors duration-200`}
            >
              <td className="px-5 py-3 font-medium text-gray-900">{item.nombre}</td>
              <td className="px-5 py-3 text-center">{item.stock}</td>
              <td className="px-5 py-3 text-center">
                ${item.precio.toLocaleString()}
              </td>
              <td className="px-5 py-3 text-center">
                <input
                  type="number"
                  value={item.cantidad}
                  onChange={(e) =>
                    actualizarItem(item._id, parseInt(e.target.value) || 0)
                  }
                  min="1"
                  max={item.stock}
                  className="w-20 border border-gray-300 rounded-md text-center p-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </td>
              <td className="px-5 py-3 text-right font-semibold text-gray-900">
                ${(item.precio * item.cantidad).toLocaleString()}
              </td>
              <td className="px-5 py-3 text-center">
                <button
                  onClick={() => actualizarItem(item._id, 0)}
                  className="text-red-500 hover:text-red-700 font-bold text-lg"
                  title="Eliminar producto"
                >
                  ×
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
