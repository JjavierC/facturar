const axios = require("axios");
const { MongoClient } = require("mongodb");

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const MONGO_URI = process.env.MONGODB_URI;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Body inválido" };
  }

  const message = body.message?.text?.trim() || "";
  const sender = body.message?.from?.id;

  if (!sender) {
    return { statusCode: 200, body: "No message" };
  }

  // ===============================
  // 📌 FUNCIÓN PARA ENVIAR MENSAJES
  // ===============================
  async function send(text) {
    await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text,
      parse_mode: "Markdown",
    });
  }

  // ===============================
  // 📌 CONECTAR A MONGO
  // ===============================
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("miscelanea");
  const inventario = db.collection("inventario");
  const ventas = db.collection("ventas");

  // ===============================
  // 📌 COMANDO: VER STOCK
  // ===============================
  if (message === "/stock") {
    const productos = await inventario.find().toArray();

    let msg = "📦 *Stock actual:*\n\n";
    productos.forEach((p) => {
      msg += `• *${p.nombre}*: ${p.stock}\n`;
    });

    await send(msg);
    await client.close();
    return { statusCode: 200, body: "OK" };
  }

  // ===============================
  // 📌 COMANDO: VENTAS DEL DÍA
  // ===============================
  if (message === "/ventas_hoy") {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date();
    fin.setHours(23, 59, 59, 999);

    const ventasHoy = await ventas
      .find({ fecha: { $gte: inicio, $lte: fin }, anulada: false })
      .toArray();

    const total = ventasHoy.reduce((acc, v) => acc + v.total, 0);

    let msg =
      `📅 *Ventas del día:*\n\n` +
      `🧾 Número de ventas: *${ventasHoy.length}*\n` +
      `💰 Total vendido: *$${total}*\n`;

    await send(msg);
    await client.close();
    return { statusCode: 200, body: "OK" };
  }

  // ===============================
  // 📌 COMANDO: ÚLTIMA VENTA
  // ===============================
  if (message === "/ultima_venta") {
    const venta = await ventas.findOne({ anulada: false }, { sort: { fecha: -1 } });

    if (!venta) {
      await send("No hay ventas registradas.");
      await client.close();
      return {};
    }

    // Ajustar fecha a zona horaria de Colombia
    const fechaLocal = venta.fecha.toLocaleString("es-CO", {
      timeZone: "America/Bogota",
    });

    let msg =
      `🧾 *Última Venta*\n\n` +
      `📅 Fecha: *${fechaLocal}*\n` +
      `💰 Total: *$${venta.total}*\n\n` +
      `📦 *Productos:*\n`;

    venta.items.forEach((i) => {
      msg += `• ${i.nombre}: ${i.cantidad}u\n`;
    });

    await send(msg);
    await client.close();
    return { statusCode: 200, body: "OK" };
  }

  // ================================================================
  // 📌 NOTIFICACIÓN AUTOMÁTICA: ALGO ACTUALIZÓ EL INVENTARIO O HUBO VENTA
  //    (Netlify enviará JSON con la venta y aquí revisamos el stock)
  // ================================================================
  if (body.event === "venta_realizada") {
    const items = body.items || [];
    const productos = await inventario.find().toArray();

    let alerta = "⚠️ *ALERTA DE BAJO STOCK*\n\n";
    let hayAlertas = false;

    for (const item of items) {
      const prod = productos.find((p) => p._id.toString() === item.producto_id);
      if (!prod) continue;

      if (prod.stock <= 5) {
        alerta += `• *${prod.nombre}*: quedan *${prod.stock}* unidades\n`;
        hayAlertas = true;
      }
    }

    if (hayAlertas) {
      await send(alerta);
    }

    await client.close();
    return { statusCode: 200, body: "OK" };
  }

  // ===============================
  // 📌 RESPUESTA DEFAULT
  // ===============================
  await send(
    "🤖 Comandos disponibles:\n\n" +
      "• /stock – Ver stock completo\n" +
      "• /ventas_hoy – Total vendido hoy\n" +
      "• /ultima_venta – Última venta realizada"
  );

  await client.close();
  return { statusCode: 200, body: "OK" };
};
