// netlify/functions/update-producto.js
const { MongoClient, ObjectId } = require("mongodb");

exports.handler = async (event) => {
  if (event.httpMethod !== "PUT") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido" }),
    };
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Falta MONGODB_URI en variables de entorno" }),
    };
  }

  let client;
  try {
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db("miscelanea");
    const inventario = db.collection("inventario");

    const id = event.queryStringParameters.id;
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "ID de producto requerido" }),
      };
    }

    const data = JSON.parse(event.body || "{}");

    // Validar que al menos un campo venga para actualizar:
    const campos = {};
    if (data.nombre !== undefined) campos.nombre = data.nombre;
    if (data.descripcion !== undefined) campos.descripcion = data.descripcion;
    if (data.costo !== undefined) campos.costo = Number(data.costo);
    if (data.precio !== undefined) campos.precio = Number(data.precio);
    if (data.stock !== undefined) campos.stock = Number(data.stock);

    if (Object.keys(campos).length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No hay datos para actualizar" }),
      };
    }

    const filtro = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

    const resultado = await inventario.updateOne(filtro, { $set: campos });

    if (resultado.matchedCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Producto no encontrado" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Producto actualizado correctamente" }),
    };
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno del servidor" }),
    };
  } finally {
    if (client) await client.close();
  }
};
