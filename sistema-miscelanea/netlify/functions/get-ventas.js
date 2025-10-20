// netlify/functions/get-ventas.js
const { MongoClient } = require("mongodb");

exports.handler = async () => {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();
    const db = client.db("facturacion");

    const ventas = await db
      .collection("ventas")
      .find({})
      .sort({ fecha_venta: -1 })
      .toArray();

    return {
      statusCode: 200,
      body: JSON.stringify(ventas),
    };
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error al obtener ventas." }),
    };
  } finally {
    await client.close();
  }
};
