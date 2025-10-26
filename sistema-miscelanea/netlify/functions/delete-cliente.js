// netlify/functions/delete-cliente.js
const { MongoClient, ObjectId } = require("mongodb"); // ¡Importa ObjectId!
const MONGODB_URI = process.env.MONGODB_URI;

exports.handler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Método no permitido. Use DELETE.' }) };
  }

  let client;
  try {
    // El ID viene en la URL
    const clienteId = event.queryStringParameters.id; 

    if (!clienteId) {
      return { statusCode: 400, body: JSON.stringify({ message: "Falta el ID del cliente." }) };
    }

    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    const db = client.db('miscelanea');
    const clientesCollection = db.collection('clientes');

    // ¡CRÍTICO! Convertir el ID a ObjectId
    const filter = { _id: ObjectId(clienteId) };

    // --- Borrado Lógico (Recomendado) ---
    // En lugar de borrarlo, lo marcamos como inactivo.
    // Tu 'get-clientes.js' ya filtra por "activo: true", así que esto funciona.
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
