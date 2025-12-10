const { MongoClient } = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI;

exports.handler = async () => {
  let client;

  try {
    if (!MONGODB_URI) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "MONGODB_URI no configurada" }),
      };
    }

    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    const db = client.db("miscelanea");
    const ventasColl = db.collection("ventas");

    // ✅ Traer TODAS las ventas (incluidas anuladas)
    const ventas = await ventasColl
      .find({})
      .sort({ fecha: -1 }) // usamos fecha estándar
      .toArray();

    // ✅ Ganancia SOLO de ventas válidas
    const totalGanancias = ventas
      .filter(v => !v.anulada)
      .reduce((acc, v) => acc + Number(v.total_ganancias || 0), 0);

    // ✅ Total ventas reales (opcional pero útil)
    const totalVentasValidas = ventas.filter(v => !v.anulada).length;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ventas,
        totalGanancias,
        totalVentasValidas,
      }),
    };
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error al obtener ventas.",
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
