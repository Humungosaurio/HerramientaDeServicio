import { useState } from 'react';
import { Link } from 'react-router-dom';

const Asistencias = () => {
  const [nivelSeleccionado, setNivelSeleccionado] = useState('1er Nivel');
  const [showResumen, setShowResumen] = useState(false); // Estado para el modal

  const [datosPorNivel, setDatosPorNivel] = useState({
    '1er Nivel': { A: { v: 0, h: 0 }, B: { v: 0, h: 0 }, C: { v: 0, h: 0 } },
    '2do Nivel': { A: { v: 0, h: 0 }, B: { v: 0, h: 0 }, C: { v: 0, h: 0 } },
    '3er Nivel': { A: { v: 0, h: 0 }, B: { v: 0, h: 0 }, C: { v: 0, h: 0 } },
  });

  const niveles = Object.keys(datosPorNivel);

  const handleInputChange = (seccion, campo, valor) => {
    const numValue = Math.max(0, parseInt(valor) || 0);
    setDatosPorNivel(prev => ({
      ...prev,
      [nivelSeleccionado]: {
        ...prev[nivelSeleccionado],
        [seccion]: { ...prev[nivelSeleccionado][seccion], [campo]: numValue }
      }
    }));
  };

  // Función para calcular totales de un nivel específico para el Modal
  const calcularTotalesNivel = (nivel) => {
    const secciones = datosPorNivel[nivel];
    return Object.values(secciones).reduce(
      (acc, curr) => ({
        v: acc.v + curr.v,
        h: acc.h + curr.h,
        t: acc.v + curr.v + acc.h + curr.h
      }),
      { v: 0, h: 0, t: 0 }
    );
  };

  const guardarCambios = () => {
    alert(`Asistencias de ${nivelSeleccionado} sincronizadas.`);
  };

  return (
    <div className="p-8 page-transition relative">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* SIDEBAR */}
        <aside className="md:w-1/4 flex md:flex-col overflow-x-auto gap-2">
          {niveles.map((nivel) => (
            <button
              key={nivel}
              onClick={() => setNivelSeleccionado(nivel)}
              className={`px-4 py-2 rounded-lg text-left transition-all ${
                nivelSeleccionado === nivel 
                ? 'bg-purple-700 text-white shadow-lg scale-105' 
                : 'text-gray-600 hover:bg-purple-50'
              }`}
            >
              {nivel}
            </button>
          ))}
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1">
          <header className="mb-6 flex justify-between items-end border-b pb-4">
            <div>
              <p className="text-sm text-purple-600 font-bold uppercase tracking-widest">Módulo Inicial</p>
              <h1 className="text-3xl font-black text-gray-800">{nivelSeleccionado}</h1>
            </div>

            <div className="flex gap-x-2">
              {/* BOTÓN DE RESUMEN */}
              <button 
                onClick={() => setShowResumen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-bold shadow-md transition-all flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Ver Totales
              </button>

              <Link to="/" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-bold hover:bg-gray-50 flex items-center">
                Inicio
              </Link>

              <button onClick={guardarCambios} className="bg-purple-600 hover:bg-purple-800 text-white px-6 py-2 rounded-md font-bold">
                Guardar Reporte
              </button>
            </div>
          </header>

          <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="p-4 text-left">Sección</th>
                  <th className="p-4 text-center">Varones</th>
                  <th className="p-4 text-center">Hembras</th>
                  <th className="p-4 text-center bg-purple-50 text-purple-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(datosPorNivel[nivelSeleccionado]).map((seccion) => {
                  const { v, h } = datosPorNivel[nivelSeleccionado][seccion];
                  return (
                    <tr key={seccion} className="border-t hover:bg-gray-50 transition-colors text-center">
                      <td className="p-4 font-bold text-gray-700 text-left">Sección {seccion}</td>
                      <td className="p-4">
                        <input type="number" value={v === 0 ? '' : v} placeholder="0" onChange={(e) => handleInputChange(seccion, 'v', e.target.value)} className="w-20 p-2 border rounded text-center"/>
                      </td>
                      <td className="p-4">
                        <input type="number" value={h === 0 ? '' : h} placeholder="0" onChange={(e) => handleInputChange(seccion, 'h', e.target.value)} className="w-20 p-2 border rounded text-center"/>
                      </td>
                      <td className="p-4 font-black text-purple-700 text-xl">{v + h}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* MODAL DE RESUMEN GENERAL DE ASISTENCIAS */}
      {showResumen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">Resumen de Matrícula Asistida</h2>
                <p className="text-blue-100 text-sm">Consolidado general por todos los niveles</p>
              </div>
              <button onClick={() => setShowResumen(false)} className="text-3xl hover:text-gray-200">&times;</button>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 gap-6">
                {niveles.map((nivel) => {
                  const totales = calcularTotalesNivel(nivel);
                  return (
                    <div key={nivel} className="bg-gray-50 border rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="text-center md:text-left">
                        <h3 className="text-xl font-bold text-gray-800">{nivel}</h3>
                        <p className="text-gray-500 text-xs uppercase font-semibold">Educación Inicial</p>
                      </div>
                      
                      <div className="flex gap-8 text-center">
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Varones</p>
                          <p className="text-2xl font-bold text-blue-600">{totales.v}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Hembras</p>
                          <p className="text-2xl font-bold text-pink-500">{totales.h}</p>
                        </div>
                        <div className="bg-blue-100 px-4 py-1 rounded-lg">
                          <p className="text-xs text-blue-800 font-bold uppercase">Total Nivel</p>
                          <p className="text-2xl font-black text-blue-900">{totales.v + totales.h}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TOTAL ABSOLUTO DE LA INSTITUCIÓN */}
              <div className="mt-8 p-6 bg-purple-700 rounded-xl text-white flex justify-between items-center shadow-lg">
                <span className="text-lg font-bold uppercase tracking-widest">Total Institucional:</span>
                <span className="text-4xl font-black">
                  {niveles.reduce((acc, n) => acc + calcularTotalesNivel(n).v + calcularTotalesNivel(n).h, 0)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setShowResumen(false)}
                className="bg-gray-800 text-white px-8 py-2 rounded-lg font-bold hover:bg-black transition-all"
              >
                Cerrar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Asistencias;