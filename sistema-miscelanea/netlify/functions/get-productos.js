// netlify/functions/get-productos.js

const { MongoClient } = require('mongodb');

// ¡IMPORTANTE! Esta variable se configura en el panel de Netlify, NO aquí.
const MONGODB_URI = process.env.MONGODB_URI; 

exports.handler = async (event, context) => {
  // Solo permitimos el método GET para obtener datos
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  let client;

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    // Cambia 'miscelanea' por el nombre de tu base de datos en Atlas
    const db = client.db('miscelanea'); 
    
    // Cambia 'inventario' por el nombre de tu colección
    const productosCollection = db.collection('inventario'); 

    // Obtener todos los productos
    const productos = await productosCollection.find({}).toArray();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productos),
    };

  } catch (error) {
    console.error('Error de MongoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Fallo al obtener el inventario.' }),
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};