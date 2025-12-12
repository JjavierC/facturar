const axios = require("axios");

exports.handler = async (event) => {
  try {
    console.log("Webhook recibido:", event.body);

    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_TOKEN || !CHAT_ID) {
      console.error("Faltan variables de Telegram");
      return { statusCode: 500, body: "Missing env vars" };
    }

    const data = JSON.parse(event.body);

    // Si Telegram no envía "message", devolvemos OK igual
    if (!data.message) {
      return { statusCode: 200, body: "OK" };
    }

    const msg = data.message;
    const text = msg.text || "";

    // Comandos básicos
    if (text === "/hola") {
      await enviarMensaje(CHAT_ID, "Hola! El bot está activo ✔️", TELEGRAM_TOKEN);
    }

    if (text === "/status") {
      await enviarMensaje(CHAT_ID, "Sistema funcionando correctamente ⚙️", TELEGRAM_TOKEN);
    }

    return { statusCode: 200, body: "OK" };

  } catch (error) {
    console.error("Error en telegram-webhook:", error);
    return { statusCode: 500, body: "Internal error" };
  }
};

async function enviarMensaje(chatId, text, token) {
  const URL = `https://api.telegram.org/bot${token}/sendMessage`;

  await axios.post(URL, {
    chat_id: chatId,
    text,
  });
}
