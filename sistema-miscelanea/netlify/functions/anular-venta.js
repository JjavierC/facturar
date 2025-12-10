const { MongoClient, ObjectId } = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  let client;

  try {
    const { ventaId } = JSON.parse(event.body || "{}");

    if (!ventaId || !ObjectId.isValid(ventaId)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "ID de venta inválido" }),
      };
    }

    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db("miscelanea");

    const ventasColl = db.collection("ventas");
    const productosColl = db.collection("inventario");

    const venta = await ventasColl.findOne({ _id: new ObjectId(ventaId) });

    if (!venta) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Venta no encontrada" }),
      };
    }

    if (venta.anulada) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "La venta ya está anulada" }),
      };
    }

    // 🔄 DEVOLVER STOCK
    for (const item of venta.items) {
      if (!item.producto_id) continue;

      await productosColl.updateOne(
        { _id: item.producto_id },
        { $inc: { stock: item.cantidad } }
      );
    }

    // ✅ MARCAR COMO ANULADA
    await ventasColl.updateOne(
      { _id: venta._id },
      {
        $set: {
          anulada: true,
          fecha_anulacion: new Date(),
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Venta anulada correctamente" }),
    };
  } catch (error) {
    console.error("Error anulando venta:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno del servidor" }),
    };
  } finally {
    if (client) await client.close();
  }
};
