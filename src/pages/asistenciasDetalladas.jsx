import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const AsistenciasDetalladas = () => {
  const [nivelSeleccionado, setNivelSeleccionado] = useState("Maternal");
  const [turnoSeleccionado, setTurnoSeleccionado] = useState("Mañana");
  const [semanaSeleccionada, setSemanaSeleccionada] = useState("Semana 1");
  const [mesSeleccionado, setMesSeleccionado] = useState("Junio"); // Añadido
  
  // Datos reales desde la BD
  const [alumnos, setAlumnos] = useState([]);
  
  const niveles = ["Maternal", "1er Nivel", "2do Nivel", "3er Nivel"];
  const turnos = ["Mañana", "Tarde"];
  const semanas = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  // Cargar datos al cambiar filtros
  useEffect(() => {
    cargarMatriz();
  }, [nivelSeleccionado, turnoSeleccionado, semanaSeleccionada, mesSeleccionado]);

  const cargarMatriz = async () => {
    if (window.pywebview && window.pywebview.api) {
      const res = await window.pywebview.api.cargar_matriz_asistencia({
        grado: nivelSeleccionado, turno: turnoSeleccionado, 
        semana: semanaSeleccionada, mes: mesSeleccionado, seccion: "A" // Ajustar si hay más secciones
      });
      if (res.status === 'success') setAlumnos(res.data);
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
    if (window.pywebview && window.pywebview.api) {
      const res = await window.pywebview.api.guardar_asistencias({
        mes: mesSeleccionado, semana: semanaSeleccionada, registros: alumnos
      });
      if (res.status === 'success') {
        alert("📥 ¡Reporte guardado con éxito!");
      } else {
        alert("❌ Error: " + res.message);
      }
    }
  };

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
          <header className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-end border-b pb-4 gap-4">
            <div>
              <p className="text-sm text-purple-600 font-bold uppercase tracking-widest">Pase de Lista Detallado</p>
              <h1 className="text-3xl font-black text-white">{nivelSeleccionado} — {semanaSeleccionada}</h1>
            </div>
            <div className="flex gap-2">
              <Link to="/" className="bg-white px-4 py-2 rounded-md font-bold text-gray-700">🏠 Inicio</Link>
              <button onClick={guardarCambiosBD} className="bg-purple-700 text-white px-5 py-2 rounded-md font-bold">💾 Guardar Reporte</button>
            </div>
          </header>

          <div className="flex gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
             <div className="flex bg-gray-200 p-1 rounded-xl font-bold">
                {turnos.map(t => <button key={t} onClick={() => setTurnoSeleccionado(t)} className={`px-5 py-1.5 rounded-lg ${turnoSeleccionado === t ? "bg-white text-purple-700" : "text-gray-600"}`}>{t}</button>)}
             </div>
             <div className="flex bg-gray-200 p-1 rounded-xl font-bold">
                {semanas.map(s => <button key={s} onClick={() => setSemanaSeleccionada(s)} className={`px-4 py-1.5 rounded-lg ${semanaSeleccionada === s ? "bg-purple-700 text-white" : "text-gray-600"}`}>{s}</button>)}
             </div>
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
                {alumnos.length === 0 ? (
                    <tr><td colSpan="7" className="p-8 text-center text-gray-400">No hay estudiantes cargados en esta sección.</td></tr>
                ) : alumnos.map(al => (
                  <tr key={al.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold">{al.nombre}</td>
                    <td className="p-4 text-center text-gray-400">{al.sexo.toUpperCase()}</td>
                    {diasSemana.map(dia => (
                      <td key={dia} className="p-4 text-center">
                        <input type="checkbox" checked={al.asistencia[dia]} onChange={() => handleAsistenciaChange(al.id, dia)} className="w-6 h-6 accent-purple-700" />
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