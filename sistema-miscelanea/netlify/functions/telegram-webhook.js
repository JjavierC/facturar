const { MongoClient } = require("mongodb");
const axios = require("axios");

const MONGODB_URI = process.env.MONGODB_URI;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// 📌 Función para enviar mensajes a Telegram
async function sendMessage(text) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: "Markdown"
    });
  } catch (err) {
    console.error("Error enviando mensaje a Telegram:", err.response?.data || err);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const update = JSON.parse(event.body || "{}");

  if (!update.message || !update.message.text) {
    return { statusCode: 200, body: "ok" };
  }

  const chatMessage = update.message.text.trim().toLowerCase();
  let client;

  try {
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db("miscelanea");

    const inventario = db.collection("inventario");
    const ventas = db.collection("ventas");

    // ======================================================
    // 1️⃣ /start — Lista los comandos
    // ======================================================
    if (chatMessage === "/start") {
      await sendMessage(
        "👋 *Bienvenido al Bot de Miscelánea La Económica*\n\n" +
        "Comandos disponibles:\n" +
        "• /ventas_hoy – Ventas del día\n" +
        "• /stock NOMBRE – Ver stock de un producto\n" +
        "• /bajo_stock – Productos con poco stock\n" +
        "• /ultima_venta – Última venta registrada"
      );
      return { statusCode: 200, body: "ok" };
    }

    // ======================================================
    // 2️⃣ /ventas_hoy
    // ======================================================
    if (chatMessage === "/ventas_hoy") {
      const inicioDia = new Date();
      inicioDia.setHours(0, 0, 0, 0);

      const ventasHoy = await ventas.find({
        fecha: { $gte: inicioDia },
        anulada: false
      }).toArray();

      const total = ventasHoy.reduce((acc, v) => acc + (v.total || 0), 0);

      await sendMessage(
        `📅 *Ventas de hoy*\n\n` +
        `🧾 Ventas realizadas: *${ventasHoy.length}*\n` +
        `💰 Total vendido: *$${total}*`
      );

      return { statusCode: 200, body: "ok" };
    }

    // ======================================================
    // 3️⃣ /stock NOMBRE
    // ======================================================
    if (chatMessage.startsWith("/stock ")) {
      const nombre = chatMessage.replace("/stock ", "").trim();

      const producto = await inventario.findOne({
        nombre: { $regex: new RegExp(nombre, "i") }
      });

      if (!producto) {
        await sendMessage(`❌ No encontré el producto *${nombre}*`);
        return { statusCode: 200, body: "ok" };
      }

      await sendMessage(
        `📦 *Stock de ${producto.nombre}*\n` +
        `📉 Stock actual: *${producto.stock}*\n` +
        `⚠ Stock mínimo: *${producto.stock_min}*`
      );

      return { statusCode: 200, body: "ok" };
    }

    // ======================================================
    // 4️⃣ /bajo_stock – FILTRA TODO EL INVENTARIO (CORREGIDO)
    // ======================================================
    if (chatMessage === "/bajo_stock") {
      const productos = await inventario.find().toArray();

      const bajos = productos.filter(
        (p) => p.stock !== undefined && p.stock <= p.stock_min
      );

      if (bajos.length === 0) {
        await sendMessage("✔ Todos los productos tienen stock suficiente.");
        return { statusCode: 200, body: "ok" };
      }

      let msg = "⚠ *Productos con stock bajo:*\n\n";

      bajos.forEach((p) => {
        msg += `• *${p.nombre}*: ${p.stock} unidades (mínimo ${p.stock_min})\n`;
      });

      await sendMessage(msg);
      return { statusCode: 200, body: "ok" };
    }

    // ======================================================
    // 5️⃣ /ultima_venta
    // ======================================================
    if (chatMessage === "/ultima_venta") {
      const ultima = await ventas.find({})
        .sort({ fecha: -1 })
        .limit(1)
        .toArray();

      if (ultima.length === 0) {
        await sendMessage("❌ No hay ventas registradas.");
        return { statusCode: 200, body: "ok" };
      }

      const venta = ultima[0];

      let msg =
        `🧾 *Última Venta*\n\n` +
        `📅 Fecha: ${venta.fecha.toLocaleString()}\n` +
        `💰 Total: *$${venta.total}*\n` +
        `📦 Productos:\n`;

      venta.items.forEach((i) => {
        msg += `• ${i.nombre} x${i.cantidad} → $${i.subtotal}\n`;
      });

      await sendMessage(msg);
      return { statusCode: 200, body: "ok" };
    }

    // ======================================================
    // ⚠️ SI EL COMANDO NO EXISTE
    // ======================================================
    await sendMessage("❓ Comando no reconocido. Usa /start para ver la lista.");

    return { statusCode: 200, body: "ok" };

  } catch (error) {
    console.error("ERROR EN WEBHOOK:", error);
    return { statusCode: 500, body: "Error interno" };
  } finally {
    if (client) await client.close();
  }
};
