// netlify/functions/delete-producto.js
const { MongoClient, ObjectId } = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI;

exports.handler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Método no permitido. Use DELETE.' }) };
  }

  let client;
  try {
    const productoId = event.queryStringParameters.id; 

    if (!productoId || !ObjectId.isValid(productoId)) { 
        return { statusCode: 400, body: JSON.stringify({ message: "ID de producto inválido o faltante." }) };
    }

    // Usamos las opciones de conexión completas
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    const db = client.db('miscelanea'); 
    // CAMBIO: Usamos la colección 'inventario'
    const productosCollection = db.collection('inventario'); 

    const filter = { _id: ObjectId(productoId) };

    // --- Borrado Lógico ---
    // Marcamos el producto como inactivo en lugar de borrarlo
    const updateDoc = {
      $set: {
        activo: false, 
      },
    };
    const result = await productosCollection.updateOne(filter, updateDoc);
    // ----------------------

    if (result.matchedCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: "Producto no encontrado para eliminar." }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Producto eliminado (marcado como inactivo) con éxito" })
    };
  } catch (error) {
    console.error('Error DETALLADO en delete-producto:', error); 
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Fallo interno al eliminar el producto.',
        details: error.message 
      })
    };
  } finally {
    if (client) {
      try { await client.close(); } catch (_) {}
    }
  }
};
