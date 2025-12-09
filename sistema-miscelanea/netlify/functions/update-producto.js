const { MongoClient, ObjectId } = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI;

exports.handler = async (event) => {
  if (event.httpMethod !== "PUT") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { id } = event.queryStringParameters;

  if (!id) {
    return { statusCode: 400, body: "Falta el ID del producto" };
  }

  const data = JSON.parse(event.body);

  let client;

  try {
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db("miscelanea");
    const inventario = db.collection("inventario");

    const productoId = ObjectId.isValid(id) ? new ObjectId(id) : id;

    const updateData = {};

    if (data.nombre) updateData.nombre = data.nombre;
    if (data.descripcion) updateData.descripcion = data.descripcion;
    if (data.costo !== undefined) updateData.costo = Number(data.costo);
    if (data.precio !== undefined) updateData.precio = Number(data.precio);
    if (data.stock !== undefined) updateData.stock = Number(data.stock);

    const result = await inventario.updateOne(
      { _id: productoId },
      { $set: updateData }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Producto actualizado correctamente",
        result,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error actualizando", error }),
    };
  } finally {
    if (client) client.close();
  }
};
