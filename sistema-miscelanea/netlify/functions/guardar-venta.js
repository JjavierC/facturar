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
        body: JSON.stringify({
          message: "Error: MONGODB_URI no está configurada.",
        }),
      };
    }

    client = await MongoClient.connect(MONGODB_URI);

    // ✅ MISMA BD Y COLECCIONES (NO SE TOCA)
    const db = client.db("miscelanea");
    const productosColl = db.collection("inventario");
    const ventasColl = db.collection("ventas");

    // ===================================================
    // ✅ ENRIQUECER ITEMS + CALCULAR GANANCIAS
    // ===================================================
    let totalGanancias = 0;

    const enrichedItems = items.map((item) => {
      const productoId = ObjectId.isValid(item.producto_id)
        ? new ObjectId(item.producto_id)
        : item.producto_id;

      const cantidad = Number(item.cantidad) || 0;
      const precio = Number(item.precio) || 0;
      const costo = Number(item.costo) || 0;

      const gananciaUnit = precio - costo;
      const gananciaTotal = gananciaUnit * cantidad;

      totalGanancias += gananciaTotal;

      return {
        producto_id: productoId,
        nombre: item.nombre,
        cantidad,
        precio,
        costo,
        subtotal: cantidad * precio,
        ganancia_unitaria: gananciaUnit,
        ganancia_total: gananciaTotal,
      };
    });

    // ===================================================
    // ✅ GUARDAR VENTA CON GANANCIAS
    // ===================================================
    const nuevaVenta = {
      items: enrichedItems,
      subtotal,
      iva,
      total,
      total_ganancias: totalGanancias, // ✅ CLAVE
      id_usuario,
      anulada: false,                   // ✅ futuro (anular venta)
      fecha: new Date(),
    };

    const result = await ventasColl.insertOne(nuevaVenta);

    // ===================================================
    // ✅ RESTAR STOCK (IGUAL QUE ANTES)
    // ===================================================
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
        total_ganancias: totalGanancias,
      }),
    };
  } catch (error) {
    console.error("Error al registrar la venta:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error interno del servidor.",
        error: error.toString(),
      }),
    };
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (_) {}
    }
  }
};
