// netlify/functions/delete-producto.js
const { MongoClient, ObjectId } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI;
// 1. CREA EL CLIENTE AFUERA, igual que en delete-cliente.js
const client = new MongoClient(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Tiempo de espera para la conexión
});

exports.handler = async (event) => {
  // Solo permite el método DELETE
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Método no permitido. Use DELETE.' }) };
  }

  // Ya no declaramos 'client' aquí adentro

  try {
    // Obtiene el ID del producto de los parámetros de la URL (?id=...)
    const productoId = event.queryStringParameters.id;

    // Valida que el ID exista y sea un ObjectId válido
    if (!productoId || !ObjectId.isValid(productoId)) {
        return { statusCode: 400, body: JSON.stringify({ message: "ID de producto inválido o faltante." }) };
    }

    // 2. CONECTA EL CLIENTE (que ya existe afuera)
    await client.connect();
    const db = client.db('miscelanea'); // Asegúrate que 'miscelanea' es el nombre correcto
    const productosCollection = db.collection('inventario'); // Usa la colección 'inventario'

    // Crea el filtro para encontrar el producto por su ID
    const filter = { _id: ObjectId(productoId) };

    // --- Borrado Lógico ---
    // En lugar de borrarlo, actualiza el campo 'activo' a false
    const updateDoc = {
      $set: {
        activo: false,
      },
    };
    // Ejecuta la actualización
    const result = await productosCollection.updateOne(filter, updateDoc);

    // Si no encontró ningún producto que coincida con el ID
    if (result.matchedCount === 0) {
      // Importante: Cierra la conexión ANTES de devolver el error 404
      await client.close();
      return { statusCode: 404, body: JSON.stringify({ message: "Producto no encontrado para eliminar." }) };
    }

    // 5. RESPUESTA EXITOSA (La conexión se cierra en 'finally')
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Producto eliminado (marcado como inactivo) con éxito" })
    };
  } catch (error) {
    // Si ocurre cualquier otro error durante la ejecución
    console.error('Error DETALLADO en delete-producto:', error); // Muestra el error en los logs de Netlify
    return {
      statusCode: 500, // Error interno del servidor
      body: JSON.stringify({
        error: 'Fallo interno al eliminar el producto.',
        details: error.message // Incluye el mensaje del error para depuración
      })
    };
  } finally {

    await client.close();
  }
};

