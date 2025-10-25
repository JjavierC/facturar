// netlify/functions/crear-usuario.js
const { MongoClient } = require("mongodb");
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  // TODO: Añadir validación de token para asegurar que SÓLO un admin pueda llamar esta función

  let client;
  try {
    const { usuario, contraseña, rol } = JSON.parse(event.body);
    if (!usuario || !contraseña || !rol) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Usuario, contraseña y rol son requeridos.' }) };
    }
    if (rol !== 'cajero' && rol !== 'administrador') {
        return { statusCode: 400, body: JSON.stringify({ error: 'Rol inválido. Debe ser "cajero" o "administrador".' }) };
    }

    // Hashear la contraseña
    const salt = bcrypt.genSaltSync(10);
    const contraseñaHash = bcrypt.hashSync(contraseña, salt);

    client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db('miscelanea');

    // Verificar si el usuario ya existe
    const existingUser = await db.collection('usuarios').findOne({ usuario: usuario.toLowerCase() });
    if (existingUser) {
        return { statusCode: 409, body: JSON.stringify({ error: 'El nombre de usuario ya existe.' }) };
    }

    const newUser = {
      usuario: usuario.toLowerCase(),
      contraseñaHash: contraseñaHash,
      rol: rol, // 'cajero' o 'administrador'
      fechaCreacion: new Date(),
    };

    const result = await db.collection('usuarios').insertOne(newUser);
    
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Usuario creado con éxito', id: result.insertedId }),
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Error interno del servidor.' }) };
  } finally {
    if (client) { await client.close(); }
  }
};