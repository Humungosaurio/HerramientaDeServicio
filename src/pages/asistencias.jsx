import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

  const niveles = ['Maternal', '1er Nivel', '2do Nivel', '3er Nivel'];
  const turnos = ['Mañana', 'Tarde'];
  const semanas = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  useEffect(() => {
    const fetchResumen = async () => {
      if (window.pywebview && window.pywebview.api) {
        // Se mantiene la llamada original, pero el backend deberá enviar la estructura por días
        const res = await window.pywebview.api.obtener_resumen_global({ 
          grado: nivel, 
          turno, 
          semana, 
          mes 
        });
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
              <p className="text-sm text-purple-600 font-bold uppercase tracking-wider">
                Métricas Consolidadas — Período: {mes}
              </p>
              <h1 className="text-3xl font-black text-white">{nivel} — {semana}</h1>
              <p className="text-xs text-gray-400 mt-1 font-medium italic">
                📅 Fecha de operación: <span className="capitalize text-purple-300">{fechaHoyFormateada}</span>
              </p>
            </div>
            <Link to="/" className="bg-white px-4 py-2 rounded-md font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">🏠 Volver al Inicio</Link>
          </header>

          <div className="flex gap-4 mb-6 bg-white/5 p-4 rounded-xl border border-white/10 items-center">
             <div className="flex bg-gray-200 p-1 rounded-xl font-bold">
                {turnos.map(t => <button key={t} onClick={() => setTurno(t)} className={`px-4 py-1.5 rounded-lg ${turno === t ? 'bg-white text-purple-700' : 'text-gray-600'}`}>{t}</button>)}
             </div>
             <div className="flex bg-gray-200 p-1 rounded-xl font-bold">
                {semanas.map(s => <button key={s} onClick={() => setSemana(s)} className={`px-4 py-1.5 rounded-lg ${semana === s ? 'bg-purple-700 text-white' : 'text-gray-600'}`}>{s}</button>)}
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
                      // Extraemos los datos del día, si no existen, ponemos valores en 0
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