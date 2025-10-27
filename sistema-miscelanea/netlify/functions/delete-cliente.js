// netlify/functions/delete-cliente.js
const { MongoClient, ObjectId } = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI;

exports.handler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Método no permitido. Use DELETE.' }) };
  }

  let client;
  try {
    const clienteId = event.queryStringParameters.id; 

    if (!clienteId) {
      return { statusCode: 400, body: JSON.stringify({ message: "Falta el ID del cliente." }) };
    }

    // --- ¡AQUÍ ESTABA EL ERROR! ---
    // Faltaban las opciones de conexión
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    // -----------------------------

    await client.connect();
    const db = client.db('miscelanea');
    const clientesCollection = db.collection('clientes');

    const filter = { _id: ObjectId(clienteId) };

    // Borrado Lógico (Recomendado)
    const updateDoc = {
      $set: {
        activo: false,
      },
    };
    const result = await clientesCollection.updateOne(filter, updateDoc);

    if (result.matchedCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: "Cliente no encontrado." }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Cliente eliminado (marcado como inactivo) con éxito" })
    };
  } catch (error) {
    console.error('Error en delete-cliente:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Fallo interno al eliminar el cliente.', details: error.message }) };
  } finally {
    if (client) {
      try { await client.close(); } catch (_) {}
    }
  }
};