// netlify/functions/add-cliente.js
const { MongoClient } = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Método no permitido. Use POST.' }) };
  }

  let client;
  try {
    const clienteData = JSON.parse(event.body || "{}");

    // Validaciones básicas
    if (!clienteData.nombre || !clienteData.apellido || !clienteData.cedula) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Faltan campos obligatorios: nombre, apellido o cédula." })
      };
    }

    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();

    const db = client.db('miscelanea');
    // Guardamos en la colección "clientes"
    const clientesCollection = db.collection('clientes');

    const documento = {
      nombre: clienteData.nombre,
      apellido: clienteData.apellido,
      cedula: clienteData.cedula,
      fechaCreacion: new Date(),
      activo: clienteData.activo ?? true, // Igual que en productos
    };

    const result = await clientesCollection.insertOne(documento);

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Cliente agregado con éxito",
        id: result.insertedId
      })
    };
  } catch (error) {
    console.error('Error en add-cliente:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Fallo interno al agregar el cliente.' }) };
  } finally {
    if (client) {
      try { await client.close(); } catch (_) {}
    }
  }
};