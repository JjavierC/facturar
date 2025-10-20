// netlify/functions/get-productos.js
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI; // config en Netlify (Settings > Site > Environment)

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  if (!MONGODB_URI) {
    return { statusCode: 500, body: JSON.stringify({ error: 'MONGODB_URI no configurada' }) };
  }

  let client;
  try {
    client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(); // si usas un nombre de DB en la URI, esto es suficiente
    const productos = await db.collection('productos').find({}).toArray();

    return {
      statusCode: 200,
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
