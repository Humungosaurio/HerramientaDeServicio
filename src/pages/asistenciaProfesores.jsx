import { useState } from 'react';
import { Link } from 'react-router-dom';

const AsistenciasPersonal = () => {
  // 1. Estados de control de la interfaz
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('Mañana');
  const [semanaSeleccionada, setSemanaSeleccionada] = useState('Semana 1');
  const [nuevoNombre, setNuevoNombre] = useState('');

  // Estado para controlar si el modo de edición/eliminación está activo
  const [modoEdicion, setModoEdicion] = useState(false);

  // NUEVO: Estado para activar/desactivar el orden alfabético
  const [ordenAlfabetico, setOrdenAlfabetico] = useState(false);

  // Estructura limpia: Cada turno tiene su lista de colaboradores/personal.
  const [datosPersonal, setDatosPersonal] = useState({
    Mañana: [],
    Tarde: []
  });

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const semanas = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];

  // 2. Manejador para cambiar la asistencia de un día en la semana activa
  const handleDiaChange = (id, dia) => {
    setDatosPersonal(prev => ({
      ...prev,
      [turnoSeleccionado]: prev[turnoSeleccionado].map(empleado =>
        empleado.id === id
          ? {
              ...empleado,
              asistencias: {
                ...empleado.asistencias,
                [semanaSeleccionada]: {
                  ...empleado.asistencias[semanaSeleccionada],
                  [dia]: !empleado.asistencias[semanaSeleccionada][dia]
                }
              }
            }
          : empleado
      )
    }));
  };

  // Agregar un nuevo miembro del personal con las 4 semanas inicializadas por separado
  const agregarPersonal = (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    const diasBase = { Lunes: false, Martes: false, Miércoles: false, Jueves: false, Viernes: false };

    const nuevoEmpleado = {
      id: Date.now(),
      nombre: nuevoNombre.trim(),
      asistencias: {
        'Semana 1': { ...diasBase },
        'Semana 2': { ...diasBase },
        'Semana 3': { ...diasBase },
        'Semana 4': { ...diasBase }
      }
    };

    setDatosPersonal(prev => ({
      ...prev,
      [turnoSeleccionado]: [...prev[turnoSeleccionado], nuevoEmpleado]
    }));
    setNuevoNombre('');
  };

  // Eliminar colaborador del turno activo por ID
  const eliminarColaborador = (id, nombre) => {
    const confirmar = window.confirm(`¿Está seguro de que desea eliminar a ${nombre} del turno de la ${turnoSeleccionado}?`);
    if (confirmar) {
      setDatosPersonal(prev => ({
        ...prev,
        [turnoSeleccionado]: prev[turnoSeleccionado].filter(empleado => empleado.id !== id)
      }));
    }
  };

  // Cuenta cuántos días asistió un empleado en la semana actual seleccionada
  const contarDiasAsistidos = (empleado, semana) => {
    const semanaDias = empleado.asistencias[semana] || {};
    return Object.values(semanaDias).filter(Boolean).length;
  };

  const guardarCambios = () => {
    alert(`Asistencias de la ${semanaSeleccionada} (${turnoSeleccionado}) sincronizadas correctamente.`);
  };

  // LÓGICA DE ORDENAMIENTO: Se ordena alfabéticamente si "ordenAlfabetico" es true, sino se mantiene por ID de registro
  const personalProcesado = [...datosPersonal[turnoSeleccionado]].sort((a, b) => {
    if (ordenAlfabetico) {
      return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
    }
    return a.id - b.id; // Orden por defecto (Fecha de creación)
  });

  return (
    <div className="p-8 page-transition relative">
      <div className="flex flex-col md:flex-row gap-6">

        {/* SIDEBAR / PANEL DE AGREGAR */}
        <aside className="md:w-1/4 bg-white/90 p-10 rounded-xl border border-gray-900 shadow-md h-fit">
          <h2 className="text-lg font-black text-gray-800 mb-4">Registrar Personal</h2>
          <form onSubmit={agregarPersonal} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold text-purple-600 uppercase">Nombre Completo</label>
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Ej. Carlos Mendoza"
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
              <p className="text-sm text-purple-600 font-bold uppercase tracking-widest">Módulo de Recursos Humanos</p>
              <h1 className="text-3xl font-black text-white">Control de Personal — {semanaSeleccionada}</h1>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button
                onClick={() => setModoEdicion(!modoEdicion)}
                className={`px-4 py-2 rounded-md font-bold shadow-md transition-all flex items-center active:scale-95 border ${
                  modoEdicion 
                    ? 'bg-red-600 hover:bg-red-800 text-white border-red-700' 
                    : 'bg-slate-600/50 hover:bg-slate-800 text-white border-slate-900'
                }`}
              >
                {modoEdicion ? '🛑 Salir de Edición' : '⚙️ Gestionar Personal'}
              </button>

              {/* NUEVO BOTÓN: Ubicado exactamente al lado de Gestionar Personal */}
              <button
                onClick={() => setOrdenAlfabetico(!ordenAlfabetico)}
                className={`px-2 py-1 rounded-md font-bold shadow-md transition-all flex items-center active:scale-95 border ${
                  ordenAlfabetico 
                    ? 'bg-purple-600 text-white border-gray-900 hover:bg-purple-800' 
                    : 'bg-blue-600 text-white border-gray-900 hover:bg-blue-800'
                }`}
              >
                {ordenAlfabetico ? '🔤 Ordenado: A-Z' : '📋 Orden: Por Registro'}
              </button>

              <Link to="/" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-bold hover:bg-gray-50 flex items-center shadow-sm">
                🏠 Volver al Inicio
              </Link>

              <button onClick={guardarCambios} className="bg-purple-600 hover:bg-purple-800 text-white px-6 py-2 rounded-md font-bold shadow-md transition-all active:scale-95">
                💾 Guardar Reporte
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
                  <th className="p-4 text-left">Colaborador / Empleado</th>
                  {diasSemana.map(dia => (
                    <th key={dia} className="p-4 text-center bg-purple-50/50 text-purple-900 font-black">{dia}</th>
                  ))}
                  <th className="p-4 text-center bg-purple-50 text-purple-700">Días Laborados</th>
                  {modoEdicion && <th className="p-4 text-center bg-red-50 text-red-700 font-black">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {personalProcesado.length === 0 ? (
                  <tr>
                    <td colSpan={modoEdicion ? "8" : "7"} className="p-8 text-center text-gray-400 italic">
                      No hay personal registrado en este turno.
                    </td>
                  </tr>
                ) : (
                  personalProcesado.map((empleado) => (
                    <tr key={empleado.id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-700 text-left">{empleado.nombre}</td>

                      {/* Celdas con los Switches deslizantes */}
                      {diasSemana.map(dia => {
                        const asistioEseDia = empleado.asistencias[semanaSeleccionada]?.[dia] || false;
                        return (
                          <td key={dia} className="p-4 text-center">
                            <div className="flex justify-center items-center min-h-[40px]">
                              <label className="inline-flex items-center justify-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={asistioEseDia}
                                  onChange={() => handleDiaChange(empleado.id, dia)}
                                  className="sr-only peer"
                                  disabled={modoEdicion}
                                />
                                {/* El Switch Deslizante */}
                                <div className={`w-10 h-6 flex items-center bg-gray-200 rounded-full p-0.5 duration-300 ease-in-out peer-checked:bg-green-500 after:bg-white after:w-5 after:h-5 after:rounded-full after:shadow-md after:duration-300 peer-checked:after:translate-x-4 ${modoEdicion ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                              </label>
                            </div>
                          </td>
                        );
                      })}

                      {/* Contador total de la semana seleccionada */}
                      <td className="p-4 bg-purple-50/50 font-black text-purple-700 text-center text-lg">
                        {contarDiasAsistidos(empleado, semanaSeleccionada)} / 5
                      </td>

                      {/* Botón de eliminación en Modo Edición */}
                      {modoEdicion && (
                        <td className="p-4 text-center bg-red-50/30">
                          <button
                            onClick={() => eliminarColaborador(empleado.id, empleado.nombre)}
                            className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 hover:text-red-800 transition-colors border border-red-200 shadow-sm active:scale-95"
                            title="Eliminar del personal"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AsistenciasPersonal;