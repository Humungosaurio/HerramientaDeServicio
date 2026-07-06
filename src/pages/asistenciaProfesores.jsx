import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AsistenciasPersonal = () => {
  // 1. Estados de control y navegación
  const [vistaActual, setVistaActual] = useState('asistencia'); // 'asistencia' | 'administracion'
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('Mañana');
  const [semanaSeleccionada, setSemanaSeleccionada] = useState('Semana 1');
  const [mesSeleccionado, setMesSeleccionado] = useState('Junio');

  // Estados del formulario de registro (Sin horas administrativas)
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('');

  // Modos visuales
  const [modoEdicion, setModoEdicion] = useState(false);
  const [ordenAlfabetico, setOrdenAlfabetico] = useState(false);

  // Lista de personal obtenida del backend
  const [personal, setPersonal] = useState([]);

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const semanas = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const META_HORAS_SEMANALES = 35;

  // 2. FUNCIÓN DE CARGA DESDE EL BACKEND
  const cargarAsistencias = async () => {
    try {
      const parametros = { 
        turno: turnoSeleccionado, 
        mes: mesSeleccionado, 
        semana: semanaSeleccionada 
      };

      if (window.pywebview && window.pywebview.api) {
        const res = await window.pywebview.api.cargar_matriz_asistencia_personal(parametros);
        if (res.status === 'success') {
          const datosAdaptados = res.data.map(emp => {
            const asistenciaVisual = {};
            diasSemana.forEach(dia => {
              asistenciaVisual[dia] = emp.asistencia?.[dia] !== undefined && emp.asistencia?.[dia] !== null 
                ? emp.asistencia[dia] 
                : '';
            });
            return { 
              ...emp, 
              asistencia: asistenciaVisual,
              estado: emp.estado || 'Activo',
              fecha_ingreso: emp.fecha_ingreso || new Date().toISOString().split('T')[0]
            };
          });
          setPersonal(datosAdaptados);
        } else {
          console.error("Error del backend:", res.message);
        }
      } else {
        console.warn("Entorno pywebview no detectado. Modo desarrollo activo.");
      }
    } catch (error) {
      console.error("Error al cargar asistencias:", error);
    }
  };

  useEffect(() => {
    cargarAsistencias();
  }, [turnoSeleccionado, mesSeleccionado, semanaSeleccionada]);

  // 3. CÁLCULO DE HORAS
  const calcularHorasSemanales = (empleado) => {
    const dias = empleado.asistencia || {};
    return Object.values(dias).reduce((total, horas) => {
      const val = parseFloat(horas);
      return total + (isNaN(val) ? 0 : val);
    }, 0);
  };

  // Actualizar tiempo/horas trabajadas por día
  const actualizarHorasDia = (cedulaEmpleado, dia, valor) => {
    if (!modoEdicion) return;
    setPersonal(prev => prev.map(empleado => {
      if (empleado.cedula === cedulaEmpleado) {
        return {
          ...empleado,
          asistencia: { ...empleado.asistencia, [dia]: valor }
        };
      }
      return empleado;
    }));
  };

  // 4. CAMBIAR ESTADO DEL PERSONAL
  const cambiarEstadoPersonal = async (cedulaEmpleado, nuevoEstado) => {
    setPersonal(prev => prev.map(emp => 
      emp.cedula === cedulaEmpleado ? { ...emp, estado: nuevoEstado } : emp
    ));

    if (window.pywebview && window.pywebview.api && window.pywebview.api.actualizar_estado_trabajador) {
      try {
        await window.pywebview.api.actualizar_estado_trabajador({ cedula: cedulaEmpleado, estado: nuevoEstado });
      } catch (error) {
        console.error("Error al actualizar estado en backend:", error);
      }
    }
  };

  // 5. REGISTRO DE NUEVO PERSONAL AL BACKEND
  const agregarPersonal = async (e) => {
    e.preventDefault();
    if (!cedula || !nombre.trim() || !cargo.trim()) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    const nuevoEmpleado = {
      cedula: parseInt(cedula),
      nombre: nombre.trim(),
      cargo: cargo.trim(),
      turno: turnoSeleccionado,
      estado: 'Activo',
      fecha_ingreso: new Date().toISOString().split('T')[0]
    };

    if (window.pywebview && window.pywebview.api) {
      try {
        const res = await window.pywebview.api.registrar_trabajador(nuevoEmpleado);
        if (res.status === 'success') {
          alert(`✅ ${res.message}`);
          setCedula(''); setNombre(''); setCargo('');
          cargarAsistencias();
        } else {
          alert(`❌ Error al registrar: ${res.message}`);
        }
      } catch (error) {
        console.error("Error al comunicar con Python:", error);
        alert("Error crítico de conexión.");
      }
    }
  };

  // 6. ENVIAR ASISTENCIAS AL BACKEND
  const guardarCambios = async () => {
    const registrosLimpios = personal.map(empleado => {
      const asistenciaNumerica = {};
      diasSemana.forEach(dia => {
        const val = parseFloat(empleado.asistencia[dia]);
        asistenciaNumerica[dia] = isNaN(val) ? 0 : val;
      });
      return {
        cedula: empleado.cedula,
        asistencia: asistenciaNumerica
      };
    });

    const payload = {
      mes: mesSeleccionado,
      semana: semanaSeleccionada,
      registros: registrosLimpios
    };

    if (window.pywebview && window.pywebview.api) {
      try {
        const res = await window.pywebview.api.guardar_asistencias_personal(payload);
        if (res.status === 'success') {
          alert(`✅ ¡Asistencias de ${semanaSeleccionada} guardadas con éxito!`);
        } else {
          alert(`❌ Error en Base de Datos: ${res.message}`);
        }
      } catch (error) {
        console.error("Error al guardar asistencias:", error);
        alert("Error crítico de conexión con la base de datos.");
      }
    } else {
      console.log("Payload preparado para enviar a Python:", payload);
      alert("⚠️ Entorno de escritorio no detectado.");
    }
  };

  const personalAProcesar = [...personal]
    .filter(emp => vistaActual === 'administracion' ? true : emp.estado === 'Activo')
    .sort((a, b) => {
      if (ordenAlfabetico) return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
      return a.cedula - b.cedula;
    });

  return (
    <div className="p-8 page-transition relative min-h-screen">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* PANEL DE REGISTRO */}
        <aside className="lg:w-1/4 bg-white dark:bg-white p-6 rounded-xl border border-gray-200 dark:border-gray-200 shadow-lg h-fit text-gray-800 dark:text-gray-800">
          <h2 className="text-lg font-black mb-4">Registrar Personal</h2>
          <form onSubmit={agregarPersonal} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold text-purple-600 dark:text-purple-600 uppercase">Cédula</label>
              <input type="number" value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="Ej. 27123456" className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-300 bg-white dark:bg-white rounded-lg text-sm text-gray-800 dark:text-gray-800 focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-purple-600 dark:text-purple-600 uppercase">Nombre Completo</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Carlos Mendoza" className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-300 bg-white dark:bg-white rounded-lg text-sm text-gray-800 dark:text-gray-800 focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-purple-600 dark:text-purple-600 uppercase">Cargo</label>
              <input type="text" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ej. Profesor" className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-300 bg-white dark:bg-white rounded-lg text-sm text-gray-800 dark:text-gray-800 focus:outline-none focus:border-purple-500" />
            </div>
            <button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all shadow-md mt-2">
              + Registrar en Turno {turnoSeleccionado}
            </button>
          </form>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-x-auto">
          
          {/* CABECERA */}
          <header className="mb-6 border-b border-gray-200 dark:border-gray-200 pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="min-h-[50px] flex flex-col justify-center">
                <p className="text-sm text-purple-600 dark:text-purple-600 font-bold uppercase tracking-widest">Módulo de Recursos Humanos</p>
                <h1 className="text-2xl lg:text-3xl font-black text-gray-800 dark:text-white">
                  {vistaActual === 'asistencia' ? `Control de Asistencia — ${semanaSeleccionada}` : 'Administración y Estados del Personal'}
                </h1>
              </div>

              {/* SELECTOR DE PESTAÑA / VISTA */}
              <div className="flex bg-white dark:bg-white p-1 rounded-md font-bold h-fit shrink-0 border border-gray-200">
                <button
                  onClick={() => setVistaActual('asistencia')}
                  className={`px-3 py-1.5 rounded transition-all text-sm ${vistaActual === 'asistencia' ? 'bg-purple-700 text-white shadow' : 'text-gray-700 dark:text-gray-700 hover:text-black dark:hover:text-black'}`}
                >
                  📋 Toma de Asistencia
                </button>
                <button
                  onClick={() => setVistaActual('administracion')}
                  className={`px-3 py-1.5 rounded transition-all text-sm ${vistaActual === 'administracion' ? 'bg-purple-700 text-white shadow' : 'text-gray-700 dark:text-gray-700 hover:text-black dark:hover:text-black'}`}
                >
                  ⚙️ Administrar Personal
                </button>
              </div>
            </div>

            {/* BARRA DE BOTONES INDEPENDIENTE */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap gap-2 text-sm">
                {vistaActual === 'asistencia' && (
                  <button
                    onClick={() => setModoEdicion(!modoEdicion)}
                    className={`px-4 py-2 rounded-md font-bold shadow-md transition-all border ${
                      modoEdicion ? 'bg-red-600 hover:bg-red-700 text-white border-red-800' : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-300'
                    }`}
                  >
                    {modoEdicion ? '🛑 Bloquear Edición' : '✏️ Ingresar Tiempos'}
                  </button>
                )}

                <button
                  onClick={() => setOrdenAlfabetico(!ordenAlfabetico)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-bold border border-blue-700 shadow-sm"
                >
                  {ordenAlfabetico ? '🔤 Orden: A-Z' : '📋 Orden: Cédula'}
                </button>

                <Link to="/" className="bg-white dark:bg-white border border-gray-300 dark:border-gray-300 text-gray-700 dark:text-gray-700 px-4 py-2 rounded-md font-bold hover:bg-gray-50 dark:hover:bg-gray-50 flex items-center shadow-sm">
                  🏠 Inicio
                </Link>
              </div>

              {vistaActual === 'asistencia' && (
                <button onClick={guardarCambios} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-bold shadow-md text-sm">
                  💾 Guardar Reporte
                </button>
              )}
            </div>
          </header>

          {/* FILTROS DE NAVEGACIÓN */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex bg-white dark:bg-white p-1 rounded-xl font-bold shadow-sm border border-gray-200 dark:border-gray-200">
              <button onClick={() => setTurnoSeleccionado('Mañana')} className={`px-4 py-1.5 rounded-lg text-sm transition-all ${turnoSeleccionado === 'Mañana' ? 'bg-purple-700 text-white shadow-md' : 'text-gray-600 dark:text-gray-600 hover:text-gray-900'}`}>
                ☀️ Mañana
              </button>
              <button onClick={() => setTurnoSeleccionado('Tarde')} className={`px-4 py-1.5 rounded-lg text-sm transition-all ${turnoSeleccionado === 'Tarde' ? 'bg-purple-700 text-white shadow-md' : 'text-gray-600 dark:text-gray-600 hover:text-gray-900'}`}>
                🌙 Tarde
              </button>
            </div>

            {vistaActual === 'asistencia' && (
              <>
                <div className="flex bg-white dark:bg-white p-1 rounded-xl font-bold border border-gray-200 dark:border-gray-200">
                  <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)} className="bg-transparent text-sm text-gray-800 dark:text-gray-800 px-3 py-1 focus:outline-none font-bold cursor-pointer">
                    {meses.map(m => <option key={m} value={m} className="text-black">{m}</option>)}
                  </select>
                </div>

                <div className="flex bg-white dark:bg-white p-1 rounded-xl font-bold border border-gray-200 dark:border-gray-200 overflow-x-auto">
                  {semanas.map((semana) => (
                    <button key={semana} onClick={() => setSemanaSeleccionada(semana)} className={`px-3 py-1 rounded-lg text-xs transition-all ${semanaSeleccionada === semana ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-600 hover:text-purple-700'}`}>
                      {semana}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* VISTA 1: TABLA DE ASISTENCIA */}
          {vistaActual === 'asistencia' && (
            <div className="bg-white dark:bg-white rounded-xl shadow-2xl border border-gray-200 dark:border-gray-200 overflow-hidden text-gray-800 dark:text-gray-800">
              <div className="bg-white dark:bg-white p-3 border-b border-gray-200 dark:border-gray-200 text-xs font-bold text-purple-800 dark:text-purple-800 uppercase tracking-wider flex justify-between">
                <span>Ingreso de Horas Trabajadas (Meta Semanal Fija: {META_HORAS_SEMANALES} Horas)</span>
                <span>Solo personal ACTIVO</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-white dark:bg-white text-gray-500 dark:text-gray-500 text-xs uppercase border-b border-gray-200 dark:border-gray-200">
                    <tr>
                      <th className="p-4 text-left w-1/4">Colaborador</th>
                      {diasSemana.map(dia => (
                        <th key={dia} className="p-3 text-center text-purple-900 dark:text-purple-900 font-black w-[12%]">{dia} (Hrs)</th>
                      ))}
                      <th className="p-4 text-center bg-white dark:bg-white text-purple-800 dark:text-purple-800 w-[15%]">Total Semanal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personalAProcesar.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-gray-400 italic">
                          No hay personal activo registrado para el turno {turnoSeleccionado}.
                        </td>
                      </tr>
                    ) : (
                      personalAProcesar.map((empleado) => {
                        const horasAcumuladas = calcularHorasSemanales(empleado);
                        const cumpleMeta = horasAcumuladas >= META_HORAS_SEMANALES;
                        const porcentaje = Math.min((horasAcumuladas / META_HORAS_SEMANALES) * 100, 100);

                        return (
                          <tr key={empleado.cedula} className="border-t border-gray-200 dark:border-gray-200 hover:bg-purple-50/30 transition-colors">
                            <td className="p-4 text-left">
                              <div className="font-bold text-gray-900 dark:text-gray-900">{empleado.nombre}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">V-{empleado.cedula} | {empleado.cargo}</div>
                            </td>

                            {/* CAMPOS DE INGRESO DE TIEMPO POR DÍA */}
                            {diasSemana.map(dia => (
                              <td key={dia} className="p-2 text-center border-x border-gray-100 dark:border-gray-100">
                                <input
                                  type="number"
                                  min="0"
                                  max="24"
                                  step="0.5"
                                  disabled={!modoEdicion}
                                  value={empleado.asistencia?.[dia] || ''}
                                  onChange={(e) => actualizarHorasDia(empleado.cedula, dia, e.target.value)}
                                  placeholder="0"
                                  className={`w-16 p-1.5 text-center font-bold text-sm rounded-md border transition-all focus:outline-none ${
                                    !modoEdicion 
                                      ? 'bg-transparent border-transparent text-gray-600 dark:text-gray-600 cursor-not-allowed' 
                                      : 'bg-white dark:bg-white text-gray-900 dark:text-gray-900 border-gray-300 dark:border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 shadow-sm'
                                  }`}
                                />
                              </td>
                            ))}

                            {/* BARRA DE HORAS TOTALES */}
                            <td className={`p-4 font-black text-center border-l border-gray-200 dark:border-gray-200 transition-colors ${cumpleMeta ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                              <div className="text-xl font-extrabold">{horasAcumuladas} h</div>
                              <div className="text-[10px] uppercase tracking-wider font-bold mt-1">de {META_HORAS_SEMANALES} h meta</div>
                              <div className="w-full bg-gray-200 dark:bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden max-w-[100px] mx-auto relative">
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
          )}

          {/* VISTA 2: PANEL DE ADMINISTRACIÓN */}
          {vistaActual === 'administracion' && (
            <div className="bg-white dark:bg-white rounded-xl shadow-2xl border border-gray-200 dark:border-gray-200 overflow-hidden text-gray-800 dark:text-gray-800">
              <div className="bg-white p-4 border-b border-gray-200 text-xs font-bold text-gray-800 uppercase tracking-wider flex justify-between items-center">
                <span>Gestión de Personal Registrado — Historial y Estados</span>
                <span className="text-gray-500 font-normal">Total en base de datos: {personalAProcesar.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white dark:bg-white text-gray-600 dark:text-gray-600 text-xs uppercase border-b border-gray-200 dark:border-gray-200 font-black">
                    <tr>
                      <th className="p-4 text-left">Cédula</th>
                      <th className="p-4 text-left">Nombre Completo</th>
                      <th className="p-4 text-left">Cargo y Turno</th>
                      <th className="p-4 text-center">Fecha de Ingreso</th>
                      <th className="p-4 text-center">Estado Actual</th>
                      <th className="p-4 text-center">Acciones de Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personalAProcesar.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-400 italic">No hay personal registrado en este turno.</td>
                      </tr>
                    ) : (
                      personalAProcesar.map((empleado) => (
                        <tr key={empleado.cedula} className="border-t border-gray-200 dark:border-gray-200 hover:bg-purple-50/30 transition-colors text-sm">
                          <td className="p-4 font-bold text-gray-700 dark:text-gray-700">V-{empleado.cedula}</td>
                          <td className="p-4 font-extrabold text-gray-900 dark:text-gray-900">| {empleado.nombre}</td>
                          <td className="p-4">
                            <span className="font-semibold text-gray-800 dark:text-gray-800">{empleado.cargo}</span>
                            <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-100 text-purple-800 dark:text-purple-800 px-2 py-0.5 rounded font-bold">{empleado.turno}</span>
                          </td>
                          <td className="p-4 text-center font-medium text-gray-500 dark:text-gray-500">
                            📅 {empleado.fecha_ingreso || 'No registrada'}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-black inline-block ${
                              empleado.estado === 'Activo' ? 'bg-green-100 text-green-800 border border-green-300' :
                              empleado.estado === 'Suspendido' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                              {empleado.estado === 'Activo' && '🟢 '}
                              {empleado.estado === 'Suspendido' && '🟡 '}
                              {empleado.estado === 'Despedido' && '🔴 '}
                              {empleado.estado}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <select
                              value={empleado.estado}
                              onChange={(e) => cambiarEstadoPersonal(empleado.cedula, e.target.value)}
                              className="bg-white dark:bg-white border border-gray-300 dark:border-gray-300 text-gray-800 dark:text-gray-800 text-xs rounded-lg p-2 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                            >
                              <option value="Activo">🟢 Activo</option>
                              <option value="Suspendido">🟡 Suspendido</option>
                              <option value="Despedido">🔴 Despedido</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AsistenciasPersonal;