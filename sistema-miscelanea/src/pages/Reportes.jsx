import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import FacturaImprimible from "../components/FacturaImprimible";

function Reportes() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [idBusqueda, setIdBusqueda] = useState("");
  const [fechaBusqueda, setFechaBusqueda] = useState("");

  // ✅ rango fechas PDF
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // ✅ venta a imprimir
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const printRef = useRef();

  const esAdmin = true;

  useEffect(() => {
    axios
      .get("/.netlify/functions/get-ventas")
      .then((res) => {
        setVentas(res.data.ventas || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar reportes");
        setLoading(false);
      });
  }, []);

  // ======================
  // FILTROS
  // ======================
  const ventasActivas = ventas.filter((v) => !v.anulada);

  const ventasFiltradas = ventasActivas.filter((v) => {
    const idOk = idBusqueda
      ? v._id.toString().includes(idBusqueda)
      : true;

    const fecha = v.fecha || v.fecha_venta;
    const fechaOk = fechaBusqueda
      ? new Date(fecha).toISOString().slice(0, 10) === fechaBusqueda
      : true;

    return idOk && fechaOk;
  });

  // ======================
  // TOTALES
  // ======================
  const totalVentas = ventasFiltradas.length;
  const totalIngresos = ventasFiltradas.reduce(
    (acc, v) => acc + Number(v.total || 0),
    0
  );

  // ======================
  // ANULAR
  // ======================
  const anularVenta = async (id) => {
    if (!window.confirm("¿Seguro que deseas anular esta venta?")) return;

    await axios.post("/.netlify/functions/anular-venta", { ventaId: id });

    setVentas((prev) =>
      prev.map((v) =>
        v._id === id
          ? { ...v, anulada: true, fecha_anulacion: new Date() }
          : v
      )
    );
  };

  // ======================
  // IMPRIMIR UNA VENTA
  // ======================
  const imprimirVenta = (venta) => {
    setVentaSeleccionada(venta);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // ======================
  // IMPRIMIR POR RANGO
  // ======================
  const imprimirPorRango = () => {
    if (!fechaInicio || !fechaFin) {
      alert("Selecciona ambas fechas");
      return;
    }

    const filtradas = ventasActivas.filter((v) => {
      const f = new Date(v.fecha || v.fecha_venta);
      return (
        f >= new Date(fechaInicio) &&
        f <= new Date(fechaFin + "T23:59:59")
      );
    });

    if (filtradas.length === 0) {
      alert("No hay ventas en ese rango");
      return;
    }

    setVentaSeleccionada({ multiple: true, ventas: filtradas });
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold text-center mb-8">
        Reportes de Ventas
      </h1>

      {/* ===== RESUMEN ===== */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded shadow">
          <p className="text-gray-500">Ventas</p>
          <p className="text-3xl font-bold">{totalVentas}</p>
        </div>
        <div className="bg-white p-5 rounded shadow">
          <p className="text-gray-500">Ingresos</p>
          <p className="text-3xl font-bold text-green-600">
            ${totalIngresos.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ===== FILTROS ===== */}
      <div className="bg-white p-4 rounded shadow flex flex-wrap gap-3 mb-6">
        <input
          className="border px-3 py-2 rounded"
          placeholder="Buscar ID"
          value={idBusqueda}
          onChange={(e) => setIdBusqueda(e.target.value)}
        />
        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={fechaBusqueda}
          onChange={(e) => setFechaBusqueda(e.target.value)}
        />

        <input
          type="date"
          className="border px-3 py-2 rounded ml-auto"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />

        <button
          onClick={imprimirPorRango}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          📄 PDF Rango
        </button>
      </div>

      {/* ===== TABLA ===== */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Fecha</th>
              <th className="p-2 border">Items</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">PDF</th>
              {esAdmin && <th className="p-2 border">Acción</th>}
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.map((v) => (
              <tr key={v._id} className="text-center">
                <td className="border p-2">{v._id.toString().slice(-6)}</td>
                <td className="border p-2">
                  {new Date(v.fecha || v.fecha_venta).toLocaleString()}
                </td>
                <td className="border p-2">{v.items.length}</td>
                <td className="border p-2 text-green-600">${v.total}</td>
                <td className="border p-2">
                  <button
                    onClick={() => imprimirVenta(v)}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded"
                  >
                    📄
                  </button>
                </td>
                {esAdmin && (
                  <td className="border p-2">
                    <button
                      onClick={() => anularVenta(v._id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded"
                    >
                      Anular
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== ZONA OCULTA DE IMPRESIÓN ===== */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          {ventaSeleccionada &&
            (ventaSeleccionada.multiple ? (
              ventaSeleccionada.ventas.map((v) => (
                <FacturaImprimible key={v._id} venta={v} />
              ))
            ) : (
              <FacturaImprimible venta={ventaSeleccionada} />
            ))}
        </div>
      </div>
    </div>
  );
}

export default Reportes;
