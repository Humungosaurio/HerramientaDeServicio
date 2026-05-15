import { useState } from 'react';
import { Link } from 'react-router-dom';

const Asistencias = () => {
  // 1. Estados de control de la interfaz
  const [nivelSeleccionado, setNivelSeleccionado] = useState('Maternal');
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('Mañana'); 
  const [semanaSeleccionada, setSemanaSeleccionada] = useState('Semana 1');
  const [diaSeleccionado, setDiaSeleccionado] = useState('Lunes');
  const [showResumen, setShowResumen] = useState(false);

  const niveles = ['Maternal', '1er Nivel', '2do Nivel', '3er Nivel'];
  const turnos = ['Mañana', 'Tarde'];
  const semanas = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  // Función auxiliar para inicializar la estructura de datos vacía por semana y día
  const generarEstructuraSemanas = () => {
    const estructura = {};
    semanas.forEach(semana => {
      estructura[semana] = {};
      diasSemana.forEach(dia => {
        estructura[semana][dia] = { v: 0, h: 0 };
      });
    });
    return estructura;
  };

  // 2. Estado de asistencias estructurado por Nivel -> Turno -> Sección -> Semana -> Día
  const [datosPorNivel, setDatosPorNivel] = useState({
    'Maternal': {
      Mañana: { A: generarEstructuraSemanas() },
      Tarde: { A: generarEstructuraSemanas() }
    },
    '1er Nivel': {
      Mañana: { A: generarEstructuraSemanas(), B: generarEstructuraSemanas() },
      Tarde: { A: generarEstructuraSemanas(), B: generarEstructuraSemanas() }
    },
    '2do Nivel': {
      Mañana: { A: generarEstructuraSemanas(), B: generarEstructuraSemanas() },
      Tarde: { A: generarEstructuraSemanas(), B: generarEstructuraSemanas() }
    },
    '3er Nivel': {
      Mañana: { A: generarEstructuraSemanas(), B: generarEstructuraSemanas() },
      Tarde: { A: generarEstructuraSemanas() }
    }
  });

  // 3. Manejador de cambios en los inputs
  const handleInputChange = (seccion, campo, valor) => {
    const numValue = Math.max(0, parseInt(valor) || 0);
    setDatosPorNivel(prev => ({
      ...prev,
      [nivelSeleccionado]: {
        ...prev[nivelSeleccionado],
        [turnoSeleccionado]: {
          ...prev[nivelSeleccionado][turnoSeleccionado],
          [seccion]: {
            ...prev[nivelSeleccionado][turnoSeleccionado][seccion],
            [semanaSeleccionada]: {
              ...prev[nivelSeleccionado][turnoSeleccionado][seccion][semanaSeleccionada],
              [diaSeleccionado]: {
                ...prev[nivelSeleccionado][turnoSeleccionado][seccion][semanaSeleccionada][diaSeleccionado],
                [campo]: numValue
              }
            }
          }
        }
      }
    }));
  };

  // 4. Calcula los totales consolidados de una combinación específica de Nivel, Semana y Día (Suma todas las secciones y turnos)
  const calcularTotalesPorDia = (nivel, semana, dia) => {
    let v = 0;
    let h = 0;

    if (!datosPorNivel[nivel]) return { v, h, t: 0 };

    Object.keys(datosPorNivel[nivel]).forEach(turno => {
      Object.keys(datosPorNivel[nivel][turno]).forEach(seccion => {
        const registroDia = datosPorNivel[nivel][turno][seccion]?.[semana]?.[dia] || { v: 0, h: 0 };
        v += registroDia.v || 0;
        h += registroDia.h || 0;
      });
    });

    return { v, h, t: v + h };
  };

  // 5. Calcula el gran total acumulado de una semana completa para un nivel
  const calcularTotalSemanalNivel = (nivel, semana) => {
    let total = 0;
    diasSemana.forEach(dia => {
      total += calcularTotalesPorDia(nivel, semana, dia).t;
    });
    return total;
  };

  const guardarCambios = () => {
    alert(`Asistencias de ${nivelSeleccionado} (${turnoSeleccionado}) - ${semanaSeleccionada} / ${diaSeleccionado} guardadas.`);
  };

  return (
    <div className="p-8 page-transition relative">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* SIDEBAR DE NIVELES */}
        <aside className="md:w-1/4 flex md:flex-col overflow-x-auto gap-2">
          {niveles.map((nivel) => (
            <button
              key={nivel}
              onClick={() => setNivelSeleccionado(nivel)}
              className={`px-4 py-3 rounded-lg text-left font-bold transition-all ${
                nivelSeleccionado === nivel 
                ? 'bg-purple-700 text-white shadow-lg scale-105' 
                : 'text-gray-600 hover:bg-purple-50 bg-white border border-gray-100'
              }`}
            >
              {nivel}
            </button>
          ))}
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1">
          <header className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-end border-b pb-4 gap-4">
            <div>
              <p className="text-sm text-purple-600 font-bold uppercase tracking-widest">Módulo Inicial (Estudiantes)</p>
              <h1 className="text-3xl font-black text-white">
                {nivelSeleccionado} — {semanaSeleccionada}
              </h1>
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
                Ver Cronograma Mensual
              </button>

              <Link to="/" className="bg-white border border-gray-300 text-gray-707 px-4 py-2 rounded-md font-bold hover:bg-gray-50 flex items-center">
                Inicio
              </Link>

              <button onClick={guardarCambios} className="bg-purple-600 hover:bg-purple-800 text-white px-6 py-2 rounded-md font-bold shadow-md">
                Guardar Reporte
              </button>
            </div>
          </header>

          {/* CONTROLES FILTROS */}
          <div className="flex flex-col gap-4 mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex flex-wrap gap-4">
              <div className="flex bg-gray-200 p-1 rounded-xl w-fit font-bold shadow-inner">
                {turnos.map(turno => (
                  <button
                    key={turno}
                    onClick={() => setTurnoSeleccionado(turno)}
                    className={`px-5 py-1.5 rounded-lg text-sm transition-all ${turnoSeleccionado === turno ? 'bg-white text-purple-700 shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {turno === 'Mañana' ? '☀️ Mañana' : '🌙 Tarde'}
                  </button>
                ))}
              </div>

              <div className="flex bg-gray-200 p-1 rounded-xl w-fit font-bold shadow-inner">
                {semanas.map((semana) => (
                  <button
                    key={semana}
                    onClick={() => setSemanaSeleccionada(semana)}
                    className={`px-4 py-1.5 rounded-lg text-sm transition-all ${semanaSeleccionada === semana ? 'bg-purple-700 text-white shadow-md' : 'text-gray-600 hover:text-purple-700'}`}
                  >
                    {semana}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap bg-gray-200 p-1 rounded-xl w-fit font-bold shadow-inner">
              {diasSemana.map((dia) => (
                <button
                  key={dia}
                  onClick={() => setDiaSeleccionado(dia)}
                  className={`px-4 py-2 rounded-lg text-xs transition-all ${diaSeleccionado === dia ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:text-indigo-900'}`}
                >
                  {dia}
                </button>
              ))}
            </div>
          </div>

          {/* TABLA DINÁMICA DE ENTRADA */}
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-purple-50 p-3 border-b text-xs font-bold text-purple-800 uppercase tracking-wider flex justify-between">
              <span>Nivel: {nivelSeleccionado} ({turnoSeleccionado})</span>
              <span className="text-indigo-700">Editando: {semanaSeleccionada} — {diaSeleccionado}</span>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="p-4 text-left">Sección</th>
                  <th className="p-4 text-center">Varones</th>
                  <th className="p-4 text-center">Hembras</th>
                  <th className="p-4 text-center bg-purple-50 text-purple-700">Total Día</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(datosPorNivel[nivelSeleccionado][turnoSeleccionado]).map((seccion) => {
                  const registroDia = datosPorNivel[nivelSeleccionado][turnoSeleccionado][seccion][semanaSeleccionada]?.[diaSeleccionado] || { v: 0, h: 0 };
                  const { v, h } = registroDia;
                  
                  return (
                    <tr key={seccion} className="border-t hover:bg-gray-50 transition-colors text-center">
                      <td className="p-4 font-bold text-gray-700 text-left">Sección {seccion}</td>
                      <td className="p-4">
                        <input 
                          type="number" 
                          value={v === 0 ? '' : v} 
                          placeholder="0" 
                          onChange={(e) => handleInputChange(seccion, 'v', e.target.value)} 
                          className="w-24 p-2 border rounded text-center text-gray-800 font-semibold focus:ring-2 focus:ring-purple-400 focus:outline-none"
                        />
                      </td>
                      <td className="p-4">
                        <input 
                          type="number" 
                          value={h === 0 ? '' : h} 
                          placeholder="0" 
                          onChange={(e) => handleInputChange(seccion, 'h', e.target.value)} 
                          className="w-24 p-2 border rounded text-center text-gray-800 font-semibold focus:ring-2 focus:ring-purple-400 focus:outline-none"
                        />
                      </td>
                      <td className="p-4 font-black text-purple-700 text-xl">{v + h}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* MODAL DE RESUMEN DETALLADO CRONOLÓGICO */}
      {showResumen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden">
            <div className="p-6 border-b bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">Reporte General de Asistencia Estudiantil</h2>
                <p className="text-blue-100 text-sm">Cronograma detallado por Semanas y Días (Matrícula Consolidada de Secciones)</p>
              </div>
              <button onClick={() => setShowResumen(false)} className="text-3xl hover:text-gray-200">&times;</button>
            </div>
            
            <div className="p-6 bg-gray-100 max-h-[75vh] overflow-y-auto flex flex-col gap-8">
              {niveles.map((nivel) => (
                <div key={nivel} className="bg-white border rounded-2xl p-6 shadow-sm">
                  <div className="border-b pb-2 mb-4">
                    <h3 className="text-2xl font-black text-purple-800">{nivel}</h3>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Desglose Estadístico Mensual</p>
                  </div>

                  {/* Grid de Semanas (1 al 4) */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {semanas.map((sem) => (
                      <div key={sem} className="bg-gray-50 rounded-xl border p-4">
                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                          <span className="font-extrabold text-gray-700 uppercase text-sm tracking-wide">{sem}</span>
                          <span className="text-xs font-black bg-purple-100 text-purple-800 px-2 py-1 rounded-md">
                            Total Semana: {calcularTotalSemanalNivel(nivel, sem)} alumnos
                          </span>
                        </div>

                        {/* Fila de días */}
                        <div className="grid grid-cols-5 gap-2 text-center">
                          {diasSemana.map((dia) => {
                            const totalDia = calcularTotalesPorDia(nivel, sem, dia);
                            return (
                              <div key={dia} className="bg-white border rounded-lg p-2 flex flex-col justify-between shadow-sm">
                                <p className="text-[10px] font-black uppercase text-indigo-600 tracking-tight border-b pb-1 mb-1">
                                  {dia.substring(0, 3)}
                                </p>
                                <div className="text-[10px] text-gray-500 space-y-0.5 font-medium">
                                  <p><span className="text-blue-500 font-bold">V:</span> {totalDia.v}</p>
                                  <p><span className="text-pink-500 font-bold">H:</span> {totalDia.h}</p>
                                </div>
                                <div className="mt-1.5 pt-1 border-t bg-gray-50 rounded font-black text-xs text-gray-800">
                                  T: {totalDia.t}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white flex justify-end border-t">
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

export default Asistencias;