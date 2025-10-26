// netlify/functions/update-cliente.js
const { MongoClient, ObjectId } = require("mongodb"); // Importa ObjectId
const MONGODB_URI = process.env.MONGODB_URI;

exports.handler = async (event) => {
  // Usamos PUT para actualizar, es el estándar
  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Método no permitido. Use PUT.' }) };
  }

  let client;
  try {
    const clienteData = JSON.parse(event.body || "{}");
    
    // El ID vendrá en la URL, ej: /update-cliente?id=12345
    const clienteId = event.queryStringParameters.id; 

    if (!clienteId) {
      return { statusCode: 400, body: JSON.stringify({ message: "Falta el ID del cliente." }) };
    }
    
    // Validaciones
    if (!clienteData.nombre || !clienteData.apellido || !clienteData.cedula) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Faltan campos obligatorios." })
      };
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('miscelanea');
    const clientesCollection = db.collection('clientes');

    const filter = { _id: ObjectId(clienteId) }; // Filtro para encontrarlo
    
    // Documento con los campos a actualizar
    const updateDoc = {
      $set: {
        nombre: clienteData.nombre,
        apellido: clienteData.apellido,
        cedula: clienteData.cedula,
      },
    };

    const result = await clientesCollection.updateOne(filter, updateDoc);
    
    if (result.matchedCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: "Cliente no encontrado." }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Cliente actualizado con éxito" })
    };
  } catch (error) {
    console.error('Error en update-cliente:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Fallo interno al actualizar el cliente.' }) };
  } finally {
    if (client) {
      try { await client.close(); } catch (_) {}
    }
  }
};