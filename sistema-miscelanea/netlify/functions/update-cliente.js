// netlify/functions/update-cliente.js
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

exports.handler = async (event) => {
  if (event.httpMethod !== "PUT") {
    return { statusCode: 405, body: JSON.stringify({ message: "Método no permitido" }) };
  }

  try {
    // 1️⃣ Extraer ID de la query string
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

    // 3️⃣ Parsear el cuerpo JSON recibido
    const clienteData = JSON.parse(event.body || "{}");
    const { nombre, apellido, cedula, telefono, correo } = clienteData;

    // 4️⃣ Validar campos obligatorios
     if (!nombre || !apellido || !cedula)
 {
      return { statusCode: 400, body: JSON.stringify({ message: "Faltan campos obligatorios." }) };
    }

    // 5️⃣ Conectar con MongoDB
    await client.connect();
    const db = client.db("miscelanea");
    const collection = db.collection("clientes");

    // 6️⃣ Ejecutar actualización
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: clienteData }
    );

    if (result.matchedCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: "Cliente no encontrado." }) };
    }

    // 7️⃣ Respuesta exitosa
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Cliente actualizado correctamente." }),
    };

  } catch (error) {
    console.error("Error en update-cliente:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error al actualizar el cliente.",
        details: error.message,
      }),
    };
  } finally {
    await client.close();
  }
};
