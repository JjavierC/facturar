// netlify/functions/get-ventas.js
const { MongoClient } = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI;

exports.handler = async () => {
  let client;
  try {
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    const db = client.db("miscelanea");

    const ventas = await db.collection("ventas").find({}).sort({ fecha_venta: -1 }).toArray();

    const totalGanancias = ventas.reduce((acc, v) => acc + (Number(v.total_ganancias || 0)), 0);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ventas, totalGanancias }),
    };
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return { statusCode: 500, body: JSON.stringify({ message: "Error al obtener ventas." }) };
  } finally {
    if (client) {
      try { await client.close(); } catch (_) {}
    }
  }
};
