import React from 'react';
import axios from 'axios'; // 👈 nuevo import

function TablaVenta({ items, actualizarItem }) {

  // ⚙️ Nueva función para enviar la venta al backend
  const enviarVenta = async () => {
    if (items.length === 0) {
      alert("No hay productos para registrar una venta.");
      return;
    }

    try {
      // 🧾 Crear estructura que espera guardar-venta.js
      const payloadItems = items.map((item) => ({
        _id: item._id || item.id || null,
        nombre: item.nombre || "",
        precio: Number(item.precio),
        cantidad: Number(item.cantidad),
        costo: Number(item.costo || 0)
      }));

      const subtotal = payloadItems.reduce(
        (sum, i) => sum + i.precio * i.cantidad,
        0
      );
      const iva = Math.round(subtotal * 0.19); // 19% IVA, ajusta si no aplica
      const total = subtotal + iva;

      const payload = {
        items: payloadItems,
        subtotal,
        iva,
        total,
        id_usuario: null, // puedes agregar un ID si tienes login
      };

      console.log("📦 Enviando venta:", payload);

      // 🚀 Llamada a tu función de Netlify
      const res = await axios.post("/.netlify/functions/guardar-venta", payload);

      alert("✅ Venta registrada con éxito.\nID: " + res.data.ventaId);

    } catch (error) {
      console.error("❌ Error al registrar venta:", error);
      alert("Error al registrar la venta. Revisa la consola para más detalles.");
    }
  };

  // 🧱 Si no hay productos, mostrar mensaje
  if (items.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-lg shadow-md">
        <p className="text-gray-500">
          Agrega productos escaneando o buscando por nombre.
        </p>
      </div>
    );
  }

  // 🧾 Tabla de productos + botón para registrar venta
  return (
    <div className="bg-white p-6 rounded-lg shadow-xl overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Precio Unit.
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cantidad
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item._id}>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.nombre}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                ${item.precio.toFixed(2)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <input
                  type="number"
                  value={item.cantidad}
                  onChange={(e) =>
                    actualizarItem(item._id, parseInt(e.target.value) || 0)
                  }
                  min="1"
                  max={item.stock}
                  className="w-16 border rounded text-center p-1 text-sm"
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold">
                ${(item.precio * item.cantidad).toFixed(2)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
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

      {/* 🟢 Botón para registrar venta */}
      <div className="text-right mt-6">
        <button
          onClick={enviarVenta}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition-colors"
        >
          Registrar venta
        </button>
      </div>
    </div>
  );
}

export default TablaVenta;
