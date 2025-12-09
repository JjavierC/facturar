const { MongoClient, ObjectId } = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  let client;

  try {
    const data = JSON.parse(event.body || "{}");
    const { items, subtotal, iva, total, id_usuario } = data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "No hay productos en la venta." }),
      };
    }

    if (!MONGODB_URI) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Error: MONGODB_URI no está configurada." }),
      };
    }

    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db("facturacion");
    const ventasColl = db.collection("ventas");
    const productosColl = db.collection("productos");

    // ===========================
    // VALIDAR Y FORMATEAR ITEMS
    // ===========================
    const enrichedItems = items.map((item) => {
      const productoId =
        item.producto_id && ObjectId.isValid(item.producto_id)
          ? new ObjectId(item.producto_id)
          : null;

      return {
        producto_id: productoId,
        nombre: item.nombre,
        cantidad: Number(item.cantidad) || 0,
        precio: Number(item.precio) || 0,
        subtotal: (Number(item.cantidad) || 0) * (Number(item.precio) || 0),
      };
    });

    // ===========================
    // GUARDAR LA VENTA
    // ===========================
    const nuevaVenta = {
      items: enrichedItems,
      subtotal,
      iva,
      total,
      id_usuario,
      fecha: new Date(),
    };

    const result = await ventasColl.insertOne(nuevaVenta);

    // ===========================
    // RESTAR STOCK POR PRODUCTO
    // ===========================
    for (const item of enrichedItems) {
      if (!item.producto_id) continue;

      await productosColl.updateOne(
        { _id: item.producto_id },
        { $inc: { stock: -Math.abs(item.cantidad) } }
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Venta registrada correctamente.",
        ventaId: result.insertedId,
      }),
    };

  } catch (error) {
    console.error("Error al registrar la venta:", error);
    return { statusCode: 500, body: JSON.stringify({ message: "Error interno del servidor." }) };
  } finally {
    if (client) {
      try { await client.close(); } catch (_) {}
    }
  }
};
