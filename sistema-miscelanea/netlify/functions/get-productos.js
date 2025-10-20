// netlify/functions/get-productos.js
const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI; // configurada en Netlify (Settings → Environment variables)

exports.handler = async (event) => {
  // Solo permitir método GET
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  // Verificar que la variable esté configurada
  if (!MONGODB_URI) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "MONGODB_URI no configurada" }),
    };
  }

  let client;

  try {
    // Conectar con timeout controlado
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();

    // Usar la base "miscelanea" (o cambia el nombre si la tuya es otra)
    const db = client.db("miscelanea");
    const productosCollection = db.collection("productos");

    // Obtener todos los productos activos
    const productos = await productosCollection.find({ activo: true }).toArray();

    // Convertir _id a id (string) y limpiar datos
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
    if (client) {
      await client.close().catch(() => {});
    }
  }
};
