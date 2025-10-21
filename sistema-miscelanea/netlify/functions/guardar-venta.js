// netlify/functions/guardar-venta.js
const { MongoClient } = require("mongodb");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

const client = new MongoClient(process.env.MONGODB_URI);
  try {
    const data = JSON.parse(event.body);
    const { items, subtotal, iva, total } = data;

    if (!items || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "No hay productos en la venta." }),
      };
    }

    await client.connect();
    const db = client.db("facturacion");

    // Crear documento de venta
    const nuevaVenta = {
      items,
      subtotal: Number(subtotal) || 0,
      iva: Number(iva) || 0,
      total: Number(total) || 0,
      fecha_venta: new Date(),
    };

    // Guardar la venta
    const result = await db.collection("ventas").insertOne(nuevaVenta);

    // Actualizar el stock de cada producto vendido
    const operacionesStock = items.map((item) =>
      db.collection("productos").updateOne(
        { _id: item._id },
        { $inc: { stock: -item.cantidad } }
      )
    );
    await Promise.all(operacionesStock);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Venta registrada correctamente.",
        ventaId: result.insertedId,
      }),
    };
  } catch (error) {
    console.error("Error al registrar la venta:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno del servidor." }),
    };
  } finally {
    await client.close();
  }
};
