// netlify/functions/get-clientes.js
const { MongoClient } = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI;

exports.handler = async (event) => {
  if (event && event.httpMethod && event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  if (!MONGODB_URI) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "MONGODB_URI no configurada" }),
    };
  }

  let client;
  try {
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();

    const db = client.db("miscelanea");
    // Usamos una nueva colección llamada "clientes"
    const clientesCollection = db.collection("clientes");

    const clientes = await clientesCollection.find({ activo: true }).toArray();

    // Formateamos los datos para el frontend
    const clientesFormateados = clientes.map((c) => ({
      _id: c._id.toString(), // Convertimos el ObjectId a string
      nombre: c.nombre,
      apellido: c.apellido,
      cedula: c.cedula,
      activo: c.activo ?? true,
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientesFormateados),
    };
  } catch (error) {
    console.error("❌ Error en get-clientes:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Fallo al obtener clientes." }),
    };
  } finally {
    if (client) {
      try { await client.close(); } catch (_) {}
    }
  }
};