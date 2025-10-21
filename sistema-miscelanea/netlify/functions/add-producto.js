// netlify/functions/add-producto.js
const { MongoClient } = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Método no permitido. Use POST.' }) };
  }

  let client;
  try {
    const productoData = JSON.parse(event.body || "{}");

    // Validaciones básicas
    if (!productoData.nombre || productoData.precio == null || productoData.stock == null) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Faltan campos obligatorios: nombre, precio o stock." })
      };
    }

    // Normalizar valores numéricos
    productoData.precio = Number(productoData.precio);
    productoData.stock = Number(productoData.stock);
    productoData.costo = productoData.costo != null ? Number(productoData.costo) : 0; // <-- aceptar costo

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db('miscelanea');
    const productosCollection = db.collection('inventario');

    const documento = {
      nombre: productoData.nombre,
      precio: productoData.precio,
      costo: productoData.costo,
      stock: productoData.stock,
      descripcion: productoData.descripcion || "",
      fechaCreacion: new Date(),
      activo: productoData.activo ?? true,
    };

    const result = await productosCollection.insertOne(documento);

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Producto agregado con éxito",
        id: result.insertedId
      })
    };
  } catch (error) {
    console.error('Error en add-producto:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Fallo interno al agregar el producto.' }) };
  } finally {
    if (client) {
      try { await client.close(); } catch (_) {}
    }
  }
};
