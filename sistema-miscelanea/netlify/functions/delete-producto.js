// netlify/functions/delete-producto.js
const { MongoClient, ObjectId } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URI);

exports.handler = async (event) => {
  if (event.httpMethod !== "DELETE") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Método no permitido. Use DELETE." }),
    };
  }

  try {
    const productoId = event.queryStringParameters.id;
    if (!productoId || !ObjectId.isValid(productoId)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "ID de producto inválido o faltante." }),
      };
    }

    await client.connect();
    const db = client.db("miscelanea");
    const collection = db.collection("inventario");

    // 🔸 Eliminación real del documento
    const result = await collection.deleteOne({ _id: new ObjectId(productoId) });

    if (result.deletedCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Producto no encontrado para eliminar." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Producto eliminado correctamente." }),
    };
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Fallo interno al eliminar el producto.",
        details: error.message,
      }),
    };
  } finally {
    await client.close();
  }
};
