import { useState } from 'react';
import { Link } from 'react-router-dom';

const AsistenciasProfesores = () => {
  // 1. Estados de control de la interfaz
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('Mañana');
  const [semanaSeleccionada, setSemanaSeleccionada] = useState('Semana 1');
  const [showResumen, setShowResumen] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');

  // Estructura limpia: Cada turno tiene su lista de profesores.
  const [datosProfesores, setDatosProfesores] = useState({
    Mañana: [],
    Tarde: []
  });

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const semanas = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];

  // 2. Manejador para cambiar la asistencia de un día en la semana activa
  const handleDiaChange = (id, dia) => {
    setDatosProfesores(prev => ({
      ...prev,
      [turnoSeleccionado]: prev[turnoSeleccionado].map(profesor =>
        profesor.id === id
          ? {
            ...profesor,
            asistencias: {
              ...profesor.asistencias,
              [semanaSeleccionada]: {
                ...profesor.asistencias[semanaSeleccionada],
                [dia]: !profesor.asistencias[semanaSeleccionada][dia]
              }
            }
          }
          : profesor
      )
    }));
  };

  // Agregar un nuevo profesor con las 4 semanas inicializadas por separado
  const agregarProfesor = (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    const diasBase = { Lunes: false, Martes: false, Miércoles: false, Jueves: false, Viernes: false };

    const nuevoProfesor = {
      id: Date.now(),
      nombre: nuevoNombre.trim(),
      asistencias: {
        'Semana 1': { ...diasBase },
        'Semana 2': { ...diasBase },
        'Semana 3': { ...diasBase },
        'Semana 4': { ...diasBase }
      }
    };

    setDatosProfesores(prev => ({
      ...prev,
      [turnoSeleccionado]: [...prev[turnoSeleccionado], nuevoProfesor]
    }));
    setNuevoNombre('');
  };

  // Cuenta cuántos días asistió un profesor en la semana actual seleccionada
  const contarDiasAsistidos = (profesor, semana) => {
    const semanaDias = profesor.asistencias[semana] || {};
    return Object.values(semanaDias).filter(Boolean).length;
  };

  const guardarCambios = () => {
    alert(`Asistencias de la ${semanaSeleccionada} (${turnoSeleccionado}) sincronizadas correctamente.`);
  };

  return (
    <div className="p-8 page-transition relative">
      <div className="flex flex-col md:flex-row gap-6">

        {/* SIDEBAR / PANEL DE AGREGAR */}
        <aside className="md:w-1/4 bg-white p-6 rounded-xl border border-gray-100 shadow-md h-fit">
          <h2 className="text-lg font-black text-gray-800 mb-4">Agregar Profesor</h2>
          <form onSubmit={agregarProfesor} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold text-purple-600 uppercase">Nombre Completo</label>
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Ej. Prof. Juan Paul"
                className="w-full mt-1 p-2 border rounded-lg text-sm text-gray-700 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              type="submit"
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all shadow-md"
            >
              + Añadir al Turno
            </button>
          </form>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1">
          <header className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-end border-b pb-4 gap-4">
            <div>
              <p className="text-sm text-purple-600 font-bold uppercase tracking-widest">Módulo de Personal</p>
              <h1 className="text-3xl font-black text-white">Asistencia — {semanaSeleccionada}</h1>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowResumen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-bold shadow-md transition-all flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Ver Totales
              </button>

              <Link to="/" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-bold hover:bg-gray-50 flex items-center">
                Inicio
              </Link>

              <button onClick={guardarCambios} className="bg-purple-600 hover:bg-purple-800 text-white px-6 py-2 rounded-md font-bold shadow-md">
                Guardar Reporte
              </button>
            </div>
          </header>

          {/* SELECTORES DE TURNO Y SEMANA */}
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Selector de Turno */}
            <div className="flex bg-gray-200 p-1 rounded-xl w-fit font-bold shadow-inner">
              <button
                onClick={() => setTurnoSeleccionado('Mañana')}
                className={`px-6 py-2 rounded-lg transition-all ${turnoSeleccionado === 'Mañana' ? 'bg-white text-purple-700 shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
              >
                ☀️ Mañana
              </button>
              <button
                onClick={() => setTurnoSeleccionado('Tarde')}
                className={`px-6 py-2 rounded-lg transition-all ${turnoSeleccionado === 'Tarde' ? 'bg-white text-purple-700 shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
              >
                🌙 Tarde
              </button>
            </div>

            {/* Selector de Semana */}
            <div className="flex bg-gray-200 p-1 rounded-xl w-fit font-bold shadow-inner">
              {semanas.map((semana) => (
                <button
                  key={semana}
                  onClick={() => setSemanaSeleccionada(semana)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${semanaSeleccionada === semana ? 'bg-purple-700 text-white shadow-md' : 'text-gray-600 hover:text-purple-700'}`}
                >
                  {semana}
                </button>
              ))}
            </div>
          </div>

          {/* TABLA DE ASISTENCIA SEMANAL */}
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-purple-50 p-3 border-b text-xs font-bold text-purple-800 uppercase tracking-wider">
              Modificando datos de: <span className="underline">{semanaSeleccionada}</span> — Turno <span className="underline">{turnoSeleccionado}</span>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="p-4 text-left">Profesor / Docente</th>
                  {diasSemana.map(dia => (
                    <th key={dia} className="p-4 text-center bg-purple-50/50 text-purple-900 font-black">{dia}</th>
                  ))}
                  <th className="p-4 text-center bg-purple-50 text-purple-700">Días Semanales</th>
                </tr>
              </thead>
              <tbody>
                {datosProfesores[turnoSeleccionado].length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-400 italic">
                      No hay profesores registrados en este turno.
                    </td>
                  </tr>
                ) : (
                  datosProfesores[turnoSeleccionado].map((profesor) => (
                    <tr key={profesor.id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-700 text-left">{profesor.nombre}</td>

                      {/* Celdas con los Switches deslizantes (Estilo Estudiantes) */}
                      {diasSemana.map(dia => {
                        const asistioEseDia = profesor.asistencias[semanaSeleccionada]?.[dia] || false;
                        return (
                          <td key={dia} className="p-4 text-center">
                            <div className="flex justify-center items-center min-h-[40px]">
                              <label className="inline-flex items-center justify-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={asistioEseDia}
                                  onChange={() => handleDiaChange(profesor.id, dia)}
                                  className="sr-only peer"
                                />
                                {/* El Switch Deslizante */}
                                <div className="w-10 h-6 flex items-center bg-gray-200 rounded-full p-0.5 duration-300 ease-in-out peer-checked:bg-green-500 after:bg-white after:w-5 after:h-5 after:rounded-full after:shadow-md after:duration-300 peer-checked:after:translate-x-4"></div>
                              </label>
                            </div>
                          </td>
                        );
                      })}

                      {/* Contador total de la semana seleccionada */}
                      <td className="p-4 bg-purple-50/50 font-black text-purple-700 text-center text-lg">
                        {contarDiasAsistidos(profesor, semanaSeleccionada)} / 5
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* MODAL DE RESUMEN GENERAL */}
      {showResumen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
            <div className="p-6 border-b bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">Resumen Completo Mensual</h2>
                <p className="text-blue-100 text-sm">Desglose de asistencia por Profesor de las 4 Semanas</p>
              </div>
              <button onClick={() => setShowResumen(false)} className="text-3xl hover:text-gray-200">&times;</button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Columna Turno Mañana */}
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                  <h3 className="text-lg font-black text-gray-800 border-b pb-2 mb-4 flex justify-between">
                    <span>Turno Mañana ☀️</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md">Total: {datosProfesores.Mañana.length} Docentes</span>
                  </h3>
                  {datosProfesores.Mañana.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-2">Sin registros de personal.</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {datosProfesores.Mañana.map(p => (
                        <div key={p.id} className="bg-gray-50 p-4 rounded-xl border">
                          <p className="font-bold text-purple-700 text-base mb-2">{p.nombre}</p>
                          <div className="grid grid-cols-1 gap-2">
                            {semanas.map(sem => (
                              <div key={sem} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs border-b border-dashed pb-1 last:border-0">
                                <span className="font-bold text-gray-500 w-20">{sem}:</span>
                                <div className="flex gap-1 mt-1 sm:mt-0">
                                  {diasSemana.map(dia => (
                                    <span
                                      key={dia}
                                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${p.asistencias[sem]?.[dia] ? 'bg-green-100 text-green-700 font-black' : 'bg-red-100 text-red-400 line-through'
                                        }`}
                                    >
                                      {dia.substring(0, 3)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Columna Turno Tarde */}
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                  <h3 className="text-lg font-black text-gray-800 border-b pb-2 mb-4 flex justify-between">
                    <span>Turno Tarde 🌙</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-md">Total: {datosProfesores.Tarde.length} Docentes</span>
                  </h3>
                  {datosProfesores.Tarde.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-2">Sin registros de personal.</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {datosProfesores.Tarde.map(p => (
                        <div key={p.id} className="bg-gray-50 p-4 rounded-xl border">
                          <p className="font-bold text-purple-700 text-base mb-2">{p.nombre}</p>
                          <div className="grid grid-cols-1 gap-2">
                            {semanas.map(sem => (
                              <div key={sem} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs border-b border-dashed pb-1 last:border-0">
                                <span className="font-bold text-gray-500 w-20">{sem}:</span>
                                <div className="flex gap-1 mt-1 sm:mt-0">
                                  {diasSemana.map(dia => (
                                    <span
                                      key={dia}
                                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${p.asistencias[sem]?.[dia] ? 'bg-green-100 text-green-700 font-black' : 'bg-red-100 text-red-400 line-through'
                                        }`}
                                    >
                                      {dia.substring(0, 3)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div className="p-4 bg-gray-50 flex justify-end border-t">
              <button
                onClick={() => setShowResumen(false)}
                className="bg-gray-800 text-white px-8 py-2 rounded-lg font-bold hover:bg-black transition-all"
              >
                Cerrar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsistenciasProfesores;