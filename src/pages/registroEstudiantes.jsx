import { useState } from 'react';
import { Link } from 'react-router-dom';

const RegistroAlumnos = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [estudianteActivoId, setEstudianteActivoId] = useState(null);
  
  // Estado para controlar el texto de búsqueda independiente
  const [busquedaAcademica, setBusquedaAcademica] = useState("");
  const [dropdownAbiertoId, setDropdownAbiertoId] = useState(null);

  const opcionesCondicion = ['Ninguna', 'Autismo (TEA)', 'TDAH', 'Dislexia', 'Otra'];
  const opcionesGenero = ['Masculino', 'Femenino'];

  // 1. Definición exacta de las reglas de tu plantel
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

  // 2. Generación automática de las opciones para el buscador
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

  // NUEVO FILTRADO INTELIGENTE: Divide la búsqueda en palabras sueltas
  const opcionesFiltradas = opcionesAcademicas.filter(opt => {
    // Si no hay búsqueda, mostrar todo
    if (!busquedaAcademica.trim()) return true;

    // Limpiamos y separamos lo que escribió el usuario por espacios (ej: ["tarde", "1"])
    const palabrasBusqueda = busquedaAcademica.toLowerCase().trim().split(/\s+/);
    const textoOpcion = opt.label.toLowerCase();

    // La opción es válida si contiene TODAS las palabras escritas por el usuario
    return palabrasBusqueda.every(palabra => textoOpcion.includes(palabra));
  });

  const agregarFila = () => {
    const nuevoId = Date.now();
    const defectoAcademico = opcionesAcademicas[0].valores;

    const nuevoEstudiante = {
      id: nuevoId,
      nombre: '', edad: '', genero: '', direccion: '', 
      ...defectoAcademico,
      cedulaEscolar: '', fechaNacimiento: '', condicion: 'Ninguna', representanteLegal: '', representativeInstitucional: '',
      repNombre: '', repCi: '', repFechaLugarNac: '', repDireccion: '', repTrabaja: 'No', repDondeTrabaja: '', repEdad: '', repGradoInstruccion: '', repTelefono: '', repCorreo: ''
    };

    setEstudiantes([...estudiantes, nuevoEstudiante]);
    setEstudianteActivoId(nuevoId);
  };

  const handleInputChange = (id, campo, valor) => {
    setEstudiantes(prevEstudiantes =>
      prevEstudiantes.map(est => {
        if (est.id === id) {
          let copiaEstudiante = { ...est };

          if (campo === 'combinacionAcademica') {
            copiaEstudiante = { ...copiaEstudiante, ...valor };
          } else {
            copiaEstudiante[campo] = valor;
          }

          if ((campo === 'edad' || campo === 'repEdad') && valor !== "") {
            const num = parseInt(valor);
            copiaEstudiante[campo] = num < 0 ? "0" : valor;
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
    setEstudianteActivoId(id);
  };

  const guardarDatos = () => {
    alert("Datos de los estudiantes sincronizados correctamente.");
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
              onClick={() => setShowModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-bold shadow-md transition-all flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Ver Listado General
            </button>

            <Link to="/" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-bold hover:bg-gray-50 transition-all flex items-center shadow-sm">
              Inicio
            </Link>

            <button onClick={guardarDatos} className="bg-purple-600 hover:bg-purple-800 text-white px-6 py-2 rounded-md font-bold shadow-md transition-all active:scale-95">
              Guardar Datos
            </button>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h2 className="font-bold text-gray-700">Matrícula Actual</h2>
            <button
              onClick={agregarFila}
              className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2 rounded-lg font-bold flex items-center text-sm transition-colors shadow-sm border border-purple-200"
            >
              <span className="text-xl mr-2 leading-none">+</span> Añadir Nuevo Estudiante
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1200px] w-full">
              <div className="bg-white text-gray-500 text-xs font-bold uppercase tracking-widest grid grid-cols-[2fr_0.5fr_0.9fr_2fr_3.5fr_1.8fr_0.6fr] border-b text-center items-center">
                <div className="p-4 text-left">Nombre del Alumno</div>
                <div className="p-4">Edad</div>
                <div className="p-4 text-left">Género</div>
                <div className="p-4 text-left">Dirección</div>
                <div className="p-4 text-left">Asignación Académica (Escribe para filtrar)</div>
                <div className="p-4 text-left">Representante</div>
                <div className="p-4">Expediente</div>
              </div>

              <div className="divide-y divide-gray-100">
                {estudiantes.map((est) => {
                  const textoAsignacionActual = `${est.turno} - ${est.nivelEstudio} - Sección "${est.seccion}"`;
                  const esDropdownAbierto = dropdownAbiertoId === est.id;

                  return (
                    <div key={est.id} className="grid grid-cols-[2fr_0.5fr_0.9fr_2fr_3.5fr_1.8fr_0.6fr] hover:bg-gray-50 transition-colors items-center p-2">
                      <div className="px-2">
                        <input type="text" placeholder="Nombre completo" className="w-full p-2 bg-transparent rounded border border-transparent focus:border-purple-400 outline-none font-medium text-sm text-gray-800" value={est.nombre} onChange={(e) => handleInputChange(est.id, 'nombre', e.target.value)} />
                      </div>
                      <div className="px-2 text-center">
                        <input type="number" placeholder="0" min="0" className="w-full p-2 bg-transparent border border-transparent rounded text-center focus:border-purple-400 outline-none font-bold text-sm text-gray-800" value={est.edad} onChange={(e) => handleInputChange(est.id, 'edad', e.target.value)} />
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
                      
                      {/* BUSCADOR EN TABLA MULTI-PALABRA */}
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
                                <div 
                                  key={opt.id}
                                  onClick={() => seleccionarOpcionAcademica(est.id, opt)}
                                  className="p-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-medium cursor-pointer transition-colors"
                                >
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
                      <div className="px-2 flex justify-center">
                        <button
                          onClick={() => setEstudianteActivoId(est.id)}
                          className="bg-indigo-50 text-indigo-600 p-2 rounded-lg hover:bg-indigo-100 hover:text-indigo-800 transition-colors border border-indigo-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {estudiantes.length === 0 && (
                  <div className="col-span-7 p-8 text-center text-gray-400 font-medium">
                    No hay estudiantes registrados. Haz clic en "Añadir Nuevo Estudiante" para comenzar.
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">

            <div className="p-5 border-b flex justify-between items-center bg-[#002366] text-white">
              <div>
                <h2 className="text-xl font-bold">
                  {estudianteActivo.nombre ? `Expediente: ${estudianteActivo.nombre}` : 'Nuevo Expediente de Alumno'}
                </h2>
                <p className="text-xs text-blue-200">Complete la información detallada para el registro oficial.</p>
              </div>
              <button onClick={cerrarExpediente} className="text-white hover:text-gray-300 text-3xl leading-none">&times;</button>
            </div>

            <div className="p-6 overflow-y-auto bg-gray-50/50">

              {/* SECCIÓN 1: DATOS DEL ESTUDIANTE */}
              <div className="mb-8 bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-black text-[#0F172A] mb-4 border-b pb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">1</span> Datos del Estudiante
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Nombre Completo del Alumno <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full p-2 border rounded focus:border-blue-500 outline-none text-sm bg-blue-5/30 text-gray-800" value={estudianteActivo.nombre} onChange={(e) => handleInputChange(estudianteActivo.id, 'nombre', e.target.value)} placeholder="Ej. Juan Pérez" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Cédula Escolar</label>
                    <input type="text" className="w-full p-2 border rounded focus:border-blue-500 outline-none text-sm text-gray-800" value={estudianteActivo.cedulaEscolar} onChange={(e) => handleInputChange(estudianteActivo.id, 'cedulaEscolar', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Fecha de Nacimiento</label>
                    <input type="date" className="w-full p-2 border rounded focus:border-blue-500 outline-none text-sm text-gray-700" value={estudianteActivo.fechaNacimiento} onChange={(e) => handleInputChange(estudianteActivo.id, 'fechaNacimiento', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Edad del Alumno</label>
                    <input type="number" min="0" className="w-full p-2 border rounded focus:border-blue-500 outline-none text-sm text-gray-800" value={estudianteActivo.edad} onChange={(e) => handleInputChange(estudianteActivo.id, 'edad', e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Género</label>
                    <select className="w-full p-2 border rounded focus:border-blue-500 outline-none text-sm text-gray-700" value={estudianteActivo.genero} onChange={(e) => handleInputChange(estudianteActivo.id, 'genero', e.target.value)}>
                      <option value="">Seleccione...</option>
                      {opcionesGenero.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  {/* BUSCADOR EN EL MODAL MULTI-PALABRA */}
                  <div className="md:col-span-2 relative">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Asignación Académica Asignada</label>
                    <div className="flex items-center justify-between p-2 border rounded bg-white focus-within:border-blue-500">
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
                            <div 
                              key={opt.id}
                              onClick={() => seleccionarOpcionAcademica(estudianteActivo.id, opt)}
                              className="p-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium cursor-pointer transition-colors"
                            >
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

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Condición (Neurodiversidad)</label>
                    <select className="w-full p-2 border rounded focus:border-blue-500 outline-none text-sm text-gray-700" value={estudianteActivo.condicion} onChange={(e) => handleInputChange(estudianteActivo.id, 'condicion', e.target.value)}>
                      {opcionesCondicion.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Representante Legal</label>
                    <input type="text" className="w-full p-2 border rounded focus:border-blue-500 outline-none text-sm text-gray-800" value={estudianteActivo.representanteLegal} onChange={(e) => handleInputChange(estudianteActivo.id, 'representanteLegal', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Representante Institucional</label>
                    <input type="text" className="w-full p-2 border rounded focus:border-blue-500 outline-none text-sm text-gray-800" value={estudianteActivo.representanteInstitucional} onChange={(e) => handleInputChange(estudianteActivo.id, 'representanteInstitucional', e.target.value)} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Dirección de Residencia</label>
                    <textarea className="w-full p-2 border rounded focus:border-blue-500 outline-none text-sm text-gray-800" rows="2" value={estudianteActivo.direccion} onChange={(e) => handleInputChange(estudianteActivo.id, 'direccion', e.target.value)}></textarea>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: DATOS DEL REPRESENTANTE */}
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-black text-[#0F172A] mb-4 border-b pb-2 flex items-center">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">2</span> Datos del Representante
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Nombre del Representante</label>
                    <input type="text" className="w-full p-2 border rounded focus:border-purple-500 outline-none text-sm text-gray-800" value={estudianteActivo.repNombre} onChange={(e) => handleInputChange(estudianteActivo.id, 'repNombre', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Cédula de Identidad</label>
                    <input type="text" className="w-full p-2 border rounded focus:border-purple-500 outline-none text-sm text-gray-800" value={estudianteActivo.repCi} onChange={(e) => handleInputChange(estudianteActivo.id, 'repCi', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Fecha y Lugar de Nacimiento</label>
                    <input type="text" placeholder="Ej: 15/04/1985, Valencia" className="w-full p-2 border rounded focus:border-purple-500 outline-none text-sm text-gray-800" value={estudianteActivo.repFechaLugarNac} onChange={(e) => handleInputChange(estudianteActivo.id, 'repFechaLugarNac', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Teléfono</label>
                    <input type="tel" className="w-full p-2 border rounded focus:border-purple-500 outline-none text-sm text-gray-800" value={estudianteActivo.repTelefono} onChange={(e) => handleInputChange(estudianteActivo.id, 'repTelefono', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Correo Electrónico</label>
                    <input type="email" className="w-full p-2 border rounded focus:border-purple-500 outline-none text-sm text-gray-800" value={estudianteActivo.repCorreo} onChange={(e) => handleInputChange(estudianteActivo.id, 'repCorreo', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Edad</label>
                    <input type="number" min="18" className="w-full p-2 border rounded focus:border-purple-500 outline-none text-sm text-gray-800" value={estudianteActivo.repEdad} onChange={(e) => handleInputChange(estudianteActivo.id, 'repEdad', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Grado de Instrucción</label>
                    <select className="w-full p-2 border rounded focus:border-purple-500 outline-none text-sm text-gray-700" value={estudianteActivo.repGradoInstruccion} onChange={(e) => handleInputChange(estudianteActivo.id, 'repGradoInstruccion', e.target.value)}>
                      <option value="">Seleccione...</option>
                      <option value="Básica">Básica</option>
                      <option value="Bachiller">Bachiller</option>
                      <option value="Técnico Medio">Técnico Medio</option>
                      <option value="TSU">TSU</option>
                      <option value="Universitario">Universitario</option>
                      <option value="Postgrado">Postgrado</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Dirección de Residencia</label>
                    <input type="text" className="w-full p-2 border rounded focus:border-purple-500 outline-none text-sm text-gray-800" value={estudianteActivo.repDireccion} onChange={(e) => handleInputChange(estudianteActivo.id, 'repDireccion', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">¿Trabaja?</label>
                    <select className="w-full p-2 border rounded focus:border-purple-500 outline-none text-sm text-gray-700" value={estudianteActivo.repTrabaja} onChange={(e) => handleInputChange(estudianteActivo.id, 'repTrabaja', e.target.value)}>
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-xs font-bold mb-1 ${estudianteActivo.repTrabaja === 'Sí' ? 'text-gray-600' : 'text-gray-400'}`}>¿Dónde trabaja?</label>
                    <input
                      type="text"
                      className={`w-full p-2 border rounded outline-none text-sm ${estudianteActivo.repTrabaja === 'Sí' ? 'focus:border-purple-500 bg-white text-gray-800' : 'bg-gray-100 cursor-not-allowed text-gray-400'}`}
                      value={estudianteActivo.repDondeTrabaja}
                      onChange={(e) => handleInputChange(estudianteActivo.id, 'repDondeTrabaja', e.target.value)}
                      disabled={estudianteActivo.repTrabaja === 'No'}
                      placeholder={estudianteActivo.repTrabaja === 'No' ? 'No aplica' : 'Empresa o lugar de trabajo'}
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button onClick={cerrarExpediente} className="bg-[#002366] hover:bg-blue-900 text-white px-8 py-2 rounded-lg font-bold transition-colors shadow-md">
                Guardar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE LISTADO GENERAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-purple-700 text-white">
              <div>
                <h2 className="text-xl font-bold">Alumnos Registrados</h2>
                <p className="text-xs text-purple-200">Haz clic sobre cualquier tarjeta para ver o editar su expediente completo.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200 text-3xl leading-none">&times;</button>
            </div>

            <div className="p-6 overflow-y-auto bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {estudiantes.filter(e => e.nombre.trim() !== "").map((est) => (
                  <div
                    key={est.id}
                    onClick={() => verExpedienteDesdeListado(est.id)}
                    className="p-4 bg-white hover:bg-purple-50/50 border border-gray-200 hover:border-purple-400 rounded-xl shadow-sm flex flex-col gap-1 relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] active:scale-95 group"
                  >
                    {est.condicion !== 'Ninguna' && (
                      <div className="absolute top-0 right-0 w-2 h-full bg-amber-400" title={`Condición: ${est.condicion}`}></div>
                    )}

                    <div className="flex justify-between items-start">
                      <p className="font-black text-gray-800 uppercase text-sm tracking-wide group-hover:text-purple-700 transition-colors">{est.nombre}</p>
                      <div className="flex gap-1">
                        <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{est.nivelEstudio}</span>
                        <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{est.turno}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black">Sec. "{est.seccion}"</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold text-gray-400">Edad:</span> {est.edad || '—'} años | {est.genero && <span className="text-gray-700 font-medium">({est.genero}) | </span>} <span className="font-semibold text-gray-400">C.E:</span> {est.cedulaEscolar || '—'}
                    </p>
                    <p className="text-xs text-gray-600 truncate"><span className="font-semibold text-gray-400">Dir:</span> {est.direccion || '—'}</p>
                    <p className="text-xs text-blue-900 font-medium mt-1 border-t pt-1 border-dashed border-gray-100">
                      <span className="font-semibold text-gray-400">Rep:</span> {est.repNombre || '—'}
                      {est.repTelefono && ` (${est.repTelefono})`}
                    </p>
                    <div className="text-[10px] text-right text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold mt-1">
                      Ver expediente completo →
                    </div>
                  </div>
                ))}

                {estudiantes.filter(e => e.nombre.trim() !== "").length === 0 && (
                  <p className="col-span-2 text-center text-gray-400 py-10 font-medium">No hay estudiantes con nombres asignados in la lista.</p>
                )}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button onClick={() => setShowModal(false)} className="bg-gray-800 hover:bg-black text-white px-6 py-2 rounded-lg font-bold transition-colors">
                Cerrar Vista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistroAlumnos;