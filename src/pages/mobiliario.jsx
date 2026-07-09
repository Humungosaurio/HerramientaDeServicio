import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const BienesMobiliario = () => {
  const [busqueda, setBusqueda] = useState("");
  const [criterioOrden, setCriterioOrden] = useState("id-desc");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [inventario, setInventario] = useState([]);

  // Modales
  const [modalBorrarAbierto, setModalBorrarAbierto] = useState(false);
  const [itemParaEliminar, setItemParaEliminar] = useState(null);
  const [modalCargaAbierto, setModalCargaAbierto] = useState(false);
  const [nuevosArticulos, setNuevosArticulos] = useState([]);

  // ==========================================
  // 📌 CONEXIÓN CON CONTROLADOR
  // ==========================================
  const cargarDatosBD = async () => {
    setCargando(true);
    try {
      if (window.pywebview && window.pywebview.api) {
        const res = await window.pywebview.api.cargar_inventario();
        if (res.status === "success") {
          setInventario(res.data);
        } else {
          console.error("Error SQLite:", res.message);
        }
      }
    } catch (error) {
      console.error("Error de comunicación:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosBD();
  }, []);

  // --- Modal Añadir Artículos (CORREGIDO: Ahora inicializa con 'observaciones' vacío) ---
  const abrirModalCarga = () => {
    setNuevosArticulos([
      { id: Date.now(), nombre: "", cantidad: 1, enUso: true, observaciones: "" }
    ]);
    setModalCargaAbierto(true);
  };

  const agregarFilaEnCarga = () => {
    setNuevosArticulos([
      ...nuevosArticulos,
      { id: Date.now() + Math.random(), nombre: "", cantidad: 1, enUso: true, observaciones: "" }
    ]);
  };

  const eliminarFilaEnCarga = (id) => {
    setNuevosArticulos(nuevosArticulos.filter(item => item.id !== id));
  };

  const handleCargaChange = (id, campo, valor) => {
    setNuevosArticulos(nuevosArticulos.map(item => item.id === id ? { ...item, [campo]: valor } : item));
  };

  const guardarNuevosArticulos = async (e) => {
    e.preventDefault();
    const filasValidas = nuevosArticulos.filter(item => item.nombre.trim() !== "");
    if (filasValidas.length === 0) return;

    if (window.pywebview && window.pywebview.api) {
      const res = await window.pywebview.api.guardar_inventario_masivo(filasValidas);
      if (res.status === "success") {
        setModalCargaAbierto(false);
        setNuevosArticulos([]);
        cargarDatosBD();
      } else {
        alert("❌ Error: " + res.message);
      }
    }
  };

  // --- Eliminación ---
  const solicitarEliminarBien = (item) => {
    setItemParaEliminar(item);
    setModalBorrarAbierto(true);
  };

  const confirmarEliminarBien = async () => {
    if (itemParaEliminar && window.pywebview && window.pywebview.api) {
      const res = await window.pywebview.api.eliminar_articulo(itemParaEliminar.id);
      if (res.status === "success") {
        setInventario(inventario.filter((item) => item.id !== itemParaEliminar.id));
      } else {
        alert("❌ Error al eliminar: " + res.message);
      }
    }
    setModalBorrarAbierto(false);
    setItemParaEliminar(null);
  };

  // --- Edición ---
  const handleInventarioChange = (id, campo, valor) => {
    setInventario(inventario.map(item => item.id === id ? { ...item, [campo]: valor } : item));
  };

  const guardarCambiosBD = async () => {
    if (window.pywebview && window.pywebview.api) {
      const res = await window.pywebview.api.guardar_inventario_masivo(inventario);
      if (res.status === "success") {
        alert("✅ Inventario actualizado correctamente en la base de datos.");
        setModoEdicion(false);
        cargarDatosBD();
      } else {
        alert("❌ Error: " + res.message);
      }
    }
  };

  // Búsqueda y Ordenamiento
  const obtenerItemsProcesados = () => {
    const filtrados = inventario.filter((item) =>
      (item.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
    );

    return filtrados.sort((a, b) => {
      switch (criterioOrden) {
        case "id-desc": return b.id - a.id;
        case "id-asc": return a.id - b.id;
        case "nombre-asc": return (a.nombre || "").localeCompare(b.nombre || "");
        case "nombre-desc": return (b.nombre || "").localeCompare(a.nombre || "");
        case "cantidad-asc": return a.cantidad - b.cantidad;
        case "cantidad-desc": return b.cantidad - a.cantidad;
        default: return 0;
      }
    });
  };

  const itemsProcesados = obtenerItemsProcesados();

  return (
    <div className="p-8 text-gray-800 max-w-7xl mx-auto min-h-screen">
      
      {/* HEADER */}
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center border-b pb-5 gap-4">
        <div>
          <p className="text-xs text-purple-600 font-bold uppercase tracking-widest mb-1">Simoncito Receptoria</p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Inventario de Mobiliario</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setModoEdicion(!modoEdicion)}
            className={`font-bold text-sm px-5 py-2.5 rounded-lg shadow-md transition-all ${
              modoEdicion ? "bg-red-500 hover:bg-red-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {modoEdicion ? "🔒 Bloquear Vista" : "✏️ Editar Existentes"}
          </button>

          <button
            onClick={abrirModalCarga}
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-md transition-all"
          >
            ➕ Añadir Artículos
          </button>

          <Link to="/" className="bg-white border border-gray-300 text-gray-700 font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-all">
            🏠 Inicio
          </Link>

          {modoEdicion && (
            <button
              onClick={guardarCambiosBD}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-md animate-bounce"
            >
              💾 Guardar Todo en BD
            </button>
          )}
        </div>
      </header>

      {/* FILTROS */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-3 flex-1 w-full max-w-2xl">
          <input
            type="text"
            placeholder="Buscar por artículo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
          />

          <select
            value={criterioOrden}
            onChange={(e) => setCriterioOrden(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium cursor-pointer"
          >
            <option value="id-desc">ID (Reciente primero)</option>
            <option value="id-asc">ID (Antiguo primero)</option>
            <option value="nombre-asc">Nombre (A → Z)</option>
            <option value="nombre-desc">Nombre (Z → A)</option>
            <option value="cantidad-asc">Menor cantidad</option>
            <option value="cantidad-desc">Mayor cantidad</option>
          </select>
        </div>

        <div className="text-xs font-bold text-gray-500 uppercase bg-gray-100 px-3 py-1.5 rounded-md">
          Artículos: <span className="text-purple-700 text-sm font-black">{itemsProcesados.length}</span>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase text-left font-bold">
              <th className="p-4 text-center w-[10%]">ID Real</th>
              <th className="p-4 w-[35%]">Nombre del Activo</th>
              <th className="p-4 text-center w-[15%]">Cantidad</th>
              <th className="p-4 text-center w-[15%]">Estado</th>
              <th className="p-4 w-[20%]">Comentarios / Observaciones</th>
              <th className="p-4 text-center w-[5%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cargando ? (
              <tr><td colSpan="6" className="p-10 text-center text-gray-400">Cargando base de datos...</td></tr>
            ) : itemsProcesados.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50">
                <td className="p-4 text-center font-bold text-gray-400 text-sm">#{item.id}</td>
                <td className="p-4">
                  <input
                    type="text"
                    value={item.nombre}
                    disabled={!modoEdicion}
                    onChange={(e) => handleInventarioChange(item.id, "nombre", e.target.value)}
                    className={`w-full bg-transparent font-bold text-sm px-2 py-1 rounded ${modoEdicion ? "border border-gray-200 bg-white" : "border-none"}`}
                  />
                </td>
                <td className="p-4 text-center">
                  <input
                    type="number"
                    value={item.cantidad}
                    disabled={!modoEdicion}
                    onChange={(e) => handleInventarioChange(item.id, "cantidad", parseInt(e.target.value) || 0)}
                    className={`w-20 text-center font-black rounded-lg py-1 ${modoEdicion ? "bg-purple-50 border border-purple-200" : "bg-transparent"}`}
                  />
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.enUso}
                      disabled={!modoEdicion}
                      onChange={(e) => handleInventarioChange(item.id, "enUso", e.target.checked)}
                      className="w-4 h-4 accent-purple-700"
                    />
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.enUso ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.enUso ? "En uso" : "En desuso"}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <textarea
                    value={item.observaciones}
                    disabled={!modoEdicion}
                    onChange={(e) => handleInventarioChange(item.id, "observaciones", e.target.value)}
                    className={`w-full bg-transparent text-xs text-gray-600 px-2 py-1 rounded resize-none ${modoEdicion ? "border border-gray-200 bg-white" : "border-none"}`}
                    rows={1}
                  />
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => solicitarEliminarBien(item)} className="text-red-500 hover:text-red-700">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL NUEVOS (CORREGIDO: Con campo de comentarios integrado) */}
      {modalCargaAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-xl font-black text-gray-900">➕ Agregar Artículos al Inventario</h3>
              <button onClick={() => setModalCargaAbierto(false)} className="text-gray-400 font-bold">✕</button>
            </div>
            <form onSubmit={guardarNuevosArticulos} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto flex-1 space-y-3 mb-4">
                <table className="w-full text-left text-sm table-fixed">
                  <thead>
                    <tr className="bg-gray-50 border-b text-gray-600 text-xs uppercase font-bold">
                      <th className="p-2 w-[35%]">Nombre del Artículo</th>
                      <th className="p-2 w-[12%] text-center">Cantidad</th>
                      <th className="p-2 w-[13%] text-center">¿En Uso?</th>
                      <th className="p-2 w-[35%]">Comentarios / Notas</th>
                      <th className="p-2 w-[5%]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {nuevosArticulos.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="p-2">
                          <input
                            type="text"
                            required
                            placeholder="Ej. Sillas Plásticas Niños"
                            value={item.nombre}
                            onChange={(e) => handleCargaChange(item.id, "nombre", e.target.value)}
                            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => handleCargaChange(item.id, "cantidad", parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold focus:bg-white"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={item.enUso}
                            onChange={(e) => handleCargaChange(item.id, "enUso", e.target.checked)}
                            className="w-4 h-4 accent-purple-700"
                          />
                        </td>
                        {/* NUEVO CAMPO AGREGADO AL MODAL */}
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Notas opcionales (ej. requiere pintura)"
                            value={item.observaciones}
                            onChange={(e) => handleCargaChange(item.id, "observaciones", e.target.value)}
                            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 focus:bg-white focus:outline-none"
                          />
                        </td>
                        <td className="p-2 text-center">
                          {nuevosArticulos.length > 1 && (
                            <button type="button" onClick={() => eliminarFilaEnCarga(item.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" onClick={agregarFilaEnCarga} className="text-xs font-black text-purple-700 uppercase mt-2 hover:text-purple-900 block">
                  ➕ Añadir otra fila
                </button>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t shrink-0">
                <button type="button" onClick={() => setModalCargaAbierto(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" className="bg-purple-700 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-purple-800 transition-colors">Guardar en Base de Datos</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BORRAR */}
      {modalBorrarAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-2">⚠️ ¿Eliminar registro?</h3>
            <p className="text-sm text-gray-600 mb-5">
              Se eliminará de forma permanente <strong className="text-gray-900">"{itemParaEliminar?.nombre}"</strong> del sistema.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModalBorrarAbierto(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm">Cancelar</button>
              <button onClick={confirmarEliminarBien} className="bg-red-600 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md">Confirmar Eliminación</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BienesMobiliario;