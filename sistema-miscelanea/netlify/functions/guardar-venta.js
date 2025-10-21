// netlify/functions/guardar-venta.js
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
      return { statusCode: 400, body: JSON.stringify({ message: "No hay productos en la venta." }) };
    }

    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    const db = client.db("miscelanea");

    // Enriquecemos cada item: aseguramos precio y costo y calculamos ganancia_item
    const productosColl = db.collection("inventario");

    const enrichedItems = await Promise.all(items.map(async (it) => {
      // Se espera que it tenga al menos: _id (string o ObjectId) o nombre, cantidad, precio (snapshot).
      let productFromDB = null;
      let prodId = null;
      if (it._id) {
        try { prodId = typeof it._id === "string" ? ObjectId(it._id) : it._id; }
        catch(e) { prodId = null; }
        if (prodId) {
          productFromDB = await productosColl.findOne({ _id: prodId });
        }
      }

      const precio = Number(it.precio != null ? it.precio : (productFromDB?.precio ?? 0));
      const costo = Number(productFromDB?.costo ?? (it.costo != null ? it.costo : 0));
      const cantidad = Number(it.cantidad ?? 1);
      const ganancia_item = (precio - costo) * cantidad;

      return {
        producto_id: productFromDB?._id ?? null,
        nombre: it.nombre ?? productFromDB?.nombre ?? "",
        precio,
        costo,
        cantidad,
        ganancia_item,
      };
    }));

    // Suma total de ganancias para la venta
    const total_ganancias = enrichedItems.reduce((acc, it) => acc + (Number(it.ganancia_item) || 0), 0);

    const nuevaVenta = {
      id_usuario: id_usuario ? (ObjectId.isValid(id_usuario) ? ObjectId(id_usuario) : id_usuario) : null,
      items: enrichedItems,
      subtotal: Number(subtotal) || 0,
      iva: Number(iva) || 0,
      total: Number(total) || 0,
      total_ganancias,
      fecha_venta: new Date(),
    };

    const result = await db.collection("ventas").insertOne(nuevaVenta);

    // Reducir stock por cada item que tenga producto_id
    const stockOps = enrichedItems
      .filter(i => i.producto_id)
      .map(i => productosColl.updateOne({ _id: i.producto_id }, { $inc: { stock: -Math.abs(i.cantidad) } }));

    if (stockOps.length) {
      await Promise.all(stockOps);
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
