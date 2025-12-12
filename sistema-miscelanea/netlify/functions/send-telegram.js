const { MongoClient } = require("mongodb");

exports.handler = async (event) => {
  try {
    const TOKEN = process.env.TELEGRAM_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    const data = JSON.parse(event.body || "{}");

    const message = data.message?.text || "";

    // === Respuestas del BOT ===
    if (message.startsWith("/start")) {
      await sendMessage(CHAT_ID, "🤖 ¡Bot conectado!\nComandos:\n/stock\n/ventas\n/ayuda");
    }

    if (message.startsWith("/ayuda")) {
      await sendMessage(
        CHAT_ID,
        "📌 *Comandos Disponibles*\n\n" +
        "/stock → Ver inventario\n" +
        "/ventas → Ventas del día\n" +
        "/ayuda → Mostrar comandos"
      );
    }

    if (message.startsWith("/stock")) {
      const stockMsg = await obtenerStock();
      await sendMessage(CHAT_ID, stockMsg);
    }

    if (message.startsWith("/ventas")) {
      const ventasMsg = await ventasHoy();
      await sendMessage(CHAT_ID, ventasMsg);
    }

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("Error telegram:", err);
    return { statusCode: 500, body: "Error" };
  }
};

// ==============================
// FUNCIONES AUXILIARES
// ==============================

// Enviar mensajes a Telegram
async function sendMessage(chatId, text) {
  const TOKEN = process.env.TELEGRAM_TOKEN;
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  });
}

// Conección Mongo
async function connectDB() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return client.db("miscelanea");
}

// Obtener inventario resumido
async function obtenerStock() {
  const db = await connectDB();
  const productos = await db.collection("inventario").find({}).toArray();

  let mensaje = "📦 *Inventario Actual*\n\n";

  productos.forEach((p) => {
    mensaje += `• ${p.nombre}: ${p.stock} unidades\n`;
  });

  return mensaje;
}

// Ventas del día
async function ventasHoy() {
  const db = await connectDB();

  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);

  const ventas = await db
    .collection("ventas")
    .find({ fecha_venta: { $gte: inicio.toISOString() } })
    .toArray();

  const total = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);

  return `📅 *Ventas de hoy*\n\nTotal: $${total.toLocaleString()}\nTransacciones: ${ventas.length}`;
}
