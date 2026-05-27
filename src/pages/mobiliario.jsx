import { useState } from "react";
import { Link } from "react-router-dom";

const BienesMobiliario = () => {
  // 1. Estados del inventario y filtros de la vista principal
  const [busqueda, setBusqueda] = useState("");
  const [criterioOrden, setCriterioOrden] = useState("nombre-asc");
  const [modoEdicion, setModoEdicion] = useState(false);

  const [inventario, setInventario] = useState([
    { id: 1, nombre: "Mesas para niños (Preescolar)", cantidad: 12, observaciones: "3 requieren pintura en las patas traseras y nivelación del tablero principal antes del inicio de clases." },
    { id: 2, nombre: "Sillas de plástico infantiles", cantidad: 24, observaciones: "Todas operativas. Almacenadas en el depósito B." },
    { id: 3, nombre: "Pizarrones acrílicos", cantidad: 4, observaciones: "1 desgastado con manchas fantasmas difíciles de borrar, requiere cambio de lámina." },
    { id: 4, nombre: "Escritorio ejecutivo (Dirección)", cantidad: 2, observaciones: "Excelente estado." },
    { id: 5, nombre: "Reverbero industrial 2 hornillas", cantidad: 1, observaciones: "Mantenimiento al día realizado por el servicio técnico autorizado el mes pasado." },
  ]);

  // 2. Estados para el Modal de Borrado Seguro
  const [modalBorrarAbierto, setModalBorrarAbierto] = useState(false);
  const [itemParaEliminar, setItemParaEliminar] = useState(null);

  // 3. Estados para el Modal de Entrada/Carga Masiva Secundaria
  const [modalCargaAbierto, setModalCargaAbierto] = useState(false);
  const [nuevosArticulos, setNuevosArticulos] = useState([]);

  // --- Funciones del Modal de Carga Masiva ---
  const abrirModalCarga = () => {
    setNuevosArticulos([{ id: Date.now(), nombre: "", cantidad: 1, observaciones: "" }]);
    setModalCargaAbierto(true);
  };

  const agregarFilaEnCarga = () => {
    setNuevosArticulos([
      ...nuevosArticulos,
      { id: Date.now() + Math.random(), nombre: "", cantidad: 1, observaciones: "" }
    ]);
  };

  const eliminarFilaEnCarga = (id) => {
    setNuevosArticulos(nuevosArticulos.filter(item => item.id !== id));
  };

  const handleCargaChange = (id, campo, valor) => {
    const actualizados = nuevosArticulos.map((item) => {
      if (item.id === id) {
        return { ...item, [campo]: valor };
      }
      return item;
    });
    setNuevosArticulos(actualizados);
  };

  const guardarNuevosArticulos = (e) => {
    e.preventDefault();
    const filasValidas = nuevosArticulos.filter(item => item.nombre.trim() !== "");
    if (filasValidas.length === 0) {
      alert("⚠️ Por favor, ingresa al menos un artículo con nombre válido.");
      return;
    }
    setInventario([...inventario, ...filasValidas]);
    setModalCargaAbierto(false);
    setNuevosArticulos([]);
  };

  // Funciones de la Tabla Principal
  const solicitarEliminarBien = (item) => {
    setItemParaEliminar(item);
    setModalBorrarAbierto(true);
  };

  const confirmarEliminarBien = () => {
    if (itemParaEliminar) {
      setInventario(inventario.filter((item) => item.id !== itemParaEliminar.id));
    }
    setModalBorrarAbierto(false);
    setItemParaEliminar(null);
  };

  const handleInventarioChange = (id, campo, valor) => {
    const inventarioActualizado = inventario.map((item) => {
      if (item.id === id) {
        return { ...item, [campo]: valor };
      }
      return item;
    });
    setInventario(inventarioActualizado);
  };

  const guardarCambiosBD = () => {
    console.log("Inventario General Completo:", inventario);
    alert(`📥 [C.E.I Simoncito] El inventario general (${inventario.length} bienes) se ha consolidado correctamente en el sistema.`);
    setModoEdicion(false);
  };

  const obtenerItemsProcesados = () => {
    const filtrados = inventario.filter((item) =>
      item.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return filtrados.sort((a, b) => {
      switch (criterioOrden) {
        case "nombre-asc": return a.nombre.localeCompare(b.nombre);
        case "nombre-desc": return b.nombre.localeCompare(a.nombre);
        case "cantidad-asc": return a.cantidad - b.cantidad;
        case "cantidad-desc": return b.cantidad - a.cantidad;
        default: return 0;
      }
    });
  };

  const itemsProcesados = obtenerItemsProcesados();

  return (
    <div className="page-transition p-8 text-gray-800 max-w-7xl mx-auto relative min-h-screen">
      
      {/* HEADER DE CONTROL */}
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center border-b pb-5 gap-4">
        <div>
          <p className="text-xs text-purple-600 font-bold uppercase tracking-widest mb-1">
            Registro Único de Bienes Nacionales
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Inventario General de Mobiliario
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setModoEdicion(!modoEdicion)}
            className={`font-bold text-sm px-5 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-2 ${
              modoEdicion ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {modoEdicion ? "🔒 Bloquear Vista" : "✏️ Editar Existentes"}
          </button>

          <button
            onClick={abrirModalCarga}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span className="text-base">➕</span> Añadir Artículos
          </button>

          <Link
            to="/"
            className="bg-white border border-gray-300 text-gray-700 font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
          >
            Volver al Inicio
          </Link>

          <button
            onClick={guardarCambiosBD}
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            💾 Guardar Todo
          </button>
        </div>
      </header>

      {/* SECCIÓN DE FILTROS */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Buscar por artículo, aula o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all shadow-inner"
            />
          </div>

          <div className="relative min-w-[220px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm pointer-events-none">Ordenar por</span>
            <select
              value={criterioOrden}
              onChange={(e) => setCriterioOrden(e.target.value)}
              className="w-full pl-24 pr-4 py-2.5 bg-gray-50 text-gray-800 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all shadow-sm cursor-pointer appearance-none"
            >
              <option value="nombre-asc">Nombre ("A" → "Z")</option>
              <option value="nombre-desc">Nombre ("Z" → "A")</option>
              <option value="cantidad-asc">Menor cantidad</option>
              <option value="cantidad-desc">Mayor cantidad</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">▼</div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1.5 rounded-md ${
            modoEdicion ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
          }`}>
            <span className={`h-2 w-2 rounded-full ${modoEdicion ? "bg-amber-500 animate-pulse" : "bg-blue-500"}`}></span>
            {modoEdicion ? "Modo Edición Abierto" : "Modo Solo Lectura"}
          </span>
          <div className="text-xs font-bold text-gray-500 uppercase bg-gray-100 px-3 py-1.5 rounded-md whitespace-nowrap">
            Artículos: <span className="text-purple-700 text-sm font-black ml-1">{itemsProcesados.length}</span>
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL DEL INVENTARIO */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] table-fixed border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider font-bold">
                <th className="p-4 text-left w-4/12">Nombre del Bien / Ubicación</th>
                <th className="p-4 text-center w-2/12">Cantidad</th>
                <th className="p-4 text-left w-5/12">Observaciones Generales</th>
                <th className="p-4 text-center w-1/12">Acción</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100 vertical-align-top">
              {itemsProcesados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-16 text-center text-gray-400 font-medium italic">
                    No se encontraron activos en el inventario.
                  </td>
                </tr>
              ) : (
                itemsProcesados.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-gray-50/50 items-start">
                    
                    {/* NOMBRE */}
                    <td className="p-4 align-top">
                      <input
                        type="text"
                        value={item.nombre}
                        disabled={!modoEdicion}
                        onChange={(e) => handleInventarioChange(item.id, "nombre", e.target.value)}
                        className={`w-full bg-transparent font-bold text-sm px-2 py-1.5 rounded transition-all focus:outline-none ${
                          modoEdicion 
                            ? "text-gray-800 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-500" 
                            : "text-gray-700 cursor-default border-none"
                        }`}
                      />
                    </td>
                    
                    {/* CANTIDAD */}
                    <td className="p-4 text-center align-top">
                      <input
                        type="number"
                        min="0"
                        value={item.cantidad}
                        disabled={!modoEdicion}
                        onChange={(e) => handleInventarioChange(item.id, "cantidad", parseInt(e.target.value) || 0)}
                        className={`w-20 text-center font-black rounded-lg py-1.5 focus:outline-none text-sm transition-all ${
                          modoEdicion 
                            ? "bg-purple-50 text-purple-950 border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:bg-white shadow-inner" 
                            : "bg-transparent text-gray-900 border-none cursor-default"
                        }`}
                      />
                    </td>
                    
                    {/* OBSERVACIONES CON CARGA DE TEXTO LARGO */}
                    <td className="p-4 align-top">
                      {modoEdicion ? (
                        <textarea
                          rows="2"
                          value={item.observaciones}
                          onChange={(e) => handleInventarioChange(item.id, "observaciones", e.target.value)}
                          className="w-full text-sm bg-white border border-gray-200 rounded-lg p-2 resize-y focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 text-gray-600 transition-all font-medium leading-relaxed shadow-inner"
                        />
                      ) : (
                        <div className="text-sm text-gray-500 px-2 py-1.5 max-h-24 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed">
                          {item.observaciones || <span className="text-gray-300 italic">Sin observaciones</span>}
                        </div>
                      )}
                    </td>

                    {/* BORRAR */}
                    <td className="p-4 text-center align-top">
                      <button
                        onClick={() => solicitarEliminarBien(item)}
                        disabled={!modoEdicion}
                        className={`p-2 rounded-lg transition-all flex items-center justify-center mx-auto mt-1 ${
                          modoEdicion ? "group text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer" : "text-gray-200 cursor-not-allowed"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WINDOW/MODAL SECUNDARIO: MODAL CON MEJORAS PARA TEXTO LARGO */}
      {modalCargaAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[85vh]">
            
            <div className="flex justify-between items-center pb-4 border-b mb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">Ingreso Controlado de Bienes</h3>
                <p className="text-xs text-gray-500">Puedes escribir observaciones extensas. La ventana adaptará su tamaño de manera interna.</p>
              </div>
              <button 
                onClick={() => setModalCargaAbierto(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold px-2"
              >
                &times;
              </button>
            </div>

            <form onSubmit={guardarNuevosArticulos} className="flex-1 overflow-y-auto pr-1">
              <table className="w-full text-left table-fixed border-collapse mb-4">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs font-bold uppercase border-b">
                    <th className="p-3 w-4/12">Nombre del Artículo *</th>
                    <th className="p-3 w-2/12 text-center">Cantidad</th>
                    <th className="p-3 w-5/12">Observaciones Detalladas</th>
                    <th className="p-3 w-1/12 text-center">Remover</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {nuevosArticulos.map((item) => (
                    <tr key={item.id} className="bg-emerald-50/10">
                      
                      <td className="p-2 align-top">
                        <input
                          type="text"
                          required
                          value={item.nombre}
                          placeholder="Ej. Sillas infantiles..."
                          onChange={(e) => handleCargaChange(item.id, "nombre", e.target.value)}
                          className="w-full bg-white text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-gray-800"
                        />
                      </td>

                      <td className="p-2 text-center align-top">
                        <input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => handleCargaChange(item.id, "cantidad", parseInt(e.target.value) || 1)}
                          className="w-20 text-center bg-white text-sm px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-black text-emerald-950"
                        />
                      </td>

                      {/* TEXTAREA EN EL MODAL PARA COMODIDAD DE ESCRITURA */}
                      <td className="p-2 align-top">
                        <textarea
                          rows="2"
                          value={item.observaciones}
                          placeholder="Detalles de entrega, color, estado, aula de destino..."
                          onChange={(e) => handleCargaChange(item.id, "observaciones", e.target.value)}
                          className="w-full bg-white text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-600 font-medium resize-y max-h-32"
                        />
                      </td>

                      <td className="p-2 text-center align-top">
                        <button
                          type="button"
                          disabled={nuevosArticulos.length === 1}
                          onClick={() => eliminarFilaEnCarga(item.id)}
                          className={`p-1.5 rounded mt-1 ${nuevosArticulos.length === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                        >
                          ✕
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                type="button"
                onClick={agregarFilaEnCarga}
                className="w-full border-2 border-dashed border-gray-300 hover:border-emerald-500 text-gray-500 hover:text-emerald-600 font-bold text-sm py-2.5 rounded-lg transition-all"
              >
                ➕ Añadir otra fila al lote
              </button>
            </form>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4 bg-white">
              <button
                type="button"
                onClick={() => setModalCargaAbierto(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
              >
                Cancelar Carga
              </button>
              <button
                type="button"
                onClick={guardarNuevosArticulos}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md shadow-emerald-100 transition-colors"
              >
                Confirmar y Cargar al Inventario ({nuevosArticulos.length})
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE BORRADO SEGURO */}
      {modalBorrarAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-xl font-black text-gray-900">¿Estás completamente seguro?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Esta acción eliminará de forma permanente el registro de{" "}
              <strong className="text-gray-900">
                {itemParaEliminar?.nombre ? `"${itemParaEliminar.nombre}"` : "este artículo vacío"}
              </strong>.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalBorrarAbierto(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors"
              >
                No, Cancelar
              </button>
              <button
                onClick={confirmarEliminarBien}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
              >
                Sí, Eliminar Registro
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BienesMobiliario;