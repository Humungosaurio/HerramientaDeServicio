import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AsistenciasPersonal = () => {
  // 1. Estados de control
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('Mañana');
  const [semanaSeleccionada, setSemanaSeleccionada] = useState('Semana 1');
  const [mesSeleccionado, setMesSeleccionado] = useState('Junio');

  // Estados del formulario
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [horasAdministrativas, setHorasAdministrativas] = useState('');

  // Modos visuales
  const [modoEdicion, setModoEdicion] = useState(false);
  const [ordenAlfabetico, setOrdenAlfabetico] = useState(false);

  const [datosPersonal, setDatosPersonal] = useState({
    Mañana: [],
    Tarde: []
  });

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const semanas = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const META_HORAS_SEMANALES = 35;

  // 2. FUNCIONES DE CÁLCULO DE TIEMPO REVISADAS
  const calcularHorasDia = (entrada, salida) => {
    if (!entrada || !salida) return 0;

    const [hEntrada, mEntrada] = entrada.split(':').map(Number);
    const [hSalida, mSalida] = salida.split(':').map(Number);

    let minutosEntrada = hEntrada * 60 + mEntrada;
    let minutosSalida = hSalida * 60 + mSalida;

    // Si la salida es menor que la entrada, cruzó la medianoche (ej: entra 10 PM, sale 2 AM)
    if (minutosSalida < minutosEntrada) {
      minutosSalida += 24 * 60;
    }

    // Si por alguna razón son idénticos, es 0
    if (minutosSalida === minutosEntrada) return 0;

    return parseFloat(((minutosSalida - minutosEntrada) / 60).toFixed(2));
  };

  const calcularHorasSemanales = (empleado) => {
    const dias = empleado.asistencia || {};
    const total = Object.values(dias).reduce((acumulador, horasDia) => {
      return acumulador + calcularHorasDia(horasDia.entrada, horasDia.salida);
    }, 0);
    return parseFloat(total.toFixed(2));
  };

  const handleTiempoChange = (cedulaEmpleado, dia, campo, valor) => {
    setDatosPersonal(prev => ({
      ...prev,
      [turnoSeleccionado]: prev[turnoSeleccionado].map(empleado =>
        empleado.cedula === cedulaEmpleado
          ? {
              ...empleado,
              asistencia: {
                ...empleado.asistencia,
                [dia]: {
                  ...empleado.asistencia[dia],
                  [campo]: valor
                }
              }
            }
          : empleado
      )
    }));
  };

  const cargarAsistencias = async () => {
    try {
      const parametros = { turno: turnoSeleccionado, mes: mesSeleccionado, semana: semanaSeleccionada };
      console.log("Cargando matriz con parámetros:", parametros);
    } catch (error) {
      console.error("Error al cargar asistencias:", error);
    }
  };

  useEffect(() => {
    cargarAsistencias();
  }, [turnoSeleccionado, mesSeleccionado, semanaSeleccionada]);

  const agregarPersonal = async (e) => {
    e.preventDefault();
    if (!cedula || !nombre.trim() || !cargo.trim() || !horasAdministrativas) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    const diasBaseHoras = {
      Lunes: { entrada: '', salida: '' }, Martes: { entrada: '', salida: '' },
      Miércoles: { entrada: '', salida: '' }, Jueves: { entrada: '', salida: '' },
      Viernes: { entrada: '', salida: '' }
    };

    const nuevoEmpleado = {
      cedula: parseInt(cedula), nombre: nombre.trim(), cargo: cargo.trim(),
      horas_administrativas: parseInt(horasAdministrativas), asistencia: diasBaseHoras
    };

    setDatosPersonal(prev => ({
      ...prev,
      [turnoSeleccionado]: [...prev[turnoSeleccionado], nuevoEmpleado]
    }));

    setCedula(''); setNombre(''); setCargo(''); setHorasAdministrativas('');
  };

  const guardarCambios = async () => {
    const payload = {
      mes: mesSeleccionado, semana: semanaSeleccionada,
      registros: datosPersonal[turnoSeleccionado].map(empleado => ({
        cedula: empleado.cedula, asistencia: empleado.asistencia 
      }))
    };
    console.log("Payload enviado a guardar_asistencias_personal:", payload);
    alert(`Horarios de la ${semanaSeleccionada} guardados con éxito.`);
  };

  const personalProcesado = [...datosPersonal[turnoSeleccionado]].sort((a, b) => {
    if (ordenAlfabetico) return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
    return a.cedula - b.cedula; 
  });

  // El estilo de fondo (bg-slate-900) fue eliminado para respetar el diseño de tu app
  return (
    <div className="p-8 page-transition relative">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* PANEL DE REGISTRO */}
        <aside className="lg:w-1/4 bg-white p-6 rounded-xl border border-gray-200 shadow-lg h-fit text-gray-800">
          <h2 className="text-lg font-black text-gray-800 mb-4">Registrar Personal</h2>
          <form onSubmit={agregarPersonal} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold text-purple-600 uppercase">Cédula</label>
              <input type="number" value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="Ej. 27123456" className="w-full mt-1 p-2 border rounded-lg text-sm text-gray-700 focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-purple-600 uppercase">Nombre Completo</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Carlos Mendoza" className="w-full mt-1 p-2 border rounded-lg text-sm text-gray-700 focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-purple-600 uppercase">Cargo</label>
              <input type="text" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ej. Profesor" className="w-full mt-1 p-2 border rounded-lg text-sm text-gray-700 focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-purple-600 uppercase">Horas Administrativas</label>
              <input type="number" value={horasAdministrativas} onChange={(e) => setHorasAdministrativas(e.target.value)} placeholder="Ej. 36" className="w-full mt-1 p-2 border rounded-lg text-sm text-gray-700 focus:outline-none focus:border-purple-500" />
            </div>
            <button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all shadow-md mt-2">
              + Registrar en Turno
            </button>
          </form>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-x-auto">
          <header className="mb-6 flex flex-col xl:flex-row xl:justify-between xl:items-end border-b pb-4 gap-4">
            <div>
              <p className="text-sm text-purple-600 font-bold uppercase tracking-widest">Módulo de Recursos Humanos</p>
              <h1 className="text-3xl font-black text-white">Control de Personal — {semanaSeleccionada}</h1>
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end text-sm">
              <button
                onClick={() => setModoEdicion(!modoEdicion)}
                className={`px-4 py-2 rounded-md font-bold shadow-md transition-all border ${
                  modoEdicion ? 'bg-red-600 hover:bg-red-700 text-white border-red-800' : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-800'
                }`}
              >
                {modoEdicion ? '🛑 Bloquear Campos' : '⚙️ Editar Horarios'}
              </button>

              <button
                onClick={() => setOrdenAlfabetico(!ordenAlfabetico)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-bold border border-blue-700"
              >
                {ordenAlfabetico ? '🔤 Orden: A-Z' : '📋 Orden: Cédula'}
              </button>

              {/* Aquí está el botón de volver atrás que faltaba */}
              <Link to="/" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-bold hover:bg-gray-50 flex items-center shadow-sm">
                🏠 Volver al Inicio
              </Link>

              <button onClick={guardarCambios} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-bold shadow-md">
                💾 Guardar Reporte
              </button>
            </div>
          </header>

          {/* FILTROS DE NAVEGACIÓN (Colores corregidos al estilo claro original) */}
          <div className="flex flex-wrap gap-4 mb-4 text-gray-800">
            <div className="flex bg-gray-200 p-1 rounded-xl font-bold shadow-inner border border-gray-300">
              <button onClick={() => setTurnoSeleccionado('Mañana')} className={`px-4 py-1.5 rounded-lg text-sm transition-all ${turnoSeleccionado === 'Mañana' ? 'bg-white text-purple-700 shadow-md' : 'text-gray-600 hover:text-gray-900'}`}>
                ☀️ Mañana
              </button>
              <button onClick={() => setTurnoSeleccionado('Tarde')} className={`px-4 py-1.5 rounded-lg text-sm transition-all ${turnoSeleccionado === 'Tarde' ? 'bg-white text-purple-700 shadow-md' : 'text-gray-600 hover:text-gray-900'}`}>
                🌙 Tarde
              </button>
            </div>

            <div className="flex bg-gray-200 p-1 rounded-xl font-bold border border-gray-300">
              <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)} className="bg-transparent text-sm text-gray-800 px-3 py-1 focus:outline-none font-bold cursor-pointer">
                {meses.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="flex bg-gray-200 p-1 rounded-xl font-bold border border-gray-300 overflow-x-auto">
              {semanas.map((semana) => (
                <button key={semana} onClick={() => setSemanaSeleccionada(semana)} className={`px-3 py-1 rounded-lg text-xs transition-all ${semanaSeleccionada === semana ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:text-purple-700'}`}>
                  {semana}
                </button>
              ))}
            </div>
          </div>

          {/* TABLA DE ASISTENCIA */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden text-gray-800">
            <div className="bg-purple-50 p-3 border-b text-xs font-bold text-purple-800 uppercase tracking-wider">
              Registro por bloques horarios (Meta Semanal: {META_HORAS_SEMANALES} Horas)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-100 text-gray-500 text-xs uppercase border-b">
                  <tr>
                    <th className="p-4 text-left w-1/5">Colaborador</th>
                    {diasSemana.map(dia => (
                      <th key={dia} className="p-3 text-center bg-purple-50/30 text-purple-900 font-black w-[13%]">{dia}</th>
                    ))}
                    <th className="p-4 text-center bg-purple-100 text-purple-800 w-[15%]">Total Semanal</th>
                  </tr>
                </thead>
                <tbody>
                  {personalProcesado.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400 italic">
                        No hay personal registrado en este bloque.
                      </td>
                    </tr>
                  ) : (
                    personalProcesado.map((empleado) => {
                      const horasAcumuladas = calcularHorasSemanales(empleado);
                      const cumpleMeta = horasAcumuladas >= META_HORAS_SEMANALES;
                      // Cálculo de porcentaje para la barra de progreso
                      const porcentaje = Math.min((horasAcumuladas / META_HORAS_SEMANALES) * 100, 100);

                      return (
                        <tr key={empleado.cedula} className="border-t hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-left">
                            <div className="font-bold text-gray-900">{empleado.nombre}</div>
                            <div className="text-xs text-gray-500">V-{empleado.cedula} | {empleado.cargo}</div>
                            <div className="text-[11px] text-purple-700 font-bold mt-1">{empleado.horas_administrativas}h Adm. Asignadas</div>
                          </td>

                          {diasSemana.map(dia => {
                            const diaData = empleado.asistencia?.[dia] || { entrada: '', salida: '' };
                            const horasDelDia = calcularHorasDia(diaData.entrada, diaData.salida);

                            return (
                              <td key={dia} className="p-2 text-center bg-purple-50/10 border-x border-gray-100">
                                <div className="flex flex-col gap-1 items-center justify-center">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-bold text-gray-400 w-3">E:</span>
                                    <input
                                      type="time" value={diaData.entrada} disabled={!modoEdicion}
                                      onChange={(e) => handleTiempoChange(empleado.cedula, dia, 'entrada', e.target.value)}
                                      className={`p-1 text-xs rounded border border-gray-300 bg-white text-gray-800 focus:outline-purple-500 ${!modoEdicion ? 'bg-gray-50 text-gray-500 border-dashed cursor-not-allowed' : ''}`}
                                    />
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-bold text-gray-400 w-3">S:</span>
                                    <input
                                      type="time" value={diaData.salida} disabled={!modoEdicion}
                                      onChange={(e) => handleTiempoChange(empleado.cedula, dia, 'salida', e.target.value)}
                                      className={`p-1 text-xs rounded border border-gray-300 bg-white text-gray-800 focus:outline-purple-500 ${!modoEdicion ? 'bg-gray-50 text-gray-500 border-dashed cursor-not-allowed' : ''}`}
                                    />
                                  </div>
                                  {horasDelDia > 0 && (
                                    <span className="text-[10px] mt-1 bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full font-bold">
                                      +{horasDelDia} hrs
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}

                          {/* BARRA DE HORAS TOTALES */}
                          <td className={`p-4 font-black text-center border-l transition-colors ${cumpleMeta ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                            <div className="text-xl font-extrabold">{horasAcumuladas} h</div>
                            <div className="text-[10px] uppercase tracking-wider font-bold mt-1">de {META_HORAS_SEMANALES} h meta</div>
                            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden max-w-[100px] mx-auto relative">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${cumpleMeta ? 'bg-green-600' : 'bg-amber-500'}`}
                                style={{ width: `${porcentaje}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AsistenciasPersonal;