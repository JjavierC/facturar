// netlify/functions/get-productos.js
const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI;

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
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

    // 👇 aquí está el cambio importante
    const productosCollection = db.collection("inventario");

    const productos = await productosCollection.find({ activo: true }).toArray();

    const productosFormateados = productos.map((p) => ({
      id: p._id.toString(),
      nombre: p.nombre,
      precio: p.precio,
      stock: p.stock,
      descripcion: p.descripcion || "",
      fechaCreacion: p.fechaCreacion || null,
      activo: p.activo ?? true,
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productosFormateados),
    };
  } catch (error) {
    console.error("❌ Error de MongoDB:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Fallo al obtener el inventario." }),
    };
  } finally {
    if (client) await client.close().catch(() => {});
  }
};
  