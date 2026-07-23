import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generarExcelEstudiantes } from '../components/Excel_comp/excelRegistro'; // Lógica de excel importada

// --- FUNCIÓN AUXILIAR PARA CÁLCULO AUTOMÁTICO DE EDAD ---
const calcularEdad = (fechaStr) => {
  if (!fechaStr) return '';
  const partes = fechaStr.split('-');
  if (partes.length !== 3) return '';
  
  const ano = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10);
  const dia = parseInt(partes[2], 10);
  
  if (isNaN(ano) || isNaN(mes) || isNaN(dia)) return '';
  
  const hoy = new Date();
  let edad = hoy.getFullYear() - ano;
  const mesActual = hoy.getMonth() + 1;
  const diaActual = hoy.getDate();
  
  if (mesActual < mes || (mesActual === mes && diaActual < dia)) {
    edad--;
  }
  
  return edad < 0 ? '0' : String(edad);
};

const RegistroAlumnos = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [estudianteActivoId, setEstudianteActivoId] = useState(null);

  const [busquedaAcademica, setBusquedaAcademica] = useState("");
  const [dropdownAbiertoId, setDropdownAbiertoId] = useState(null);
  const [busquedaEstudiante, setBusquedaEstudiante] = useState("");
  const [busquedaModal, setBusquedaModal] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);

  // --- ESTADOS DE EXCEL INTEGRADOS ---
  const [showModalExportar, setShowModalExportar] = useState(false);
  const [seccionExportar, setSeccionExportar] = useState("");
  const [tipoMatricula, setTipoMatricula] = useState("final"); 
  
  const getPrimerDiaMes = () => {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    return `01-${mes}-${anio}`;
  };
  const [nombreArchivo, setNombreArchivo] = useState(getPrimerDiaMes());
  // ------------------------------------

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

  const cargarEstudiantesDesdeBD = async () => {
    try {
      if (window.pywebview && window.pywebview.api && window.pywebview.api.obtener_estudiantes) {
        setCargando(true);
        const data = await window.pywebview.api.obtener_estudiantes();
        if (Array.isArray(data)) {
          const estudiantesBD = data.map(est => {
            const edadCalculada = est.fechaNacimiento ? calcularEdad(est.fechaNacimiento) : est.edad;
            return {
              ...est,
              esDeBD: true,
              estado: est.estado || 'Vigente',
              edad: (edadCalculada !== undefined && edadCalculada !== '' && edadCalculada !== '0') ? String(edadCalculada) : (est.edad !== '0' ? (est.edad || '') : ''),
              tieneRepInstitucional: Boolean(est.tieneRepInstitucional || est.re_inst_ci !== est.repCi)
            };
          });
          setEstudiantes(estudiantesBD);
        }
        setCargando(false);
      }
    } catch (error) {
      console.error("Error al cargar estudiantes desde la Base de Datos:", error);
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEstudiantesDesdeBD();
  }, []);

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
    const coincideApellido = (est.apellido || '').toLowerCase().includes(termino);
    const coincideCedula = (est.cedulaEscolar || '').toLowerCase().includes(termino);
    return coincideNombre || coincideApellido || coincideCedula;
  });

  const estudiantesFiltradosModal = estudiantes.filter(est => {
    if (!busquedaModal.trim()) return true;
    const termino = busquedaModal.toLowerCase().trim();
    const coincideNombre = (est.nombre || '').toLowerCase().includes(termino);
    const coincideApellido = (est.apellido || '').toLowerCase().includes(termino);
    const coincideCedula = (est.cedulaEscolar || '').toLowerCase().includes(termino);
    return coincideNombre || coincideApellido || coincideCedula;
  });

  // --- LÓGICA DE EXPORTACIÓN Y FILTRO DE EXCEL ---
  const obtenerConteoSeccion = (idSeccion) => {
    return estudiantes.filter(est => {
      if (!est.nombre || !est.nombre.trim()) return false;
      const idSeccionEstudiante = `${est.turno}-${est.nivelEstudio}-${est.seccion}`.toLowerCase().replace(/ /g, '_');
      return idSeccionEstudiante === idSeccion;
    }).length;
  };

  const estudiantesAExportar = estudiantes.filter(est => {
    if (!est.nombre || est.nombre.trim() === '') return false;
    if (!seccionExportar) return false; 
    const idSeccionEstudiante = `${est.turno}-${est.nivelEstudio}-${est.seccion}`.toLowerCase().replace(/ /g, '_');
    return idSeccionEstudiante === seccionExportar;
  });

  const exportarAExcel = async () => {
    if (!seccionExportar) {
      alert("Debe seleccionar una sección para exportar.");
      return;
    }
    const descargado = await generarExcelEstudiantes(estudiantes, seccionExportar, nombreArchivo, getPrimerDiaMes(), tipoMatricula);
    if (descargado) {
      setShowModalExportar(false);
    }
  };
  // ------------------------------------------------

  const ordenarEstudiantesAZ = () => {
    const estudiantesOrdenados = [...estudiantes].sort((a, b) => {
      const nombreCompletoA = `${a.apellido || ''} ${a.nombre || ''}`.trim();
      const nombreCompletoB = `${b.apellido || ''} ${b.nombre || ''}`.trim();
      if (!nombreCompletoA) return 1;
      if (!nombreCompletoB) return -1;
      return nombreCompletoA.localeCompare(nombreCompletoB);
    });
    setEstudiantes(estudiantesOrdenados);
  };

  const agregarFila = () => {
    if (!modoEdicion) setModoEdicion(true);

    const nuevoId = `temp_${Date.now()}`;
    const defectoAcademico = opcionesAcademicas[0].valores;

    const nuevoEstudiante = {
      id: nuevoId,
      esDeBD: false,
      nombre: '',
      apellido: '',
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
      tieneRepInstitucional: false,
      re_inst_ci: '',
      representanteInstitucional: '',
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
            nuevoValor = String(nuevoValor).replace(/\D/g, ''); 
          }

          if (campo === 'combinacionAcademica') {
            copiaEstudiante = { ...copiaEstudiante, ...nuevoValor };
          } else if (campo === 'fechaNacimiento') {
            copiaEstudiante.fechaNacimiento = nuevoValor;
            const edadCalculada = calcularEdad(nuevoValor);
            if (edadCalculada !== '') {
              copiaEstudiante.edad = edadCalculada;
            }
          } else {
            copiaEstudiante[campo] = nuevoValor;
          }

          if (campo === 'edad' && nuevoValor !== "") {
            const num = parseInt(nuevoValor, 10);
            copiaEstudiante[campo] = isNaN(num) || num < 0 ? "" : String(num);
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

  const verExpedienteDesdeListado = (id) => {
    setShowModal(false);
    setBusquedaModal("");
    setEstudianteActivoId(id);
  };

  const cerrarExpediente = () => {
    const estudianteActual = estudiantes.find(est => est.id === estudianteActivoId);
    if (estudianteActual && !estudianteActual.esDeBD && estudianteActual.nombre.trim() === '' && estudianteActual.apellido.trim() === '') {
      setEstudiantes(prev => prev.filter(est => est.id !== estudianteActivoId));
    }
    setEstudianteActivoId(null);
    setDropdownAbiertoId(null);
  };

  const guardarDatos = async () => {
    const estudiantesValidos = estudiantes.filter(est => 
      (est.nombre.trim() !== '' || est.apellido.trim() !== '') && est.cedulaEscolar.trim() !== ''
    );

    if (estudiantesValidos.length === 0) {
      alert("⚠️ No hay estudiantes válidos para guardar. Asegúrese de llenar al menos Nombres, Apellidos y Cédula Escolar.");
      return;
    }

    try {
      let exitoCount = 0;
      let errores = [];

      if (window.pywebview && window.pywebview.api) {
        setCargando(true);

        for (let estudiante of estudiantesValidos) {
          let payload = { ...estudiante };
          
          if (String(payload.id).startsWith('temp_') || !payload.esDeBD) {
            delete payload.id;
          }
          delete payload.esDeBD; 
          
          if (!payload.tieneRepInstitucional) {
            payload.re_inst_ci = payload.repCi;
            payload.representanteInstitucional = payload.repNombre || payload.representanteLegal;
            payload.re_inst_direccion = payload.repDireccion || payload.direccion;
            payload.re_inst_fechaNacimiento = payload.repFechaNacimiento;
            payload.re_inst_gradoInstruccion = payload.repGradoInstruccion;
            payload.re_inst_trabaja = payload.repTrabaja;
            payload.re_inst_dondeTrabaja = payload.repDondeTrabaja;
            payload.re_inst_parentesco = payload.repParentesco;
            payload.re_inst_lugarNacimiento = payload.repLugarNacimiento;
            payload.re_inst_telefono = payload.repTelefono;
            payload.re_inst_correo = payload.repCorreo;
          }

          const respuesta = await window.pywebview.api.registrar_estudiante_completo(payload);
          
          if (respuesta && (respuesta.status === 'success' || respuesta.status === 'ok')) {
            exitoCount++;
          } else {
            const msjError = respuesta ? respuesta.message : 'Error desconocido en backend';
            errores.push(`- ${estudiante.nombre} ${estudiante.apellido}: ${msjError}`);
          }
        }

        await cargarEstudiantesDesdeBD();
        setCargando(false);
        setModoEdicion(false);

        if (errores.length === 0) {
          alert(`✅ ¡Éxito! Se sincronizaron y mantuvieron ${exitoCount} estudiante(s) en la pantalla y en la Base de Datos.`);
        } else {
          alert(`⚠️ Se guardaron ${exitoCount} estudiantes, pero hubo errores:\n\n${errores.join('\n')}`);
        }
      } else {
        console.warn("API de pywebview no detectada. Datos en memoria:", estudiantesValidos);
        setModoEdicion(false);
        alert("🖥️ Estás en modo navegador local. Los cambios se mantendrán en la tabla actual mientras no recargues la página.");
      }
    } catch (error) {
      setCargando(false);
      alert(`❌ Ocurrió un error crítico de conexión con el controlador:\n${error.message}`);
    }
  };

  const estudianteActivo = estudiantes.find(est => est.id === estudianteActivoId);

  return (
    <div className="p-8 page-transition relative">
      <div className="flex flex-col gap-6">

        {/* ENCABEZADO DE LA SECCIÓN */}
        <header className="flex flex-col gap-5 border-b border-white/20 pb-5">
          
          {/* Fila Superior: Solo el Título */}
          <div>
            <p className="text-sm text-purple-400 font-bold uppercase tracking-widest drop-shadow-md">Módulo Académico</p>
            <h1 className="text-3xl font-black text-white drop-shadow-lg">Registro de Alumnos</h1>
          </div>

          {/* Fila Inferior: Barra de herramientas (Todos los botones) */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-white/10 backdrop-blur-sm shadow-inner">
            
            {/* Grupo de Edición */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setModoEdicion(!modoEdicion)}
                className={`px-4 py-2 rounded-md font-bold shadow-md transition-all flex items-center active:scale-95 border ${modoEdicion
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 animate-pulse'
                  : 'bg-slate-700/80 hover:bg-slate-600 text-white border-slate-500'
                  }`}
              >
                {modoEdicion ? '🔓 Modo Edición (Activo)' : '🔒 Gestionar Matrícula'}
              </button>

              <button 
                onClick={guardarDatos} 
                disabled={cargando || !modoEdicion}
                className={`px-6 py-2 rounded-md font-bold shadow-md transition-all flex items-center gap-2 ${cargando || !modoEdicion ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50' : 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'}`}
                title={!modoEdicion ? "Debe presionar 'Gestionar Matrícula' para poder editar y guardar" : "Guardar cambios en la Base de Datos"}
              >
                {cargando ? '⌛ Guardando...' : '💾 Guardar Datos'}
              </button>
            </div>

            {/* Separador visual (solo visible en pantallas grandes) */}
            <div className="hidden md:block w-px h-8 bg-white/20 mx-2"></div>

            {/* Grupo de Vista/Orden */}
            <div className="flex flex-wrap gap-2">
              <button onClick={ordenarEstudiantesAZ} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-bold shadow-md transition-all flex items-center active:scale-95">
                🔤 Ordenar A-Z
              </button>

              <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-bold shadow-md transition-all flex items-center active:scale-95">
                📊 Ver Listado General
              </button>
            </div>

            {/* Grupo de la Derecha (Excel + Volver) empujado al final con md:ml-auto */}
            <div className="flex flex-wrap items-center gap-3 md:ml-auto">
              {/* BOTÓN EXCEL INTEGRADO EN LA BARRA */}
              <button
                onClick={() => {
                  const hoy = new Date();
                  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
                  const anio = hoy.getFullYear();
                  
                  // Nombre por defecto al abrir, ej: Exportacion_07-2026
                  setNombreArchivo(`Exportacion_${mes}-${anio}`); 
                  setSeccionExportar(""); 
                  setShowModalExportar(true);
                }}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md font-bold shadow-[0_0_10px_rgba(34,197,94,0.4)] transition-all flex items-center active:scale-95 border border-green-400"
              >
                📗 Exportar Excel
              </button>

              <Link to="/" className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-md font-bold hover:bg-gray-100 transition-all flex items-center shadow-sm">
                🏠 Volver al Inicio
              </Link>
            </div>

          </div>
        </header>

        {/* TABLA DE MATRÍCULA ACTUAL */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-4 bg-white border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-gray-700 whitespace-nowrap">Matrícula Actual ({estudiantes.length})</h2>
            
            <div className="w-full sm:max-w-md">
              <input
                type="text"
                placeholder="🔍 Buscar por nombres, apellidos o cédula escolar..."
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
            <div className="min-w-[1400px] w-full">
              <div className="bg-white text-gray-500 text-xs font-bold uppercase tracking-widest grid grid-cols-[1.3fr_1.3fr_0.5fr_0.9fr_1.3fr_2.5fr_1.3fr_1fr_0.6fr] border-b border-gray-200 text-center items-center">
                <div className="p-4 text-left">Nombres</div>
                <div className="p-4 text-left">Apellidos</div>
                <div className="p-4">Edad</div>
                <div className="p-4 text-left">Género</div>
                <div className="p-4 text-left">Dirección</div>
                <div className="p-4 text-left">Asignación Académica</div>
                <div className="p-4 text-left">Representante</div>
                <div className="p-4">Vigencia</div>
                <div className="p-4">Expediente</div>
              </div>

              <div className="divide-y divide-gray-100">
                {estudiantesFiltrados.map((est) => {
                  const textoAsignacionActual = `${est.turno || ''} - ${est.nivelEstudio || ''} - Sección "${est.seccion || ''}"`;

                  return (
                    <div key={est.id} className={`grid grid-cols-[1.3fr_1.3fr_0.5fr_0.9fr_1.3fr_2.5fr_1.3fr_1fr_0.6fr] transition-colors items-center p-2 ${!modoEdicion ? 'bg-gray-50/50 hover:bg-gray-100/50' : 'bg-white hover:bg-purple-50/20'}`}>
                      <div className="px-2">
                        <input type="text" disabled={!modoEdicion} placeholder="Nombres" className={`w-full p-2 rounded border border-transparent font-medium text-sm text-gray-800 outline-none ${!modoEdicion ? 'bg-transparent cursor-not-allowed text-gray-600' : 'bg-transparent focus:border-purple-400'}`} value={est.nombre || ''} onChange={(e) => handleInputChange(est.id, 'nombre', e.target.value)} />
                      </div>
                      <div className="px-2">
                        <input type="text" disabled={!modoEdicion} placeholder="Apellidos" className={`w-full p-2 rounded border border-transparent font-medium text-sm text-gray-800 outline-none ${!modoEdicion ? 'bg-transparent cursor-not-allowed text-gray-600' : 'bg-transparent focus:border-purple-400'}`} value={est.apellido || ''} onChange={(e) => handleInputChange(est.id, 'apellido', e.target.value)} />
                      </div>
                      <div className="px-2 text-center">
                        <input type="text" inputMode="numeric" disabled={!modoEdicion} placeholder="—" className={`w-full p-2 border border-transparent rounded text-center font-bold text-sm text-gray-800 outline-none ${!modoEdicion ? 'bg-transparent cursor-not-allowed text-gray-600' : 'bg-transparent focus:border-purple-400'}`} value={est.edad || ''} onChange={(e) => handleInputChange(est.id, 'edad', e.target.value)} />
                      </div>
                      <div className="px-2">
                        <select disabled={!modoEdicion} className={`w-full p-2 border border-transparent rounded font-semibold text-gray-700 text-sm outline-none ${!modoEdicion ? 'bg-transparent cursor-not-allowed text-gray-600 appearance-none' : 'bg-transparent focus:border-purple-400 cursor-pointer'}`} value={est.genero || ''} onChange={(e) => handleInputChange(est.id, 'genero', e.target.value)}>
                          <option value="">Seleccione...</option>
                          {opcionesGenero.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="px-2">
                        <input type="text" disabled={!modoEdicion} placeholder="Dirección" className={`w-full p-2 rounded border border-transparent text-sm text-gray-800 outline-none ${!modoEdicion ? 'bg-transparent cursor-not-allowed text-gray-600' : 'bg-transparent focus:border-purple-400'}`} value={est.direccion || ''} onChange={(e) => handleInputChange(est.id, 'direccion', e.target.value)} />
                      </div>
                      
                      <div className="px-2">
                        <div className="w-full p-2 bg-gray-100/80 border border-transparent rounded font-semibold text-sm text-gray-700 truncate cursor-not-allowed select-none" title={`${textoAsignacionActual} — Para modificar la sección, abra el Expediente.`}>
                          {textoAsignacionActual || 'Sin asignar'}
                        </div>
                      </div>

                      <div className="px-2">
                        <input type="text" disabled={!modoEdicion} placeholder="Representante" className={`w-full p-2 rounded border border-transparent text-sm text-gray-800 outline-none ${!modoEdicion ? 'bg-transparent cursor-not-allowed text-gray-600' : 'bg-transparent focus:border-purple-400'}`} value={est.repNombre || ''} onChange={(e) => handleInputChange(est.id, 'repNombre', e.target.value)} />
                      </div>
                      <div className="px-2 text-center">
                        <select disabled={!modoEdicion} className={`w-full p-2 border border-transparent rounded font-bold text-xs text-center outline-none ${!modoEdicion ? 'cursor-not-allowed appearance-none opacity-80' : 'cursor-pointer'} ${est.estado === 'Retirado' ? 'text-red-600 bg-red-50/50' : 'text-green-600 bg-green-50/50'}`} value={est.estado || 'Vigente'} onChange={(e) => handleInputChange(est.id, 'estado', e.target.value)}>
                          <option value="Vigente" className="text-green-600">🟢 Vigente</option>
                          <option value="Retirado" className="text-red-600">🔴 Retirado</option>
                        </select>
                      </div>
                      <div className="px-2 flex justify-center">
                        <button onClick={() => setEstudianteActivoId(est.id)} className="bg-indigo-50 text-indigo-600 p-2 rounded-lg hover:bg-indigo-100 hover:text-indigo-800 transition-colors border border-indigo-100" title="Ver Expediente">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {cargando && (
                  <div className="col-span-9 p-8 text-center text-purple-600 font-bold bg-white">
                    ⌛ Sincronizando con la Base de Datos...
                  </div>
                )}
                {!cargando && estudiantes.length === 0 && (
                  <div className="col-span-9 p-8 text-center text-gray-400 font-medium bg-white">
                    No hay estudiantes registrados. Haz clic en "Añadir Nuevo Estudiante" para comenzar.
                  </div>
                )}
                {!cargando && estudiantes.length > 0 && estudiantesFiltrados.length === 0 && (
                  <div className="col-span-9 p-8 text-center text-gray-400 font-medium bg-white">
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
                  {estudianteActivo.nombre || estudianteActivo.apellido ? `Expediente: ${estudianteActivo.nombre} ${estudianteActivo.apellido}`.trim() : 'Nuevo Expediente de Alumno'}
                </h2>
                <p className="text-xs text-blue-200">Complete la información detallada para el registro oficial.</p>
              </div>
              <button onClick={cerrarExpediente} className="text-white hover:text-gray-300 text-3xl leading-none">&times;</button>
            </div>

            <div className="p-6 overflow-y-auto bg-white">
              <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-black text-[#0F172A] mb-4 border-b pb-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">1</span> Datos del Estudiante
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">Campos obligatorios (*)</span>
                  </div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Nombres del Alumno <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.nombre || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'nombre', e.target.value)} placeholder="Ej. Juan Luis" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Apellidos Del Alumno <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.apellido || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'apellido', e.target.value)} placeholder="Ej. Pérez Lopez" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Cédula Escolar</label>
                    <input type="text" inputMode="numeric" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.cedulaEscolar || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'cedulaEscolar', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Fecha de Nacimiento</label>
                    <input type="date" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-700" value={estudianteActivo.fechaNacimiento || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'fechaNacimiento', e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Género</label>
                    <select className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-700" value={estudianteActivo.genero || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'genero', e.target.value)}>
                      <option value="">Seleccione...</option>
                      {opcionesGenero.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de Sangre</label>
                    <select className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-700" value={estudianteActivo.tipoSangre || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'tipoSangre', e.target.value)}>
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
                    <input type="text" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.tallaMono || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'tallaMono', e.target.value)} placeholder="Ej. 10, S, M" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Talla de Camisa</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.tallaCamisa || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'tallaCamisa', e.target.value)} placeholder="Ej. 10, S, M" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Talla de Calzado</label>
                    <input type="text" inputMode="numeric" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.tallaCalzado || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'tallaCalzado', e.target.value)} placeholder="Ej. 32" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Condición (Neurodiversidad)</label>
                    <input
                      type="text"
                      list="lista-condiciones"
                      className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-700"
                      value={estudianteActivo.condicion || ''}
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
                    <textarea className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" rows="2" value={estudianteActivo.direccion || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'direccion', e.target.value)}></textarea>
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
                        <input type="text" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.representanteInstitucional || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'representanteInstitucional', e.target.value)} placeholder="Ej. Ana Gómez" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">C.I. Rep. Institucional</label>
                        <input type="text" inputMode="numeric" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.re_inst_ci || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_ci', e.target.value)} placeholder="Ej. 12345678" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Parentesco (Inst.)</label>
                        <input
                          type="text"
                          list="lista-parentescos"
                          className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800 font-medium"
                          value={estudianteActivo.re_inst_parentesco || ''}
                          placeholder="Escriba o seleccione..."
                          onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_parentesco', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Fecha Nacimiento (Inst.)</label>
                        <input type="date" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.re_inst_fechaNacimiento || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_fechaNacimiento', e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Lugar de Nacimiento (Inst.)</label>
                        <input type="text" placeholder="Ej: Valencia, Carabobo" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.re_inst_lugarNacimiento || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_lugarNacimiento', e.target.value)} />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Teléfono (Inst.)</label>
                        <input type="text" inputMode="numeric" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.re_inst_telefono || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_telefono', e.target.value)} placeholder="Ej. 04141234567" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Correo Electrónico (Inst.)</label>
                        <input type="email" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.re_inst_correo || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_correo', e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Grado de Instrucción (Inst.)</label>
                        <select className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-700" value={estudianteActivo.re_inst_gradoInstruccion || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_gradoInstruccion', e.target.value)}>
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
                        <select className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-700" value={estudianteActivo.re_inst_trabaja || 'No'} onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_trabaja', e.target.value)}>
                          <option value="Sí">Sí</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <label className={`block text-xs font-bold mb-1 ${estudianteActivo.re_inst_trabaja === 'Sí' ? 'text-gray-600' : 'text-gray-400'}`}>¿Dónde trabaja? (Inst.)</label>
                        <input
                          type="text"
                          className={`w-full p-2 border border-gray-300 rounded outline-none text-sm ${estudianteActivo.re_inst_trabaja === 'Sí' ? 'focus:border-blue-500 bg-white text-gray-800' : 'bg-white text-gray-400 cursor-not-allowed border-dashed'}`}
                          value={estudianteActivo.re_inst_dondeTrabaja || ''}
                          onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_dondeTrabaja', e.target.value)}
                          disabled={estudianteActivo.re_inst_trabaja === 'No'}
                          placeholder={estudianteActivo.re_inst_trabaja === 'No' ? 'No aplica' : 'Empresa o lugar de trabajo'}
                        />
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Dirección de Residencia (Inst.)</label>
                        <input type="text" className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.re_inst_direccion || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 're_inst_direccion', e.target.value)} />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SECCIÓN REPRESENTANTE LEGAL */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-black text-[#0F172A] mb-4 border-b pb-2 flex items-center">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">2</span> Datos del Representante Legal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Representante Legal</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.repNombre || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'repNombre', e.target.value)} placeholder="Ej. Carlos Pérez" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Cédula de Identidad</label>
                    <input type="text" inputMode="numeric" className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.repCi || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'repCi', e.target.value)} placeholder="Ej. 10222333" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Parentesco</label>
                    <input
                      type="text"
                      list="lista-parentescos"
                      className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-800 font-medium"
                      value={estudianteActivo.repParentesco || ''}
                      placeholder="Escriba o seleccione..."
                      onChange={(e) => handleInputChange(estudianteActivo.id, 'repParentesco', e.target.value)}
                    />

                    <datalist id="lista-parentescos">
                      <option value="Madre" />
                      <option value="Padre" />
                      <option value="Abuelo / Abuela" />
                      <option value="Tío / Tía" />
                      <option value="Hermano / Hermana" />
                      <option value="Madrina / Padrino" />
                      <option value="Tutor Legal" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Fecha de Nacimiento</label>
                    <input type="date" className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.repFechaNacimiento || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'repFechaNacimiento', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Lugar de Nacimiento</label>
                    <input type="text" placeholder="Ej: Valencia, Carabobo" className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.repLugarNacimiento || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'repLugarNacimiento', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Teléfono</label>
                    <input type="text" inputMode="numeric" className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.repTelefono || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'repTelefono', e.target.value)} placeholder="Ej. 04120000000" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Correo Electrónico</label>
                    <input type="email" className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.repCorreo || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'repCorreo', e.target.value)} placeholder="ejemplo@correo.com" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Grado de Instrucción</label>
                    <select className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-700" value={estudianteActivo.repGradoInstruccion || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'repGradoInstruccion', e.target.value)}>
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
                    <select className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-700" value={estudianteActivo.repTrabaja || 'No'} onChange={(e) => handleInputChange(estudianteActivo.id, 'repTrabaja', e.target.value)}>
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className={`block text-xs font-bold mb-1 ${estudianteActivo.repTrabaja === 'Sí' ? 'text-gray-600' : 'text-gray-400'}`}>¿Dónde trabaja?</label>
                    <input
                      type="text"
                      className={`w-full p-2 border border-gray-300 rounded outline-none text-sm ${estudianteActivo.repTrabaja === 'Sí' ? 'focus:border-purple-500 bg-white text-gray-800' : 'bg-white text-gray-400 cursor-not-allowed border-dashed'}`}
                      value={estudianteActivo.repDondeTrabaja || ''}
                      onChange={(e) => handleInputChange(estudianteActivo.id, 'repDondeTrabaja', e.target.value)}
                      disabled={estudianteActivo.repTrabaja === 'No'}
                      placeholder={estudianteActivo.repTrabaja === 'No' ? 'No aplica' : 'Empresa o lugar de trabajo'}
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Dirección de Residencia</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded focus:border-purple-500 outline-none text-sm bg-white text-gray-800" value={estudianteActivo.repDireccion || ''} onChange={(e) => handleInputChange(estudianteActivo.id, 'repDireccion', e.target.value)} placeholder="Dirección completa del representante" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-white flex justify-end rounded-b-2xl">
              <button onClick={cerrarExpediente} className="bg-[#002366] hover:bg-blue-900 text-white px-8 py-2 rounded-lg font-bold transition-colors shadow-md">
                Cerrar Expediente
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
                  placeholder="🔍 Buscar en el listado por nombres, apellidos o cédula escolar..."
                  className="w-full p-2.5 bg-white/10 border border-blue-400/50 rounded-xl outline-none focus:bg-white focus:text-gray-800 focus:border-white text-sm text-white placeholder-blue-200 transition-all shadow-inner"
                  value={busquedaModal}
                  onChange={(e) => setBusquedaModal(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-white flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {estudiantesFiltradosModal.filter(e => (e.nombre && e.nombre.trim() !== "") || (e.apellido && e.apellido.trim() !== "")).map((est) => (
                  <div
                    key={est.id}
                    onClick={() => verExpedienteDesdeListado(est.id)}
                    className="p-4 bg-white hover:bg-purple-50/20 border border-gray-200 hover:border-purple-400 rounded-xl shadow-sm flex flex-col gap-1 relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] active:scale-95 group"
                  >
                    {est.condicion !== 'Ninguna' && (
                      <div className="absolute top-0 right-0 w-2 h-full bg-amber-400" title={`Condición: ${est.condicion}`}></div>
                    )}

                    <div className="flex justify-between items-start">
                      <p className="font-black text-gray-800 uppercase text-sm tracking-wide group-hover:text-purple-700 transition-colors">
                        {est.nombre} {est.apellido}
                      </p>
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

                {estudiantes.filter(e => (e.nombre && e.nombre.trim() !== "") || (e.apellido && e.apellido.trim() !== "")).length === 0 && (
                  <p className="col-span-2 text-center text-gray-400 py-10 font-medium bg-white">No hay estudiantes con nombres asignados en la lista.</p>
                )}
                {estudiantes.filter(e => (e.nombre && e.nombre.trim() !== "") || (e.apellido && e.apellido.trim() !== "")).length > 0 && estudiantesFiltradosModal.filter(e => (e.nombre && e.nombre.trim() !== "") || (e.apellido && e.apellido.trim() !== "")).length === 0 && (
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

      {/* MODAL PARA EXPORTAR A EXCEL INTEGRADO Y CORREGIDO */}
      {showModalExportar && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-200">

            <div className="p-5 border-b flex justify-between items-center bg-green-700 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <span className="mr-2">📗</span> Exportar a Excel
              </h2>
              <button onClick={() => setShowModalExportar(false)} className="text-white hover:text-green-200 text-2xl leading-none">&times;</button>
            </div>

            <div className="p-6 bg-white flex flex-col gap-4">
              <p className="text-sm text-gray-600">Configura los detalles del archivo Excel y revisa los datos guardados abajo.</p>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del archivo</label>
                <div className="flex items-center border border-gray-300 rounded focus-within:border-green-500 bg-white p-2">
                  <input
                    type="text"
                    className="w-full bg-transparent outline-none text-sm text-gray-800 font-medium"
                    placeholder="Ej. estudiantes_matricula"
                    value={nombreArchivo}
                    onChange={(e) => setNombreArchivo(e.target.value)}
                  />
                  <span className="text-gray-400 text-sm font-bold ml-2">.xlsx</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Tipo de Formato Oficial
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTipoMatricula("inicial");
                      
                      // Actualizar nombre de archivo si ya hay una sección elegida
                      if (seccionExportar) {
                        const opcion = opcionesAcademicas.find(opt => opt.id === seccionExportar);
                        if (opcion) {
                          const hoy = new Date();
                          const mes = String(hoy.getMonth() + 1).padStart(2, '0');
                          const anio = hoy.getFullYear();
                          const nombreBase = `${opcion.valores.turno}_${opcion.valores.nivelEstudio}_Sec_${opcion.valores.seccion}`.replace(/\s+/g, '_');
                          setNombreArchivo(`${nombreBase}_Matricula_Inicial_${mes}-${anio}`);
                        }
                      }
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${tipoMatricula === "inicial"
                      ? "bg-green-50 border-green-600 text-green-800 shadow-sm font-bold ring-2 ring-green-600/20"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
                      }`}
                  >
                    <span className="text-xl mb-1">🌱</span>
                    <span className="text-xs uppercase tracking-wider">Matrícula Inicial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTipoMatricula("final");
                      
                      // Actualizar nombre de archivo si ya hay una sección elegida
                      if (seccionExportar) {
                        const opcion = opcionesAcademicas.find(opt => opt.id === seccionExportar);
                        if (opcion) {
                          const hoy = new Date();
                          const mes = String(hoy.getMonth() + 1).padStart(2, '0');
                          const anio = hoy.getFullYear();
                          const nombreBase = `${opcion.valores.turno}_${opcion.valores.nivelEstudio}_Sec_${opcion.valores.seccion}`.replace(/\s+/g, '_');
                          setNombreArchivo(`${nombreBase}_Matricula_Final_${mes}-${anio}`);
                        }
                      }
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${tipoMatricula === "final"
                      ? "bg-green-50 border-green-600 text-green-800 shadow-sm font-bold ring-2 ring-green-600/20"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
                      }`}
                  >
                    <span className="text-xl mb-1">🎓</span>
                    <span className="text-xs uppercase tracking-wider">Matrícula Final</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Sección para Exportar <span className="text-red-500">*</span></label>
                <select
                  className="w-full p-2 border border-gray-300 rounded outline-none focus:border-green-500 text-sm bg-white text-gray-700 font-semibold"
                  value={seccionExportar}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setSeccionExportar(selectedId);
                    
                    const opcionElegida = opcionesAcademicas.find(opt => opt.id === selectedId);
                    if (opcionElegida) {
                      const hoy = new Date();
                      const mes = String(hoy.getMonth() + 1).padStart(2, '0');
                      const anio = hoy.getFullYear();
                      
                      const { turno, nivelEstudio, seccion } = opcionElegida.valores;
                      const nombreBase = `${turno}_${nivelEstudio}_Sec_${seccion}`.replace(/\s+/g, '_');
                      
                      const etiquetaMatricula = tipoMatricula === "inicial" ? "Matricula_Inicial" : "Matricula_Final";
                      
                      setNombreArchivo(`${nombreBase}_${etiquetaMatricula}_${mes}-${anio}`);
                    }
                  }}
                >
                  <option value="" disabled>🏫 Seleccione obligatoriamente una sección...</option>
                  {opcionesAcademicas.map(opt => {
                    const conteo = obtenerConteoSeccion(opt.id);
                    return (
                      <option key={`export-${opt.id}`} value={opt.id}>
                        {opt.label} ({conteo} {conteo === 1 ? 'alumno' : 'alumnos'})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="mt-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  📋 Alumnos Guardados en esta Selección ({estudiantesAExportar.length})
                </label>
                <div className="border border-gray-200 rounded-xl bg-gray-50 max-h-44 overflow-y-auto p-2 divide-y divide-gray-200 shadow-inner">
                  {estudiantesAExportar.map((est, index) => (
                    <div key={est.id} className="py-2 flex justify-between items-center text-xs text-gray-700 px-1 hover:bg-gray-100 rounded">
                      <span className="font-bold text-gray-800 uppercase truncate max-w-[220px]">
                        {index + 1}. {est.nombre} {est.apellido}
                      </span>
                      <span className="text-gray-500 font-mono text-[11px] bg-white border px-2 py-0.5 rounded-md shadow-sm">
                        C.E: {est.cedulaEscolar || '—'} | <span className="text-green-700 font-bold">{est.seccion || 'S/S'}</span>
                      </span>
                    </div>
                  ))}
                  {estudiantesAExportar.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-6">
                      Seleccione una sección arriba para previsualizar y exportar a los alumnos.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setShowModalExportar(false)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-sm"
              >
                Cancelar
              </button>
              <button
                onClick={exportarAExcel}
                disabled={estudiantesAExportar.length === 0 || !seccionExportar}
                className={`px-6 py-2 rounded-lg font-bold transition-colors shadow-md flex items-center ${estudiantesAExportar.length === 0 || !seccionExportar
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
              >
                Descargar Archivo ⬇️
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RegistroAlumnos;