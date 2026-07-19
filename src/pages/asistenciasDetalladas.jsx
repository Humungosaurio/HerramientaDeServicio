import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { excelAsis } from "../components/Excel_comp/excelAsistenciasDetalladas";

const AsistenciasDetalladas = () => {
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

  const [nivelSeleccionado, setNivelSeleccionado] = useState("Maternal");
  const [turnoSeleccionado, setTurnoSeleccionado] = useState("Mañana");
  const [semanaSeleccionada, setSemanaSeleccionada] = useState("Semana 1");
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActualSistema);

  const [busquedaAlumno, setBusquedaAlumno] = useState("");

  const [opcionExportar, setOpcionExportar] = useState("Todos");
  
  const opcionesExportar = [
    "Todos",
    "Maternal Mañana",
    "Maternal Tarde",
    "1er Nivel Mañana",
    "1er Nivel Tarde",
    "2do Nivel Mañana",
    "2do Nivel Tarde",
    "3er Nivel Mañana",
    "3er Nivel Tarde"
  ];

  const [alumnos, setAlumnos] = useState([]);

  const niveles = ["Maternal", "1er Nivel", "2do Nivel", "3er Nivel"];
  const turnos = ["Mañana", "Tarde"];
  const semanas = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  useEffect(() => {
    cargarMatriz();
    setBusquedaAlumno("");
  }, [nivelSeleccionado, turnoSeleccionado, semanaSeleccionada, mesSeleccionado]);

  const cargarMatriz = async () => {
    if (window.pywebview && window.pywebview.api) {
      const res = await window.pywebview.api.cargar_matriz_asistencia({
        grado: nivelSeleccionado, turno: turnoSeleccionado,
        semana: semanaSeleccionada, mes: mesSeleccionado, seccion: "A" 
      });
      if (res.status === 'success') {
        const adaptados = res.data.map(al => ({
          ...al,
          estado: al.estado || 'Vigente'
        }));
        setAlumnos(adaptados);
      }
    }
  };

  const handleAsistenciaChange = (id, dia) => {
    setAlumnos(prev => prev.map(al => {
      if (al.id === id) {
        return { ...al, asistencia: { ...al.asistencia, [dia]: !al.asistencia[dia] } };
      }
      return al;
    }));
  };

  const guardarCambiosBD = async () => {
    const alumnosVigentes = alumnos.filter(al => al.estado !== 'Retirado');

    if (window.pywebview && window.pywebview.api) {
      const res = await window.pywebview.api.guardar_asistencias({
        mes: mesSeleccionado, semana: semanaSeleccionada, registros: alumnosVigentes
      });
      if (res.status === 'success') {
        alert("📥 ¡Reporte guardado con éxito!");
      } else {
        alert("❌ Error: " + res.message);
      }
    }
  };

  const handleDescargarExcel = async () => {
    await excelAsis(
      alumnos,             
      opcionExportar,      
      mesSeleccionado,     
      semanaSeleccionada   
    );
  };

  const alumnosMostrados = alumnos
    .filter(al => al.estado !== 'Retirado')
    .filter(al => al.nombre.toLowerCase().includes(busquedaAlumno.toLowerCase().trim()));

  return (
    <div className="page-transition p-8 text-gray-800">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-1/4 flex md:flex-col overflow-x-auto gap-2">
          {niveles.map(nivel => (
            <button key={nivel} onClick={() => setNivelSeleccionado(nivel)} className={`px-4 py-3 rounded-lg text-left font-bold transition-all ${nivelSeleccionado === nivel ? "bg-purple-700 text-white shadow-lg" : "text-gray-600 bg-white"}`}>
              {nivel}
            </button>
          ))}
        </aside>

        <main className="flex-1">
          <header className="mb-6 flex flex-col xl:flex-row xl:justify-between xl:items-end border-b pb-4 gap-4">
            <div>
              <p className="text-sm text-purple-600 font-bold uppercase tracking-widest">
                Pase de Lista Detallado — Mes Actual: {mesSeleccionado}
              </p>
              <h1 className="text-3xl font-black text-white">{nivelSeleccionado} — {semanaSeleccionada}</h1>
              <p className="text-xs text-gray-400 mt-1 font-medium italic">
                📅 Fecha de registro: <span className="capitalize text-purple-300">{fechaHoyFormateada}</span>
              </p>
            </div>
            
            <div className="flex flex-col gap-3 xl:items-end">
              <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-200 shadow-sm w-fit">
                <label className="text-xs font-bold text-gray-600 uppercase pl-1">Exportar Excel:</label>
                <select 
                  value={opcionExportar}
                  onChange={(e) => setOpcionExportar(e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:border-green-600 bg-white min-w-[150px] font-medium"
                >
                  {opcionesExportar.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
                <button 
                  onClick={handleDescargarExcel} 
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
                <Link to="/" className="bg-white px-4 py-2 rounded-md font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">🏠 Inicio</Link>
                <button onClick={guardarCambiosBD} className="bg-purple-700 text-white px-5 py-2 rounded-md font-bold shadow-md hover:bg-purple-800 transition-colors">💾 Guardar Reporte</button>
              </div>
            </div>
          </header>

          <div className="flex gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 justify-between items-center">
            <div className="flex gap-4">
              <div className="flex bg-gray-200 p-1 rounded-xl font-bold">
                {turnos.map(t => <button key={t} onClick={() => setTurnoSeleccionado(t)} className={`px-5 py-1.5 rounded-lg ${turnoSeleccionado === t ? "bg-white text-purple-700" : "text-gray-600"}`}>{t}</button>)}
              </div>
              <div className="flex bg-gray-200 p-1 rounded-xl font-bold">
                {semanas.map(s => <button key={s} onClick={() => setSemanaSeleccionada(s)} className={`px-4 py-1.5 rounded-lg ${semanaSeleccionada === s ? "bg-purple-700 text-white" : "text-gray-600"}`}>{s}</button>)}
              </div>
            </div>
            <div className="text-xs font-bold text-gray-500 uppercase bg-gray-200 px-3 py-2 rounded-lg">
              Guardando en: <span className="text-purple-700 font-black">{mesSeleccionado}</span>
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Buscar alumno por nombre..."
              className="w-full md:w-1/2 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-purple-500 text-sm bg-white shadow-sm"
              value={busquedaAlumno}
              onChange={(e) => setBusquedaAlumno(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="p-4 text-left">Nombre</th><th className="p-4 text-center">Gen</th>
                  {diasSemana.map(d => <th key={d} className="p-4">{d}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {alumnosMostrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-400">
                      {alumnos.filter(al => al.estado !== 'Retirado').length === 0 
                        ? "No hay estudiantes vigentes cargados en esta sección." 
                        : "No se encontraron alumnos con ese nombre."}
                    </td>
                  </tr>
                ) : alumnosMostrados.map(al => (
                  <tr key={al.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold">{al.nombre}</td>
                    <td className="p-4 text-center text-gray-400">{al.sexo?.toUpperCase() || ''}</td>
                    {diasSemana.map(dia => (
                      <td key={dia} className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={al.asistencia[dia] || false} 
                          onChange={() => handleAsistenciaChange(al.id, dia)} 
                          className="w-6 h-6 accent-purple-700 cursor-pointer" 
                        />
                      </td>
                    ))}
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
export default AsistenciasDetalladas;