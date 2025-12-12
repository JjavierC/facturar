const axios = require("axios");
const { MongoClient } = require("mongodb");

exports.handler = async (event) => {
  const TOKEN = process.env.TELEGRAM_TOKEN;
  
  const update = JSON.parse(event.body || "{}");
  const message = update.message?.text;
  const chat = update.message?.chat.id;

  // Asegurar que solo tú uses el bot
  const OWNER = Number(process.env.TELEGRAM_CHAT_ID);
  if (chat !== OWNER) {
    return { statusCode: 200, body: "no autorizado" };
  }

  if (!message) return { statusCode: 200 };

  const dbClient = new MongoClient(process.env.MONGODB_URI);
  await dbClient.connect();
  const db = dbClient.db("miscelanea");

  // ======== COMANDO: /start ========
  if (message === "/start") {
    await send(chat, 
      "🤖 *Bienvenido a tu sistema MISCEBOT*\n\n" +
      "Comandos disponibles:\n" +
      "/stock — Ver productos con stock bajo\n" +
      "/ventas_hoy — Ver total de ventas de hoy\n" +
      "/ventas — Total de ventas general\n"
    );
  }

  // ======== COMANDO: /stock ========
  if (message === "/stock") {
    const low = await db.collection("inventario")
      .find({ stock: { $lt: 5 } })
      .toArray();

    if (!low.length) {
      await send(chat, "📦 Todo el stock está en buen nivel.");
    } else {
      await send(chat,
        "⚠️ *Productos con stock bajo:*\n\n" +
        low.map(p => `• ${p.nombre}: ${p.stock}`).join("\n")
      );
    }
  }

  // ======== COMANDO: /ventas_hoy ========
  if (message === "/ventas_hoy") {
    const hoy = new Date().toISOString().slice(0, 10);

    const ventas = await db.collection("ventas").find().toArray();

    const filtradas = ventas.filter((v) => {
      const fecha = new Date(v.fecha).toISOString().slice(0, 10);
      return fecha === hoy;
    });

    const total = filtradas.reduce((t, v) => t + Number(v.total), 0);

    await send(chat,
      `📅 *Ventas de hoy*\n\n` +
      `Cantidad: ${filtradas.length}\n` +
      `Total: $${total.toLocaleString()}`
    );
  }

  // ======== COMANDO: /ventas ========
  if (message === "/ventas") {
    const ventas = await db.collection("ventas").find().toArray();
    const total = ventas.reduce((t, v) => t + Number(v.total), 0);

    await send(chat,
      `📊 *Ventas Totales*\n\n` +
      `Número de ventas: ${ventas.length}\n` +
      `Ingresos: $${total.toLocaleString()}`
    );
  }

  return { statusCode: 200, body: "ok" };
};

// Función de envío
async function send(chat, text) {
  const TOKEN = process.env.TELEGRAM_TOKEN;
  await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    chat_id: chat,
    text,
    parse_mode: "Markdown"
  });
}
