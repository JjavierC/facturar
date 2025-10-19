// netlify/functions/guardar-venta.js

const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb'); 
const MONGODB_URI = process.env.MONGODB_URI; 

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Método no permitido' }) };
  }

  let client;
  let ventaData;

  try {
    ventaData = JSON.parse(event.body);

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('miscelanea'); 
    const inventarioCollection = db.collection('inventario');
    const ventasCollection = db.collection('ventas'); // Nueva colección para guardar ventas

    // 1. Guardar la Venta (Registro)
    const ventaRecord = {
        fecha: new Date(),
        items: ventaData.items,
        subtotal: ventaData.subtotal,
        iva: ventaData.iva,
        total: ventaData.total,
        // Puedes agregar campos como 'metodoPago: ventaData.pago'
    };
    const ventaResult = await ventasCollection.insertOne(ventaRecord);

    // 2. Descontar Inventario
    const promises = ventaData.items.map(item => {
        return inventarioCollection.updateOne(
            { _id: new ObjectId(item._id) }, // Buscar por ID
            { $inc: { stock: -item.cantidad } } // Descontar la cantidad vendida
        );
    });
    await Promise.all(promises);

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        message: "Venta registrada e inventario actualizado",
        ventaId: ventaResult.insertedId 
      }),
    };

  } catch (error) {
    console.error('Error en el proceso de venta:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Fallo al procesar la venta y actualizar el inventario.' }),
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};