const { MongoClient, ObjectId } = require("mongodb");
const axios = require("axios");

const MONGODB_URI = process.env.MONGODB_URI;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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

    const db = client.db("miscelanea");
    const productosColl = db.collection("inventario");
    const ventasColl = db.collection("ventas");

    // ===================================================
    // ENRIQUECER ITEMS + CALCULAR GANANCIAS
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
    // GUARDAR VENTA
    // ===================================================
    const nuevaVenta = {
      items: enrichedItems,
      subtotal,
      iva,
      total,
      total_ganancias: totalGanancias,
      id_usuario,
      anulada: false,
      fecha: new Date(),
    };

    const result = await ventasColl.insertOne(nuevaVenta);

    // ===================================================
    // FUNCIÓN PARA ENVIAR ALERTA DE STOCK BAJO
    // ===================================================
    async function enviarAlertaStockBajo(producto) {
      if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;

      const mensaje =
        `⚠ *ALERTA DE STOCK BAJO*\n\n` +
        `📦 *Producto:* ${producto.nombre}\n` +
        `📉 *Stock Actual:* ${producto.stock}\n` +
        `📛 *ID:* ${producto._id}`;

      try {
        await axios.post(
          `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
          {
            chat_id: TELEGRAM_CHAT_ID,
            text: mensaje,
            parse_mode: "Markdown",
          }
        );
      } catch (err) {
        console.error("Error enviando alerta Telegram:", err);
      }
    }

    // ===================================================
    // RESTAR STOCK + NOTIFICAR POR CADA PRODUCTO BAJO DE STOCK
    // ===================================================
    for (const item of enrichedItems) {
      if (!item.producto_id) continue;

      const productoDB = await productosColl.findOne({
        _id: item.producto_id,
      });

      if (!productoDB) continue;

      const nuevoStock = productoDB.stock - Math.abs(item.cantidad);

      // Actualizar stock en la base
      await productosColl.updateOne(
        { _id: item.producto_id },
        { $set: { stock: nuevoStock } }
      );

      // Si está por debajo del mínimo → notificar
      const stockMinimo = productoDB.stock_min || 5; // valor por defecto
      if (nuevoStock <= stockMinimo) {
        await enviarAlertaStockBajo({
          ...productoDB,
          stock: nuevoStock,
        });
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
