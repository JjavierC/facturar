// netlify/functions/add-producto.js

const { MongoClient } = require('mongodb');

// ¡IMPORTANTE! La variable MONGODB_URI se carga automáticamente desde el panel de Netlify.
const MONGODB_URI = process.env.MONGODB_URI; 

exports.handler = async (event, context) => {
  // 1. Validar el método HTTP
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ message: 'Método no permitido. Use POST.' })
    };
  }

  let client;
  let productoData;

  try {
    // 2. Parsear el cuerpo de la solicitud (los datos del producto)
    productoData = JSON.parse(event.body);

    // ********* Validaciones Básicas *********
    if (!productoData.nombre || !productoData.precio || !productoData.stock) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Faltan campos obligatorios: nombre, precio o stock." })
        };
    }

    // Asegurar que el precio y stock sean números
    productoData.precio = Number(productoData.precio);
    productoData.stock = Number(productoData.stock);

    // 3. Conectar a MongoDB Atlas
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    // Cambia 'miscelanea' por el nombre real de tu base de datos
    const db = client.db('miscelanea'); 
    
    // Cambia 'inventario' por el nombre real de tu colección
    const productosCollection = db.collection('inventario'); 

    // 4. Lógica: Insertar el nuevo producto en la colección
    const result = await productosCollection.insertOne({
        ...productoData,
        fechaCreacion: new Date(),
        activo: true // Para misceláneas, casi todo está activo
    });

    // 5. Devolver la respuesta de éxito
    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        message: "Producto agregado con éxito",
        id: result.insertedId 
      }),
    };

  } catch (error) {
    console.error('Error al procesar solicitud o conectar a DB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Fallo interno al agregar el producto.' }),
    };
  } finally {
    // 6. Cerrar la conexión
    if (client) {
      await client.close();
    }
  }
};