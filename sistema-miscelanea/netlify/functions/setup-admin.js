// netlify/functions/setup-admin.js
const { MongoClient } = require("mongodb");
const bcrypt = require('bcryptjs');
const MONGODB_URI = process.env.MONGODB_URI;

// -------- ¡¡EDITA ESTO!! --------
const ADMIN_USER = "admin"; // Escribe el usuario que quieres
const ADMIN_PASS = "admin123"; // Escribe la contraseña que quieres
// ---------------------------------

exports.handler = async (event) => {
  let client;
  if (!ADMIN_USER || !ADMIN_PASS) {
    return { statusCode: 500, body: "Error: No definiste ADMIN_USER o ADMIN_PASS en el archivo." };
  }
  try {
    const salt = bcrypt.genSaltSync(10);
    const contraseñaHash = bcrypt.hashSync(ADMIN_PASS, salt);

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('miscelanea');
    const usuariosColl = db.collection('usuarios');

    // Borra el admin anterior si existe, para poder correr esto varias veces
    await usuariosColl.deleteOne({ usuario: ADMIN_USER.toLowerCase() });

    // Crear el admin
    const adminUser = {
      usuario: ADMIN_USER.toLowerCase(),
      contraseñaHash: contraseñaHash,
      rol: "administrador",
      fechaCreacion: new Date(),
    };
    await usuariosColl.insertOne(adminUser);

    return { 
      statusCode: 200, 
      body: `¡LISTO! Admin "${ADMIN_USER}" creado. YA PUEDES BORRAR ESTE ARCHIVO.` 
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  } finally {
    if (client) { await client.close(); }
  }
};