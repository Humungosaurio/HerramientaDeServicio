import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Asistencias = () => {
  const [nivel, setNivel] = useState('Maternal');
  const [turno, setTurno] = useState('Mañana'); 
  const [semana, setSemana] = useState('Semana 1');
  const [mes, setMes] = useState('Junio');
  
  const [resumen, setResumen] = useState([]);

  const niveles = ['Maternal', '1er Nivel', '2do Nivel', '3er Nivel'];
  const turnos = ['Mañana', 'Tarde'];
  const semanas = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];

  useEffect(() => {
    const fetchResumen = async () => {
      if (window.pywebview && window.pywebview.api) {
        const res = await window.pywebview.api.obtener_resumen_global({ grado: nivel, turno, semana, mes });
        if (res.status === 'success') setResumen(res.data);
      }
    };
    fetchResumen();
  }, [nivel, turno, semana, mes]);

  return (
    <div className="p-8 page-transition">
      <div className="flex gap-6">
        <aside className="w-1/4 flex flex-col gap-2">
          {niveles.map(n => (
            <button key={n} onClick={() => setNivel(n)} className={`p-3 rounded-lg font-bold text-left ${nivel === n ? 'bg-purple-700 text-white' : 'bg-white text-gray-600'}`}>
              {n}
            </button>
          ))}
        </aside>

        <main className="flex-1">
          <header className="mb-6 flex justify-between items-end border-b pb-4">
            <div>
              <p className="text-sm text-purple-600 font-bold uppercase">Métricas Consolidadas</p>
              <h1 className="text-3xl font-black text-white">{nivel} — {semana}</h1>
            </div>
            <Link to="/" className="bg-white px-4 py-2 rounded-md font-bold text-gray-700">🏠 Volver al Inicio</Link>
          </header>

          <div className="flex gap-4 mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
             <div className="flex bg-gray-200 p-1 rounded-xl font-bold">
                {turnos.map(t => <button key={t} onClick={() => setTurno(t)} className={`px-4 py-1.5 rounded-lg ${turno === t ? 'bg-white text-purple-700' : 'text-gray-600'}`}>{t}</button>)}
             </div>
             <div className="flex bg-gray-200 p-1 rounded-xl font-bold">
                {semanas.map(s => <button key={s} onClick={() => setSemana(s)} className={`px-4 py-1.5 rounded-lg ${semana === s ? 'bg-purple-700 text-white' : 'text-gray-600'}`}>{s}</button>)}
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <table className="w-full text-center">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="p-4 text-left">Sección</th>
                  <th className="p-4">Varones Presentes</th>
                  <th className="p-4">Hembras Presentes</th>
                  <th className="p-4 bg-purple-50 text-purple-700">Total Día</th>
                </tr>
              </thead>
              <tbody>
                {resumen.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-gray-400">No hay datos procesados.</td></tr>
                ) : resumen.map(sec => (
                  <tr key={sec.seccion} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-bold text-left">Sección "{sec.seccion}"</td>
                    <td className="p-4 text-blue-600 font-bold">{sec.v}</td>
                    <td className="p-4 text-pink-500 font-bold">{sec.h}</td>
                    <td className="p-4 font-black text-purple-700 text-xl">{sec.total}</td>
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