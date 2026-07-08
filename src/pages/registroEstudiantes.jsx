import { useState } from 'react';
import { Link } from 'react-router-dom';

const RegistroAlumnos = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [estudianteActivoId, setEstudianteActivoId] = useState(null);

  const [busquedaAcademica, setBusquedaAcademica] = useState("");
  const [dropdownAbiertoId, setDropdownAbiertoId] = useState(null);
  const [busquedaEstudiante, setBusquedaEstudiante] = useState("");
  const [busquedaModal, setBusquedaModal] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);

  const opcionesCondicion = ['Ninguna', 'Autismo (TEA)', 'TDAH', 'Dislexia', 'Otra'];
  const opcionesGenero = ['Masculino', 'Femenino'];

  const reglasPlantel = [
    {
      nivel: 'Maternal',
      distribucion: [
        { turno: 'Mañana', secciones: ['A'] },
        { turno: 'Tarde', secciones: ['B'] }
      ]
    },
    {
      nivel: '1er Nivel',
      distribucion: [
        { turno: 'Mañana', secciones: ['A', 'B'] },
        { turno: 'Tarde', secciones: ['C', 'D'] }
      ]
    },
    {
      nivel: '2do Nivel',
      distribucion: [
        { turno: 'Mañana', secciones: ['A', 'B'] },
        { turno: 'Tarde', secciones: ['C', 'D'] }
      ]
    },
    {
      nivel: '3er Nivel',
      distribucion: [
        { turno: 'Mañana', secciones: ['A'] },
        { turno: 'Tarde', secciones: ['B', 'C'] }
      ]
    }
  ];

  const opcionesAcademicas = [];
  reglasPlantel.forEach(regla => {
    regla.distribucion.forEach(dist => {
      dist.secciones.forEach(seccion => {
        opcionesAcademicas.push({
          id: `${dist.turno}-${regla.nivel}-${seccion}`.toLowerCase().replace(/ /g, '_'),
          label: `${dist.turno} - ${regla.nivel} - Sección "${seccion}"`,
          valores: { nivelEstudio: regla.nivel, turno: dist.turno, seccion: seccion }
        });
      });
    });
  });

  const opcionesFiltradas = opcionesAcademicas.filter(opt => {
    if (!busquedaAcademica.trim()) return true;
    const palabrasBusqueda = busquedaAcademica.toLowerCase().trim().split(/\s+/);
    const textoOpcion = opt.label.toLowerCase();
    return palabrasBusqueda.every(palabra => textoOpcion.includes(palabra));
  });

  const estudiantesFiltrados = estudiantes.filter(est => {
    if (!busquedaEstudiante.trim()) return true;
    const termino = busquedaEstudiante.toLowerCase().trim();
    const coincideNombre = (est.nombre || '').toLowerCase().includes(termino);
    const coincideCedula = (est.cedulaEscolar || '').toLowerCase().includes(termino);
    return coincideNombre || coincideCedula;
  });

  const estudiantesFiltradosModal = estudiantes.filter(est => {
    if (!busquedaModal.trim()) return true;
    const termino = busquedaModal.toLowerCase().trim();
    const coincideNombre = (est.nombre || '').toLowerCase().includes(termino);
    const coincideCedula = (est.cedulaEscolar || '').toLowerCase().includes(termino);
    return coincideNombre || coincideCedula;
  });

  const ordenarEstudiantesAZ = () => {
    const estudiantesOrdenados = [...estudiantes].sort((a, b) => {
      if (!a.nombre.trim()) return 1;
      if (!b.nombre.trim()) return -1;
      return a.nombre.localeCompare(b.nombre);
    });
    setEstudiantes(estudiantesOrdenados);
  };

  const eliminarEstudiante = (id) => {
    const confirmar = window.confirm("¿Está seguro de que desea eliminar a este estudiante de la matrícula actual?");
    if (confirmar) {
      setEstudiantes(prev => prev.filter(est => est.id !== id));
    }
  };

  const agregarFila = () => {
    const nuevoId = Date.now();
    const defectoAcademico = opcionesAcademicas[0].valores;

    const nuevoEstudiante = {
      id: nuevoId,
      nombre: '',
      edad: '',
      genero: '',
      direccion: '',
      cedulaEscolar: '',
      fechaNacimiento: '',
      condicion: 'Ninguna',
      estado: 'Vigente',
      tipoSangre: '',
      tallaMono: '',
      tallaCamisa: '',
      tallaCalzado: '',
      ...defectoAcademico,
      representanteLegal: '',
      representanteInstitucional: '',
      re_inst_ci: '',
      re_inst_parentesco: '',
      re_inst_fechaNacimiento: '',
      re_inst_lugarNacimiento: '',
      re_inst_telefono: '',
      re_inst_correo: '',
      re_inst_direccion: '',
      re_inst_trabaja: 'No',
      re_inst_dondeTrabaja: '',
      re_inst_gradoInstruccion: '',
      repNombre: '',
      repCi: '',
      repParentesco: '',
      repFechaNacimiento: '',
      repLugarNacimiento: '',
      repDireccion: '',
      repTrabaja: 'No',
      repDondeTrabaja: '',
      repGradoInstruccion: '',
      repTelefono: '',
      repCorreo: '',
    };

    setEstudiantes([...estudiantes, nuevoEstudiante]);
    setEstudianteActivoId(nuevoId);
    setBusquedaEstudiante("");
  };

  const handleInputChange = (id, campo, valor) => {
    setEstudiantes(prevEstudiantes =>
      prevEstudiantes.map(est => {
        if (est.id === id) {
          let copiaEstudiante = { ...est };
          let nuevoValor = valor;

          const camposNumericos = ['edad', 'cedulaEscolar', 'repCi', 're_inst_ci', 'repTelefono', 're_inst_telefono', 'tallaCalzado'];
          if (camposNumericos.includes(campo)) {
            nuevoValor = nuevoValor.replace(/\D/g, ''); 
          }

          if (campo === 'combinacionAcademica') {
            copiaEstudiante = { ...copiaEstudiante, ...nuevoValor };
          } else {
            copiaEstudiante[campo] = nuevoValor;
          }

          if (campo === 'edad' && nuevoValor !== "") {
            const num = parseInt(nuevoValor);
            copiaEstudiante[campo] = num < 0 ? "0" : nuevoValor;
          }

          return copiaEstudiante;
        }
        return est;
      })
    );
  };

  const seleccionarOpcionAcademica = (estudianteId, opcion) => {
    handleInputChange(estudianteId, 'combinacionAcademica', opcion.valores);
    setDropdownAbiertoId(null);
    setBusquedaAcademica("");
  };

  const cerrarExpediente = () => {
    const estudianteActual = estudiantes.find(est => est.id === estudianteActivoId);
    if (estudianteActual && estudianteActual.nombre.trim() === '') {
      setEstudiantes(prev => prev.filter(est => est.id !== estudianteActivoId));
    }
    setEstudianteActivoId(null);
    setDropdownAbiertoId(null);
  };

  const verExpedienteDesdeListado = (id) => {
    setShowModal(false);
    setBusquedaModal("");
    setEstudianteActivoId(id);
  };

  const guardarDatos = async () => {
    const estudiantesValidos = estudiantes.filter(est => est.nombre.trim() !== '' && est.cedulaEscolar.trim() !== '');

    if (estudiantesValidos.length === 0) {
      alert("⚠️ No hay estudiantes válidos para guardar. Asegúrese de llenar al menos el Nombre y la Cédula Escolar.");
      return;
    }

    try {
      let exitoCount = 0;
      let errores = [];

      if (window.pywebview && window.pywebview.api) {
        for (const estudiante of estudiantesValidos) {
          const respuesta = await window.pywebview.api.registrar_estudiante_completo(estudiante);
          if (respuesta.status === 'success') {
            exitoCount++;
          } else {
            errores.push(`- ${estudiante.nombre}: ${respuesta.message}`);
          }
        }

        if (errores.length === 0) {
          alert(`✅ ¡Éxito! Se sincronizaron ${exitoCount} estudiante(s) correctamente en la Base de Datos.`);
        } else {
          alert(`⚠️ Se guardaron ${exitoCount} estudiantes, pero hubo errores:\n\n${errores.join('\n')}`);
        }
      } else {
        console.warn("API de pywebview no detectada. Datos que se enviarían a SQLite:", estudiantesValidos);
        alert("🖥️ Estás en el navegador. Para que guarde en SQLite, debes ejecutar la aplicación desde el script de Python.");
      }
    } catch (error) {
      alert(`❌ Ocurrió un error crítico de conexión con el controlador:\n${error.message}`);
    }
  };

  const estudianteActivo = estudiantes.find(est => est.id === estudianteActivoId);

  return (
    <div className="p-8 page-transition relative">
      <div className="flex flex-col gap-6">

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-4 gap-4">
          <div>
            <p className="text-sm text-purple-600 font-bold uppercase tracking-widest">Módulo Académico</p>
            <h1 className="text-3xl font-black text-white">Registro de Alumnos</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setModoEdicion(!modoEdicion)}
              className={`px-4 py-2 rounded-md font-bold shadow-md transition-all flex items-center active:scale-95 border ${modoEdicion
                ? 'bg-red-500 hover:bg-red-700/80 text-white border-red-700'
                : 'bg-slate-700/50 hover:bg-slate-800 text-white border-slate-900'
                }`}
            >
              {modoEdicion ? '🛑 Salir de Edición' : '⚙️ Gestionar Matrícula'}
            </button>

            <button onClick={ordenarEstudiantesAZ} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-bold shadow-md transition-all flex items-center active:scale-95">
              🔤 Ordenar A-Z
            </button>

            <button onClick={() => setShowModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-bold shadow-md transition-all flex items-center">
              📊 Ver Listado General
            </button>

            <Link to="/" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-bold hover:shadow transition-all flex items-center shadow-sm">
              🏠 Volver al Inicio
            </Link>

            <button onClick={guardarDatos} className="bg-purple-600 hover:bg-purple-800 text-white px-6 py-2 rounded-md font-bold shadow-md transition-all active:scale-95">
              💾 Guardar Datos
            </button>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-4 bg-white border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-gray-700 whitespace-nowrap">Matrícula Actual</h2>
            
            <div className="w-full sm:max-w-md">
              <input
                type="text"
                placeholder="🔍 Buscar por nombre o cédula escolar..."
                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-purple-500 text-sm bg-white"
                value={busquedaEstudiante}
                onChange={(e) => setBusquedaEstudiante(e.target.value)}
              />
            </div>

            <button onClick={agregarFila} className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-lg font-bold flex items-center text-sm transition-colors shadow-sm border border-purple-200 whitespace-nowrap">
              <span className="text-xl mr-2 leading-none">+</span> Añadir Nuevo Estudiante
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1300px] w-full">
              <div className="bg-white text-gray-500 text-xs font-bold uppercase tracking-widest grid grid-cols-[2fr_0.5fr_0.9fr_1.5fr_3fr_1.5fr_1.2fr_0.6fr] border-b border-gray-200 text-center items-center">
                <div className="p-4 text-left">Nombre del Alumno</div>
                <div className="p-4">Edad</div>
                <div className="p-4 text-left">Género</div>
                <div className="p-4 text-left">Dirección</div>
                <div className="p-4 text-left">Asignación Académica (Escribe para filtrar)</div>
                <div className="p-4 text-left">Representante</div>
                <div className="p-4">Vigencia</div>
                <div className="p-4">{modoEdicion ? "Acciones" : "Expediente"}</div>
              </div>

              <div className="divide-y divide-gray-100">
                {estudiantesFiltrados.map((est) => {
                  const textoAsignacionActual = `${est.turno} - ${est.nivelEstudio} - Sección "${est.seccion}"`;
                  const esDropdownAbierto = dropdownAbiertoId === est.id;

                  return (
                    <div key={est.id} className="grid grid-cols-[2fr_0.5fr_0.9fr_1.5fr_3fr_1.5fr_1.2fr_0.6fr] hover:bg-purple-50/20 bg-white transition-colors items-center p-2">
                      <div className="px-2">
                        <input type="text" placeholder="Nombre completo" className="w-full p-2 bg-transparent rounded border border-transparent focus:border-purple-400 outline-none font-medium text-sm text-gray-800" value={est.nombre} onChange={(e) => handleInputChange(est.id, 'nombre', e.target.value)} />
                      </div>
                      <div className="px-2 text-center">
                        <input type="text" inputMode="numeric" placeholder="0" className="w-full p-2 bg-transparent border border-transparent rounded text-center focus:border-purple-400 outline-none font-bold text-sm text-gray-800" value={est.edad || ''} onChange={(e) => handleInputChange(est.id, 'edad', e.target.value)} />
                      </div>
                      <div className="px-2">
                        <select className="w-full p-2 bg-transparent border border-transparent rounded focus:border-purple-400 outline-none font-semibold text-gray-700 text-sm cursor-pointer" value={est.genero} onChange={(e) => handleInputChange(est.id, 'genero', e.target.value)}>
                          <option value="">Seleccione...</option>
                          {opcionesGenero.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="px-2">
                        <input type="text" placeholder="Dirección" className="w-full p-2 bg-transparent rounded border border-transparent focus:border-purple-400 outline-none text-sm text-gray-800" value={est.direccion} onChange={(e) => handleInputChange(est.id, 'direccion', e.target.value)} />
                      </div>

                      <div className="px-2 relative">
                        <div className="flex items-center justify-between p-2 border border-gray-200 rounded bg-white focus-within:border-purple-400">
                          <input
                            type="text"
                            className="w-full bg-transparent outline-none font-semibold text-gray-700 text-sm"
                            placeholder="Buscar turno o nivel..."
                            value={esDropdownAbierto ? busquedaAcademica : textoAsignacionActual}
                            onFocus={() => {
                              setDropdownAbiertoId(est.id);
                              setBusquedaAcademica("");
                            }}
                            onChange={(e) => setBusquedaAcademica(e.target.value)}
                          />
                          <span className="text-gray-400 text-xs ml-1 pointer-events-none">▼</span>
                        </div>

                        {esDropdownAbierto && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setDropdownAbiertoId(null)}></div>
                            <div className="absolute left-2 right-2 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-gray-50">
                              {opcionesFiltradas.map(opt => (
                                <div key={opt.id} onClick={() => seleccionarOpcionAcademica(est.id, opt)} className="p-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-medium cursor-pointer transition-colors">
                                  {opt.label}
                                </div>
                              ))}
                              {opcionesFiltradas.length === 0 && (
                                <div className="p-3 text-xs text-gray-400 italic text-center">No se encontraron resultados</div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="px-2">
                        <input type="text" placeholder="Nombre representante" className="w-full p-2 bg-transparent rounded border border-transparent focus:border-purple-400 outline-none text-sm text-gray-800" value={est.repNombre} onChange={(e) => handleInputChange(est.id, 'repNombre', e.target.value)} />
                      </div>

                      <div className="px-2 text-center">
                        <select 
                          className={`w-full p-2 bg-transparent border border-transparent rounded focus:border-purple-400 outline-none font-bold text-xs cursor-pointer text-center ${est.estado === 'Retirado' ? 'text-red-600' : 'text-green-600'}`}
                          value={est.estado || 'Vigente'} 
                          onChange={(e) => handleInputChange(est.id, 'estado', e.target.value)}
                        >
                          <option value="Vigente" className="text-green-600">🟢 Vigente</option>
                          <option value="Retirado" className="text-red-600">🔴 Retirado</option>
                        </select>
                      </div>

                      <div className="px-2 flex justify-center">
                        {modoEdicion ? (
                          <button onClick={() => eliminarEstudiante(est.id)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 hover:text-red-800 transition-colors border border-red-100 animate-pulse" title="Eliminar Estudiante">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        ) : (
                          <button onClick={() => setEstudianteActivoId(est.id)} className="bg-indigo-50 text-indigo-600 p-2 rounded-lg hover:bg-indigo-100 hover:text-indigo-800 transition-colors border border-indigo-100" title="Ver Expediente">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {estudiantes.length === 0 && (
                  <div className="col-span-8 p-8 text-center text-gray-400 font-medium bg-white">
                    No hay estudiantes registrados. Haz clic en "Añadir Nuevo Estudiante" para comenzar.
                  </div>
                )}
                {estudiantes.length > 0 && estudiantesFiltrados.length === 0 && (
                  <div className="col-span-8 p-8 text-center text-gray-400 font-medium bg-white">
                    No se encontraron coincidencias para "{busquedaEstudiante}".
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: EXPEDIENTE DETALLADO */}
      {estudianteActivo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">

            <div className="p-5 border-b flex justify-between items-center bg-[#002366] text-white">
              <div>
                <h2 className="text-xl font-bold">
                  {estudianteActivo.nombre ? `Expediente: ${estudianteActivo.nombre}` : 'Nuevo Expediente de Alumno'}
                </h2>
                <p className="text-xs text-blue-200">Complete la información detallada para el registro oficial.</p>
              </div>
              <button onClick={cerrarExpediente} className="text-white hover:text-gray-300 text-3xl leading-none">&times;</button>
            </div>

            <div className="p-6 overflow-y-auto bg-white">

              <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-black text-[#0F172A] mb-4 border-b pb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">1</span> Datos del Estudiante
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Nombre Completo del Alumno <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.nombre} onChange={(e) => handleInputChange(estudianteActivo.id, 'nombre', e.target.value)} placeholder="Ej. Juan Pérez" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Cédula Escolar</label>
                    <input type="text" inputMode="numeric" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.cedulaEscolar} onChange={(e) => handleInputChange(estudianteActivo.id, 'cedulaEscolar', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Fecha de Nacimiento</label>
                    <input type="date" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-700" value={estudianteActivo.fechaNacimiento} onChange={(e) => handleInputChange(estudianteActivo.id, 'fechaNacimiento', e.target.value)} />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Género</label>
                    <select className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-700" value={estudianteActivo.genero} onChange={(e) => handleInputChange(estudianteActivo.id, 'genero', e.target.value)}>
                      <option value="">Seleccione...</option>
                      {opcionesGenero.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de Sangre</label>
                    <select className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-700" value={estudianteActivo.tipoSangre} onChange={(e) => handleInputChange(estudianteActivo.id, 'tipoSangre', e.target.value)}>
                      <option value="">Seleccione...</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="Desconocido">Desconocido</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Talla de Mono</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.tallaMono} onChange={(e) => handleInputChange(estudianteActivo.id, 'tallaMono', e.target.value)} placeholder="Ej. 10, S, M" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Talla de Camisa</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.tallaCamisa} onChange={(e) => handleInputChange(estudianteActivo.id, 'tallaCamisa', e.target.value)} placeholder="Ej. 10, S, M" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Talla de Calzado</label>
                    <input type="text" inputMode="numeric" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.tallaCalzado} onChange={(e) => handleInputChange(estudianteActivo.id, 'tallaCalzado', e.target.value)} placeholder="Ej. 32" />
                  </div>

                  {/* AQUÍ ESTÁ EL CAMBIO PARA LA NEURODIVERGENCIA */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Condición (Neurodiversidad)</label>
                    <input 
                      type="text" 
                      list="lista-condiciones" 
                      className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-700" 
                      value={estudianteActivo.condicion} 
                      onChange={(e) => handleInputChange(estudianteActivo.id, 'condicion', e.target.value)} 
                      placeholder="Seleccione o escriba..."
                    />
                    <datalist id="lista-condiciones">
                      {opcionesCondicion.map(cond => <option key={cond} value={cond} />)}
                    </datalist>
                  </div>

                  <div className="md:col-span-2 relative">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Asignación Académica Asignada</label>
                    <div className="flex items-center justify-between p-2 border border-gray-300 rounded bg-white focus-within:border-blue-500">
                      <input
                        type="text"
                        className="w-full bg-transparent outline-none font-medium text-sm text-gray-700"
                        placeholder="Buscar turno o nivel..."
                        value={dropdownAbiertoId === 'modal' ? busquedaAcademica : `${estudianteActivo.turno} - ${estudianteActivo.nivelEstudio} - Sección "${estudianteActivo.seccion}"`}
                        onFocus={() => {
                          setDropdownAbiertoId('modal');
                          setBusquedaAcademica("");
                        }}
                        onChange={(e) => setBusquedaAcademica(e.target.value)}
                      />
                      <span className="text-gray-400 text-xs ml-1 pointer-events-none">▼</span>
                    </div>

                    {dropdownAbiertoId === 'modal' && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setDropdownAbiertoId(null)}></div>
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-gray-50">
                          {opcionesFiltradas.map(opt => (
                            <div key={opt.id} onClick={() => seleccionarOpcionAcademica(estudianteActivo.id, opt)} className="p-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium cursor-pointer transition-colors">
                              {opt.label}
                            </div>
                          ))}
                          {opcionesFiltradas.length === 0 && (
                            <div className="p-3 text-xs text-gray-400 italic text-center">No se encontraron resultados</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Dirección de Residencia (Estudiante)</label>
                    <textarea className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" rows="2" value={estudianteActivo.direccion} onChange={(e) => handleInputChange(estudianteActivo.id, 'direccion', e.target.value)}></textarea>
                  </div>

                  <div className="flex items-end pb-2 md:col-span-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        checked={estudianteActivo.tieneRepInstitucional || false}
                        onChange={(e) => handleInputChange(estudianteActivo.id, 'tieneRepInstitucional', e.target.checked)}
                      />
                      <span className="text-xs font-bold text-gray-600">¿Rep. Institucional distinto al legal?</span>
                    </label>
                  </div>

                  {estudianteActivo.tieneRepInstitucional && (
                    <>
                      <div className="md:col-span-4 border-b border-gray-200 my-2"><p className="text-sm font-bold text-gray-700">Representante Institucional</p></div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Nombre (Rep. Institucional)</label>
                        <input type="text" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.representanteInstitucional} onChange={(e) => handleInputChange(estudianteActivo.id, 'representanteInstitucional', e.target.value)} placeholder="Ej. Ana Gómez" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">C.I. Rep. Institucional</label>
                        <input type="text" inputMode="numeric" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.re_inst_ci} onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_ci', e.target.value)} placeholder="Ej. 12345678" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Parentesco (Inst.)</label>
                        <select className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-700" value={estudianteActivo.re_inst_parentesco} onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_parentesco', e.target.value)}>
                          <option value="">Seleccione...</option>
                          <option value="Madre">Madre</option>
                          <option value="Padre">Padre</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Fecha Nacimiento (Inst.)</label>
                        <input type="date" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.re_inst_fechaNacimiento} onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_fechaNacimiento', e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Lugar de Nacimiento (Inst.)</label>
                        <input type="text" placeholder="Ej: Valencia, Carabobo" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.re_inst_lugarNacimiento} onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_lugarNacimiento', e.target.value)} />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Teléfono (Inst.)</label>
                        <input type="text" inputMode="numeric" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.re_inst_telefono} onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_telefono', e.target.value)} placeholder="Ej. 04141234567" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Correo Electrónico (Inst.)</label>
                        <input type="email" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.re_inst_correo} onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_correo', e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Grado de Instrucción (Inst.)</label>
                        <select className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-700" value={estudianteActivo.re_inst_gradoInstruccion} onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_gradoInstruccion', e.target.value)}>
                          <option value="">Seleccione...</option>
                          <option value="Básica">Básica</option>
                          <option value="Bachiller">Bachiller</option>
                          <option value="Técnico Medio">Técnico Medio</option>
                          <option value="TSU">TSU</option>
                          <option value="Universitario">Universitario</option>
                          <option value="Postgrado">Postgrado</option>
                        </select>
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-gray-600 mb-1">¿Trabaja? (Inst.)</label>
                        <select className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-700" value={estudianteActivo.re_inst_trabaja} onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_trabaja', e.target.value)}>
                          <option value="Sí">Sí</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <label className={`block text-xs font-bold mb-1 ${estudianteActivo.re_inst_trabaja === 'Sí' ? 'text-gray-600' : 'text-gray-400'}`}>¿Dónde trabaja? (Inst.)</label>
                        <input
                          type="text"
                          className={`w-full p-2 border border-gray-300 rounded outline-none text-sm ${estudianteActivo.re_inst_trabaja === 'Sí' ? 'focus:border-blue-500 bg-white text-gray-800' : 'bg-white text-gray-400 cursor-not-allowed border-dashed'}`}
                          value={estudianteActivo.re_inst_dondeTrabaja}
                          onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_dondeTrabaja', e.target.value)}
                          disabled={estudianteActivo.re_inst_trabaja === 'No'}
                          placeholder={estudianteActivo.re_inst_trabaja === 'No' ? 'No aplica' : 'Empresa o lugar de trabajo'}
                        />
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Dirección de Residencia (Inst.)</label>
                        <input type="text" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.re_inst_direccion} onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_direccion', e.target.value)} />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-black text-[#0F172A] mb-4 border-b pb-2 flex items-center">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">2</span> Datos del Representante Legal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Representante Legal</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.representanteLegal} onChange={(e) => handleInputChange(estudianteActivo.id, 'representanteLegal', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Cédula de Identidad</label>
                    <input type="text" inputMode="numeric" className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.repCi} onChange={(e) => handleInputChange(estudianteActivo.id, 'repCi', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Parentesco</label>
                    <select className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-700" value={estudianteActivo.repParentesco} onChange={(e) => handleInputChange(estudianteActivo.id, 'repParentesco', e.target.value)}>
                      <option value="">Seleccione...</option>
                      <option value="Madre">Madre</option>
                      <option value="Padre">Padre</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Fecha de Nacimiento</label>
                    <input type="date" className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.repFechaNacimiento} onChange={(e) => handleInputChange(estudianteActivo.id, 'repFechaNacimiento', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Lugar de Nacimiento</label>
                    <input type="text" placeholder="Ej: Valencia, Carabobo" className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.repLugarNacimiento} onChange={(e) => handleInputChange(estudianteActivo.id, 'repLugarNacimiento', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Teléfono</label>
                    <input type="text" inputMode="numeric" className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.repTelefono} onChange={(e) => handleInputChange(estudianteActivo.id, 'repTelefono', e.target.value)} />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Correo Electrónico</label>
                    <input type="email" className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.repCorreo} onChange={(e) => handleInputChange(estudianteActivo.id, 'repCorreo', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Grado de Instrucción</label>
                    <select className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-700" value={estudianteActivo.repGradoInstruccion} onChange={(e) => handleInputChange(estudianteActivo.id, 'repGradoInstruccion', e.target.value)}>
                      <option value="">Seleccione...</option>
                      <option value="Básica">Básica</option>
                      <option value="Bachiller">Bachiller</option>
                      <option value="Técnico Medio">Técnico Medio</option>
                      <option value="TSU">TSU</option>
                      <option value="Universitario">Universitario</option>
                      <option value="Postgrado">Postgrado</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-600 mb-1">¿Trabaja?</label>
                    <select className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-700" value={estudianteActivo.repTrabaja} onChange={(e) => handleInputChange(estudianteActivo.id, 'repTrabaja', e.target.value)}>
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className={`block text-xs font-bold mb-1 ${estudianteActivo.repTrabaja === 'Sí' ? 'text-gray-600' : 'text-gray-400'}`}>¿Dónde trabaja?</label>
                    <input
                      type="text"
                      className={`w-full p-2 border border-gray-300 rounded outline-none text-sm ${estudianteActivo.repTrabaja === 'Sí' ? 'focus:border-purple-500 bg-white text-gray-800' : 'bg-white text-gray-400 cursor-not-allowed border-dashed'}`}
                      value={estudianteActivo.repDondeTrabaja}
                      onChange={(e) => handleInputChange(estudianteActivo.id, 'repDondeTrabaja', e.target.value)}
                      disabled={estudianteActivo.repTrabaja === 'No'}
                      placeholder={estudianteActivo.repTrabaja === 'No' ? 'No aplica' : 'Empresa o lugar de trabajo'}
                    />
                  </div>
                  
                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Dirección de Residencia</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.repDireccion} onChange={(e) => handleInputChange(estudianteActivo.id, 'repDireccion', e.target.value)} />
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-gray-200 bg-white flex justify-end rounded-b-2xl">
              <button onClick={cerrarExpediente} className="bg-[#002366] hover:bg-blue-900 text-white px-8 py-2 rounded-lg font-bold transition-colors shadow-md">
                Guardar Localmente y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE LISTADO GENERAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col border border-gray-200">
            
            <div className="p-6 border-b border-gray-200 bg-blue-700 text-white rounded-t-2xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold">Alumnos Registrados</h2>
                  <p className="text-xs text-blue-200">Haz clic sobre cualquier tarjeta para ver o editar su expediente completo.</p>
                </div>
                <button 
                  onClick={() => { setShowModal(false); setBusquedaModal(""); }} 
                  className="text-white hover:text-gray-200 text-3xl leading-none"
                >
                  &times;
                </button>
              </div>

              <div className="w-full">
                <input
                  type="text"
                  placeholder="🔍 Buscar en el listado por nombre o cédula escolar..."
                  className="w-full p-2.5 bg-white/10 border border-blue-400/50 rounded-xl outline-none focus:bg-white focus:text-gray-800 focus:border-white text-sm text-white placeholder-blue-200 transition-all shadow-inner"
                  value={busquedaModal}
                  onChange={(e) => setBusquedaModal(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-white flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {estudiantesFiltradosModal.filter(e => e.nombre.trim() !== "").map((est) => (
                  <div
                    key={est.id}
                    onClick={() => verExpedienteDesdeListado(est.id)}
                    className="p-4 bg-white hover:bg-purple-50/20 border border-gray-200 hover:border-purple-400 rounded-xl shadow-sm flex flex-col gap-1 relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] active:scale-95 group"
                  >
                    {/* Al cambiar a texto libre, cualquier valor distinto de "Ninguna" activará esta barrita de alerta */}
                    {est.condicion !== 'Ninguna' && (
                      <div className="absolute top-0 right-0 w-2 h-full bg-amber-400" title={`Condición: ${est.condicion}`}></div>
                    )}

                    <div className="flex justify-between items-start">
                      <p className="font-black text-gray-800 uppercase text-sm tracking-wide group-hover:text-purple-700 transition-colors">{est.nombre}</p>
                      <div className="flex gap-1">
                        <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{est.nivelEstudio}</span>
                        <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{est.turno}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black">Sec. "{est.seccion}"</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${est.estado === 'Retirado' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{est.estado || 'Vigente'}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold text-gray-400">Edad:</span> {est.edad || '—'} años | {est.genero && <span className="text-gray-700 font-medium">({est.genero}) | </span>} <span className="font-semibold text-gray-400">C.E:</span> {est.cedulaEscolar || '—'}
                    </p>
                    <p className="text-xs text-gray-600 truncate"><span className="font-semibold text-gray-400">Dir:</span> {est.direccion || '—'}</p>
                    <p className="text-xs text-blue-900 font-medium mt-1 border-t border-gray-200 pt-1 border-dashed">
                      <span className="font-semibold text-gray-400">Rep:</span> {est.repNombre || '—'}
                      {est.repTelefono && ` (${est.repTelefono})`}
                    </p>
                    <div className="text-[10px] text-right text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold mt-1">
                      Ver expediente completo →
                    </div>
                  </div>
                ))}

                {estudiantes.filter(e => e.nombre.trim() !== "").length === 0 && (
                  <p className="col-span-2 text-center text-gray-400 py-10 font-medium bg-white">No hay estudiantes con nombres asignados en la lista.</p>
                )}
                {estudiantes.filter(e => e.nombre.trim() !== "").length > 0 && estudiantesFiltradosModal.filter(e => e.nombre.trim() !== "").length === 0 && (
                  <p className="col-span-2 text-center text-gray-400 py-10 font-medium bg-white">No se encontraron alumnos para "{busquedaModal}".</p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-white flex justify-end rounded-b-2xl">
              <button 
                onClick={() => { setShowModal(false); setBusquedaModal(""); }} 
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-md"
              >
                Cerrar Listado
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RegistroAlumnos;