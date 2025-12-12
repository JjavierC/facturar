const { MongoClient, ObjectId } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// ============================
// 📌 FUNCIÓN PARA ENVIAR ALERTA A TELEGRAM
// ============================
async function enviarAlertaStockBajo(nombre, stock) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram no configurado. Saltando alerta.");
    return;
  }

  const mensaje = `⚠️ *Stock Bajo*\n\nProducto: *${nombre}*\nStock restante: *${stock}* unidades`;

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: mensaje,
      parse_mode: "Markdown",
    }),
  });
}

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
        body: JSON.stringify({ message: "Error: MONGODB_URI no configurada." }),
      };
    }

    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db("miscelanea");

    const productosColl = db.collection("inventario");
    const ventasColl = db.collection("ventas");

    // ===================================================
    // 📌 ENRIQUECER ITEMS + CALCULAR GANANCIAS
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
    // 📌 GUARDAR VENTA
    // ===================================================
    const nuevaVenta = {
      items: enrichedItems,
      subtotal,
      iva,
      total,
      total_ganancias: totalGanancias,
      id_usuario,
      anulada: false,
      fecha_venta: new Date(),
    };

    const result = await ventasColl.insertOne(nuevaVenta);

    // ===================================================
    // 📌 RESTAR STOCK + ENVIAR ALERTA SI QUEDA BAJO
    // ===================================================
    for (const item of enrichedItems) {
      if (!item.producto_id) continue;

      // Restar stock
      const productoActual = await productosColl.findOne({ _id: item.producto_id });

      if (!productoActual) continue;

      const nuevoStock = (productoActual.stock || 0) - Math.abs(item.cantidad);

      await productosColl.updateOne(
        { _id: item.producto_id },
        { $set: { stock: nuevoStock } }
      );

      // Enviar alerta si el stock queda bajo
      if (nuevoStock <= 3) {
        await enviarAlertaStockBajo(item.nombre, nuevoStock);
      }
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
    console.error("Error al registrar venta:", error);
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
