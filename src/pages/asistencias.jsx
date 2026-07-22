import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { excelAsis } from '../components/Excel_comp/excelAsistencias'; 

const Asistencias = () => {
  const mesesAnio = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const mesActualSistema = mesesAnio[new Date().getMonth()];

  const fechaHoyFormateada = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const [nivel, setNivel] = useState('Maternal');
  const [turno, setTurno] = useState('Mañana'); 
  const [semana, setSemana] = useState('Semana 1');
  const [mes, setMes] = useState(mesActualSistema);
  
  const [resumen, setResumen] = useState([]);
  const [alumnosData, setAlumnosData] = useState([]); 

  // Estado para el selector del Excel modificado (Primer valor de la lista)
  const [opcionExportar, setOpcionExportar] = useState("Maternal Mañana - Sec. A");

  // Opciones de aulas exactas del plantel sin "Vista Actual"
  const opcionesExportar = [
    "Maternal Mañana - Sec. A",
    "Maternal Tarde - Sec. B",
    "1er Nivel Mañana - Sec. A",
    "1er Nivel Mañana - Sec. B",
    "1er Nivel Tarde - Sec. C",
    "1er Nivel Tarde - Sec. D",
    "2do Nivel Mañana - Sec. A",
    "2do Nivel Mañana - Sec. B",
    "2do Nivel Tarde - Sec. C",
    "2do Nivel Tarde - Sec. D",
    "3er Nivel Mañana - Sec. A",
    "3er Nivel Tarde - Sec. B",
    "3er Nivel Tarde - Sec. C"
  ];

  const niveles = ['Maternal', '1er Nivel', '2do Nivel', '3er Nivel'];
  const turnos = ['Mañana', 'Tarde'];
  const semanas = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  useEffect(() => {
    const fetchResumen = async () => {
      if (window.pywebview && window.pywebview.api) {
        const res = await window.pywebview.api.obtener_resumen_global({ 
          grado: nivel, 
          turno: turno, 
          semana: semana, 
          mes: mes 
        });
        
        if (res.status === 'success') {
           setResumen(res.data);
           if (res.alumnos_lista) {
             setAlumnosData(res.alumnos_lista); 
           }
        }
      }
    };
    fetchResumen();
  }, [nivel, turno, semana, mes]);

  // Función simplificada: Siempre consulta la base de datos por la opción seleccionada
const manejarDescargaExcel = async () => {
    const partes = opcionExportar.split(" - Sec. ");
    const seccionDestino = partes[1]?.trim() || "A";
    
    let gradoDestino = "";
    let turnoDestino = "";
    
    if (partes[0].includes("Mañana")) {
      turnoDestino = "Mañana";
      gradoDestino = partes[0].replace(" Mañana", "").trim();
    } else {
      turnoDestino = "Tarde";
      gradoDestino = partes[0].replace(" Tarde", "").trim();
    }

    // Llamada directa al NUEVO puente de Python para "Totales"
    if (window.pywebview && window.pywebview.api) {
      try {
        const respuesta = await window.pywebview.api.generar_excel_asistencias_totales({
          mes: mes,
          grado: gradoDestino,
          turno: turnoDestino,
          seccion: seccionDestino,
          nombre_archivo: `Asistencias_Totales_${gradoDestino}_Sec_${seccionDestino}`.replace(/ /g, "_")
        });

        if (respuesta.status === "success") {
          alert(`✅ Archivo de Totales generado correctamente.`);
        } else {
          alert(`❌ Ocurrió un error al generar el Excel: ${respuesta.message}`);
        }
      } catch (error) {
         alert("❌ Error de comunicación con el sistema local: " + error.message);
      }
    } else {
      alert("🖥️ Estás en el navegador. La generación de plantillas Excel solo funciona ejecutando la aplicación de escritorio.");
    }
  };
  return (
    <div className="p-8 page-transition">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-1/4 flex md:flex-col overflow-x-auto gap-2">
          {niveles.map(n => (
            <button key={n} onClick={() => setNivel(n)} className={`p-3 rounded-lg font-bold text-left transition-all ${nivel === n ? 'bg-purple-700 text-white shadow-lg' : 'bg-white text-gray-600'}`}>
              {n}
            </button>
          ))}
        </aside>

        <main className="flex-1">
          <header className="mb-6 flex flex-col xl:flex-row xl:justify-between xl:items-end border-b pb-4 gap-4">
            <div>
              <p className="text-sm text-purple-600 font-bold uppercase tracking-wider">
                Métricas Consolidadas — Período: {mes}
              </p>
              <h1 className="text-3xl font-black text-white">{nivel} — {semana}</h1>
              <p className="text-xs text-gray-400 mt-1 font-medium italic">
                📅 Fecha de operación: <span className="capitalize text-purple-300">{fechaHoyFormateada}</span>
              </p>
            </div>
            
            <div className="flex flex-col gap-3 xl:items-end">
              <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-200 shadow-sm w-fit">
                <label className="text-xs font-bold text-gray-600 uppercase pl-1">Exportar Excel:</label>
                <select 
                  value={opcionExportar}
                  onChange={(e) => setOpcionExportar(e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:border-green-600 bg-white min-w-[200px] font-medium text-gray-800"
                >
                  {opcionesExportar.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
                <button 
                  onClick={manejarDescargaExcel}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm font-bold shadow hover:bg-green-700 transition-colors flex items-center gap-2"
                  title="Descargar reporte en formato Excel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar
                </button>
              </div>

              <div className="flex gap-2 w-fit">
                <Link to="/" className="bg-white px-4 py-2 rounded-md font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
                  🏠 Volver al Inicio
                </Link>
              </div>
            </div>
          </header>

          <div className="flex gap-4 mb-6 bg-white/5 p-4 rounded-xl border border-white/10 items-center flex-wrap">
             <div className="flex bg-gray-200 p-1 rounded-xl font-bold">
                {turnos.map(t => (
                  <button key={t} onClick={() => setTurno(t)} className={`px-4 py-1.5 rounded-lg transition-all ${turno === t ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                    {t}
                  </button>
                ))}
             </div>
             
             <div className="flex bg-gray-200 p-1 rounded-xl font-bold">
                {semanas.map(s => (
                  <button key={s} onClick={() => setSemana(s)} className={`px-4 py-1.5 rounded-lg transition-all ${semana === s ? 'bg-purple-700 text-white shadow-sm' : 'text-gray-600 hover:text-purple-700'}`}>
                    {s}
                  </button>
                ))}
             </div>
             
             <div className="flex bg-purple-900/40 border border-purple-500/30 px-4 py-1.5 rounded-xl font-bold text-sm text-purple-200 items-center gap-1 ml-auto">
               <span>Mes activo:</span>
               <span className="text-white font-black">{mes}</span>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <table className="w-full text-center text-sm">
              <thead className="bg-gray-100 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="p-4 text-left border-b border-gray-200">Sección</th>
                  {diasSemana.map(dia => (
                    <th key={dia} className="p-4 border-b border-gray-200">{dia}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resumen.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-gray-400">No hay datos procesados.</td></tr>
                ) : resumen.map(sec => (
                  <tr key={sec.seccion} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-bold text-left text-gray-700 bg-gray-50/50 w-32">
                      Sec. "{sec.seccion}"
                    </td>
                    {diasSemana.map(dia => {
                      const datosDia = sec.dias?.[dia] || { v: 0, h: 0, total: 0 };
                      
                      return (
                        <td key={dia} className="p-3 border-l border-gray-100 align-middle">
                          <div className="flex flex-col gap-1 items-center justify-center">
                            <div className="flex justify-center gap-3 w-full text-xs">
                              <span className="text-blue-600 font-bold" title="Varones">V: {datosDia.v}</span>
                              <span className="text-pink-500 font-bold" title="Hembras">H: {datosDia.h}</span>
                            </div>
                            <div className="font-black text-purple-700 bg-purple-50 px-3 py-1 rounded-md w-full max-w-[80px]">
                              T: {datosDia.total}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Asistencias;