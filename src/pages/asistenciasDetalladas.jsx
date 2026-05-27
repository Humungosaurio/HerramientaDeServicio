import { useState } from "react";
import { Link } from "react-router-dom";

const AsistenciasDetalladas = () => {
  // 1. Controles de filtros de la interfaz (Tus originales)
  const [nivelSeleccionado, setNivelSeleccionado] = useState("Maternal");
  const [turnoSeleccionado, setTurnoSeleccionado] = useState("Mañana");
  const [semanaSeleccionada, setSemanaSeleccionada] = useState("Semana 1");
  const [showResumen, setShowResumen] = useState(false);

  // Estados del modal de reportes
  const [busquedaModal, setBusquedaModal] = useState("");
  const [vistaTabular, setVistaTabular] = useState(false);

  const niveles = ["Maternal", "1er Nivel", "2do Nivel", "3er Nivel"];
  const turnos = ["Mañana", "Tarde"];
  const semanas = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  const obtenerFechaFicticia = (semana, dia) => {
    const baseSemana = semanas.indexOf(semana) * 5;
    const offsetDia = diasSemana.indexOf(dia) + 1;
    return baseSemana + offsetDia;
  };

  const generarEstructuraAsistenciaIndividual = () => {
    const estructura = {};
    semanas.forEach((semana) => {
      estructura[semana] = {};
      diasSemana.forEach((dia) => {
        estructura[semana][dia] = false;
      });
    });
    return estructura;
  };

  // 2. Base de datos estática inicial (Tus alumnos de muestra)
  const [estructuraPlantel] = useState({
    Maternal: {
      Mañana: {
        A: [
          { id: 1, nombre: "Pedro Alana", sexo: "v" },
          { id: 2, nombre: "Nicol Blanco", sexo: "h" },
        ],
      },
      Tarde: {
        B: [{ id: 4, nombre: "Sofía Rodríguez", sexo: "h" }],
      },
    },
    "1er Nivel": {
      Mañana: {
        A: [{ id: 5, nombre: "Alejandro Gómez", sexo: "v" }],
        B: [],
      },
      Tarde: { C: [], D: [] },
    },
    "2do Nivel": {
      Mañana: { A: [] },
      Tarde: { C: [{ id: 6, nombre: "Mariana Vivas", sexo: "h" }], D: [] },
    },
    "3er Nivel": {
      Mañana: { A: [] },
      Tarde: { B: [{ id: 3, nombre: "Carlos Mendoza", sexo: "v" }], C: [] },
    },
  });

  // 3. Estado maestro de asistencias seguro
  const [registroAsistencias, setRegistroAsistencias] = useState(() => {
    const estadoInicial = {};
    Object.values(estructuraPlantel).forEach((turnoObj) => {
      Object.values(turnoObj).forEach((seccionObj) => {
        Object.values(seccionObj).forEach((alumnosLista) => {
          alumnosLista.forEach((estudiante) => {
            estadoInicial[estudiante.id] =
              generarEstructuraAsistenciaIndividual();
          });
        });
      });
    });
    return estadoInicial;
  });

  // Manejador seguro para las casillas
  const handleAsistenciaChange = (estudianteId, dia) => {
    setRegistroAsistencias((prev) => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        [semanaSeleccionada]: {
          ...prev[estudianteId]?.[semanaSeleccionada],
          [dia]: !prev[estudianteId]?.[semanaSeleccionada]?.[dia],
        },
      },
    }));
  };

  const guardarCambiosBD = () => {
    console.log("Reporte consolidado listo para enviar:", registroAsistencias);
    alert(
      `📥 [C.E.I Simoncito] El reporte de ${nivelSeleccionado} (${turnoSeleccionado}) — ${semanaSeleccionada} se ha guardado con éxito.`,
    );
  };

  const obtenerEstudiantesFiltradosModal = () => {
    const listaAplanada = [];
    Object.keys(estructuraPlantel).forEach((nivel) => {
      Object.keys(estructuraPlantel[nivel]).forEach((turno) => {
        Object.keys(estructuraPlantel[nivel][turno]).forEach((seccion) => {
          const alumnos = estructuraPlantel[nivel][turno][seccion] || [];
          alumnos.forEach((alumno) => {
            listaAplanada.push({
              ...alumno,
              nivel,
              turno,
              seccion,
              terminoBusqueda:
                `${alumno.nombre} ${nivel} ${turno} seccion ${seccion}`.toLowerCase(),
            });
          });
        });
      });
    });

    if (!busquedaModal.trim()) return listaAplanada;
    const terminos = busquedaModal
      .toLowerCase()
      .split(" ")
      .filter((t) => t);
    return listaAplanada.filter((estudiante) =>
      terminos.every((termino) => estudiante.terminoBusqueda.includes(termino)),
    );
  };

  const seccionesActuales = estructuraPlantel[nivelSeleccionado]?.[
    turnoSeleccionado
  ]
    ? Object.keys(estructuraPlantel[nivelSeleccionado][turnoSeleccionado])
    : [];

  return (
    <div className="page-transition p-8 text-gray-800">
      <div className="flex flex-col md:flex-row gap-6">
        {/* SIDEBAR ORIGINAL DE SELECCIÓN (NIVELES IZQUIERDA) */}
        <aside className="md:w-1/4 flex md:flex-col overflow-x-auto gap-2">
          {niveles.map((nivel) => (
            <button
              key={nivel}
              onClick={() => setNivelSeleccionado(nivel)}
              className={`px-4 py-3 rounded-lg text-left font-bold transition-all ${nivelSeleccionado === nivel ? "bg-purple-700 text-white shadow-lg" : "text-gray-600 hover:bg-purple-50 bg-white border border-gray-100"}`}
            >
              {nivel}
            </button>
          ))}
        </aside>

        {/* CONTENIDO DE LA ASISTENCIA ORIGINAL */}
        <main className="flex-1">
          <header className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-end border-b pb-4 gap-4">
            <div>
              <p className="text-sm text-purple-600 font-bold uppercase tracking-widest">
                Módulo Inicial
              </p>
              <h1 className="text-3xl font-black text-white">
                {nivelSeleccionado} — {semanaSeleccionada}
              </h1>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => {
                  setBusquedaModal("");
                  setShowResumen(true);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-bold shadow-md flex items-center transition-all"
              >
                📊 Abrir Historial Mensual
              </button>

              <Link
                to="/"
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-bold hover:bg-gray-50 transition-all"
              >
                Inicio
              </Link>

              <button
                onClick={guardarCambiosBD}
                className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2 rounded-md font-bold shadow-md transition-all flex items-center gap-2"
              >
                Guardar Reporte
              </button>
            </div>
          </header>

          {/* SELECTORES DE NAVEGACIÓN ORIGINALES (TURNOS Y SEMANAS JUNTOS) */}
          <div className="flex flex-col gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div className="flex bg-gray-200 p-1 rounded-xl w-fit font-bold shadow-inner">
                {turnos.map((turno) => (
                  <button
                    key={turno}
                    onClick={() => setTurnoSeleccionado(turno)}
                    className={`px-5 py-1.5 rounded-lg text-sm transition-all ${turnoSeleccionado === turno ? "bg-white text-purple-700 shadow-md" : "text-gray-600"}`}
                  >
                    {turno === "Mañana" ? "☀️ Mañana" : "🌙 Tarde"}
                  </button>
                ))}
              </div>

              <div className="flex bg-gray-200 p-1 rounded-xl w-fit font-bold shadow-inner">
                {semanas.map((semana) => (
                  <button
                    key={semana}
                    onClick={() => setSemanaSeleccionada(semana)}
                    className={`px-4 py-1.5 rounded-lg text-sm transition-all ${semanaSeleccionada === semana ? "bg-purple-700 text-white shadow-md" : "text-gray-600"}`}
                  >
                    {semana}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* TABLAS DE LAS SECCIONES */}
          <div className="space-y-8">
            {seccionesActuales.map((seccion) => {
              const alumnosSeccion =
                estructuraPlantel[nivelSeleccionado][turnoSeleccionado][
                  seccion
                ] || [];
              return (
                <div
                  key={seccion}
                  className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="bg-white p-3 text-sm font-black text-purple-800 uppercase">
                    Nivel: {nivelSeleccionado} — Sección "{seccion}" (
                    {turnoSeleccionado})
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                          <th className="p-4 text-left">Nombre</th>
                          <th className="p-4 text-center">Género</th>
                          {diasSemana.map((dia) => (
                            <th
                              key={dia}
                              className="p-4 text-center font-black"
                            >
                              {dia}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {alumnosSeccion.map((estudiante) => (
                          <tr
                            key={estudiante.id}
                            className="hover:bg-gray-50/80 transition-colors"
                          >
                            <td className="p-4 font-bold text-gray-700 text-left">
                              {estudiante.nombre}
                            </td>
                            <td className="p-4 text-center text-gray-500">
                              {estudiante.sexo === "v" ? "V" : "H"}
                            </td>

                            {diasSemana.map((dia) => {
                              const asistio =
                                registroAsistencias[estudiante.id]?.[
                                  semanaSeleccionada
                                ]?.[dia] || false;
                              return (
                                <td key={dia} className="p-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={asistio}
                                    onChange={() =>
                                      handleAsistenciaChange(estudiante.id, dia)
                                    }
                                    className="w-6 h-6 rounded border-gray-300 text-purple-700 focus:ring-purple-500 cursor-pointer transition-all accent-purple-700"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* MODAL DE HISTORIAL ORIGINAL */}
      {showResumen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-blue-700 text-white shrink-0">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-black">
                    Historial Mensual de Asistencias
                  </h2>
                  <p className="text-purple-200 text-sm">
                    Registro consolidado por secciones y alumnos
                  </p>
                </div>
                <button
                  onClick={() => setShowResumen(false)}
                  className="text-3xl hover:text-gray-300"
                >
                  &times;
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center bg-blue-900/40 p-3 rounded-xl border border-purple-800">
                <div className="relative w-full sm:flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-300">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar alumno, nivel o sección..."
                    value={busquedaModal}
                    onChange={(e) => setBusquedaModal(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-blue-900/60 border border-blue-700 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />
                </div>
                <div className="flex bg-blue-900 p-1 rounded-lg border border-blue-700 font-bold text-xs">
                  <button
                    onClick={() => setVistaTabular(false)}
                    className={`px-3 py-1.5 rounded-md transition-all ${!vistaTabular ? "bg-purple-700 text-white shadow" : "text-purple-300 hover:text-white"}`}
                  >
                    📇 Fichas
                  </button>
                  <button
                    onClick={() => setVistaTabular(true)}
                    className={`px-3 py-1.5 rounded-md transition-all ${vistaTabular ? "bg-purple-700 text-white shadow" : "text-purple-300 hover:text-white"}`}
                  >
                    📊 Tabla
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-100 overflow-y-auto flex-1">
              {obtenerEstudiantesFiltradosModal().length === 0 ? (
                <div className="bg-white rounded-xl border p-12 text-center text-gray-400 italic shadow-sm">
                  No se hallaron resultados para "{busquedaModal}".
                </div>
              ) : !vistaTabular ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {obtenerEstudiantesFiltradosModal().map((alumno) => {
                    let total = 0;
                    semanas.forEach((s) =>
                      diasSemana.forEach((d) => {
                        if (registroAsistencias[alumno.id]?.[s]?.[d]) total++;
                      }),
                    );
                    return (
                      <div
                        key={alumno.id}
                        className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden"
                      >
                        <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-4 text-white flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded">
                              {alumno.nivel} — Sec. "{alumno.seccion}"
                            </span>
                            <h4 className="text-lg font-black mt-1">
                              {alumno.nombre}
                            </h4>
                          </div>
                          <p className="text-sm font-black text-green-300">
                            {Math.round((total / 20) * 100)}% Asistencia
                          </p>
                        </div>
                        <div className="p-4 space-y-2">
                          {semanas.map((sem) => (
                            <div
                              key={sem}
                              className="flex items-center bg-gray-50 rounded-lg p-2 gap-2 text-xs"
                            >
                              <span className="font-bold text-gray-500 w-16">
                                {sem}:
                              </span>
                              <div className="grid grid-cols-5 gap-1 w-full">
                                {diasSemana.map((dia) => {
                                  const v =
                                    registroAsistencias[alumno.id]?.[sem]?.[
                                      dia
                                    ];
                                  return (
                                    <div
                                      key={dia}
                                      className={`p-1 rounded text-center text-[10px] font-bold border ${v ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-100 text-red-500"}`}
                                    >
                                      {obtenerFechaFicticia(sem, dia)}
                                      <div>{v ? "✔️" : "❌"}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1200px] text-xs">
                      <thead className="bg-blue-700 text-white sticky top-0">
                        <tr>
                          <th className="p-3 sticky left-0 bg-blue-550 shadow-[2px_0_5px_rgba(0,0,0,0.1)] font-bold">
                            Estudiante
                          </th>
                          <th className="p-3 text-center">Aula / Sección</th>
                          {semanas.map((sem) => (
                            <th
                              key={sem}
                              colSpan={5}
                              className="text-center bg-purple-650 font-black p-1 text-[10px]"
                            >
                              {sem.toUpperCase()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {obtenerEstudiantesFiltradosModal().map((alumno) => (
                          <tr key={alumno.id} className="hover:bg-purple-50/40">
                            <td className="p-3 font-bold sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                              {alumno.nombre}
                            </td>
                            <td className="p-3 text-center text-gray-500 bg-gray-50/50">
                              {alumno.nivel} ("{alumno.seccion}")
                            </td>
                            {semanas.map((sem) =>
                              diasSemana.map((dia) => {
                                const v =
                                  registroAsistencias[alumno.id]?.[sem]?.[dia];
                                return (
                                  <td
                                    key={`${sem}-${dia}`}
                                    className={`p-1 text-center font-black ${v ? "bg-green-100 text-green-700" : "bg-red-50 text-red-300"}`}
                                  >
                                    {v ? "✓" : "•"}
                                  </td>
                                );
                              }),
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t flex justify-between items-center shrink-0">
              <span className="text-xs text-gray-500 font-bold">
                Total alumnos cargados:{" "}
                {obtenerEstudiantesFiltradosModal().length}
              </span>
              <button
                onClick={() => setShowResumen(false)}
                className="bg-gray-950 text-white px-6 py-2 rounded-lg font-bold hover:bg-black text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsistenciasDetalladas;