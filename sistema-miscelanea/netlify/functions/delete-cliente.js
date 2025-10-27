// netlify/functions/delete-cliente.js
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

exports.handler = async (event) => {
  if (event.httpMethod !== "DELETE") {
    return { statusCode: 405, body: JSON.stringify({ message: "Método no permitido" }) };
  }

  try {
    // 1️⃣ Extraer ID del cliente desde la query
    const clienteId = event.queryStringParameters?.id;
    if (!clienteId) {
      return { statusCode: 400, body: JSON.stringify({ message: "Falta el parámetro 'id' del cliente." }) };
    }

    // 2️⃣ Validar formato del ID
    let objectId;
    try {
      objectId = new ObjectId(clienteId);
    } catch {
      return { statusCode: 400, body: JSON.stringify({ message: "ID de cliente inválido." }) };
    }

    // 3️⃣ Conectar con MongoDB
    await client.connect();
    const db = client.db("miscelanea");
    const collection = db.collection("clientes");

    // 4️⃣ Ejecutar eliminación
    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: "Cliente no encontrado." }) };
    }

    // 5️⃣ Respuesta exitosa
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Cliente eliminado correctamente." }),
    };

  } catch (error) {
    console.error("Error en delete-cliente:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error al eliminar el cliente.",
        details: error.message,
      }),
    };
  } finally {
    await client.close();
  }
};
