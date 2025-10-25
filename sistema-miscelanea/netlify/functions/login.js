// netlify/functions/login.js
const { MongoClient } = require("mongodb");
const bcrypt = require('bcryptjs'); // Para comparar contraseñas
const jwt = require('jsonwebtoken'); // Para crear el token

const MONGODB_URI = process.env.MONGODB_URI;
// DEBES AÑADIR ESTA VARIABLE A NETLIFY (pon un texto secreto largo)
const JWT_SECRET = process.env.JWT_SECRET; 

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  if (!JWT_SECRET) {
    return { statusCode: 500, body: JSON.stringify({ error: 'JWT_SECRET no está configurado.' }) };
  }

  let client;
  try {
    const { usuario, contraseña } = JSON.parse(event.body);
    if (!usuario || !contraseña) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Usuario y contraseña requeridos.' }) };
    }

    client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db('miscelanea');
    
    // 1. Buscar al usuario
    const user = await db.collection('usuarios').findOne({ usuario: usuario.toLowerCase() });
    if (!user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Credenciales inválidas.' }) };
    }

    // 2. Comparar la contraseña hasheada
    const passwordMatch = bcrypt.compareSync(contraseña, user.contraseñaHash);
    if (!passwordMatch) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Credenciales inválidas.' }) };
    }

    // 3. Crear el token
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        rol: user.rol, // 'cajero' o 'administrador'
        usuario: user.usuario
      },
      JWT_SECRET,
      { expiresIn: '8h' } // El token expira en 8 horas
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Login exitoso',
        token: token,
        rol: user.rol, // Devolvemos el rol al frontend
        usuario: user.usuario
      }),
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Error interno del servidor.' }) };
  } finally {
    if (client) { await client.close(); }
  }
};