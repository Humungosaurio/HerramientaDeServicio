import { useState } from 'react';
import { Link } from 'react-router-dom';

const Asistencias = () => {
  // MEJORA: Definir el estado inicial fuera o de forma clara para evitar errores de undefined
  const [gradoSeleccionado, setGradoSeleccionado] = useState('1° Grado');

  // LOGICA: Datos guardados de forma local IMPORTANTE SERAN REEMPLAZADOS POR LA BD
  const [datosPorGrado, setDatosPorGrado] = useState({
    '1° Grado': { A: { v: 0, h: 0 }, B: { v: 0, h: 0 }, C: { v: 0, h: 0 } },
    '2° Grado': { A: { v: 0, h: 0 }, B: { v: 0, h: 0 }, C: { v: 0, h: 0 } },
    '3° Grado': { A: { v: 0, h: 0 }, B: { v: 0, h: 0 }, C: { v: 0, h: 0 } },
    '4° Grado': { A: { v: 0, h: 0 }, B: { v: 0, h: 0 }, C: { v: 0, h: 0 } },
    '5° Grado': { A: { v: 0, h: 0 }, B: { v: 0, h: 0 }, C: { v: 0, h: 0 } },
    '6° Grado': { A: { v: 0, h: 0 }, B: { v: 0, h: 0 }, C: { v: 0, h: 0 } },
  });

  // EXTRACCIÓN: Obtenemos las llaves para generar los botones del menú lateral dinámicamente
  const grados = Object.keys(datosPorGrado);

  /**
   * MANEJADOR DE CAMBIOS (Hander)
   * Usa "PrevState" para asegurar que si el usuario escribe rápido, no se pierdan datos.
   */
  const handleInputChange = (seccion, campo, valor) => {
    // MEJORA: Validamos que sea un número positivo y evitamos el "NaN"
    const numValue = Math.max(0, parseInt(valor) || 0);
    
    setDatosPorGrado(prev => ({
      ...prev, // Copiamos todos los grados
      [gradoSeleccionado]: {
        ...prev[gradoSeleccionado], // Copiamos todas las secciones del grado actual
        [seccion]: {
          ...prev[gradoSeleccionado][seccion], // Copiamos los valores (v, h) de la sección
          [campo]: numValue // Actualizamos SOLO el campo que cambió (v o h)
        }
      }
    }));
  };

  const guardarCambios = () => {
    // LOGICA: Filtramos solo la "rebanada" de datos que nos interesa
    const datosDeEsteGrado = datosPorGrado[gradoSeleccionado];
    console.log("Enviando a BD:", datosDeEsteGrado);
    alert(`Asistencias de ${gradoSeleccionado} sincronizadas.`);
  };

  return (
    <div className="p-8 page-transition">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* SIDEBAR: Navegación por grados */}
        <aside className="md:w-1/4 flex md:flex-col overflow-x-auto gap-2 border-gray-200">
          {grados.map((grado) => (
            <button
              key={grado}
              onClick={() => setGradoSeleccionado(grado)}
              // MEJORA: Feedback visual claro de qué grado está activo
              className={`px-4 py-2 rounded-lg text-left transition-all ${
                gradoSeleccionado === grado 
                ? 'bg-purple-700 text-white shadow-lg scale-105' 
                : 'text-gray-600 hover:bg-purple-50'
              }`}
            >
              {grado}
            </button>
          ))}
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1">
          <header className="mb-6 flex justify-between items-end border-b pb-4">
            <div>
              <p className="text-sm text-purple-600 font-bold uppercase tracking-widest">Módulo Escolar</p>
              <h1 className="text-3xl font-black text-gray-800">{gradoSeleccionado}</h1>
            </div>
            {/* MEJORA: Botón con ID dinámico para auditoría */}
            <button 
              onClick={guardarCambios}
              className="bg-purple-600 hover:bg-purple-800 text-white px-6 py-2 rounded-md font-bold shadow-md transition-all active:scale-95"
            >
              Guardar Reporte
            </button>
          </header>

          <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-tighter">
                <tr>
                  <th className="p-4 text-left">Sección</th>
                  <th className="p-4 text-center">Varones (V)</th>
                  <th className="p-4 text-center">Hembras (H)</th>
                  <th className="p-4 text-center bg-purple-50 text-purple-700">Total (T)</th>
                </tr>
              </thead>
              <tbody>
                {/* LOGICA: Renderizamos solo las secciones del grado elegido en el estado */}
                {Object.keys(datosPorGrado[gradoSeleccionado]).map((seccion) => {
                  const { v, h } = datosPorGrado[gradoSeleccionado][seccion];
                  // MEJORA: Cálculo en tiempo real (Derivado del estado)
                  const total = v + h;

                  return (
                    <tr key={seccion} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-700 text-lg">Sección {seccion}</td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={v === 0 ? '' : v} // MEJORA: Si es 0, dejamos vacío para facilitar escritura
                          placeholder="0"
                          onChange={(e) => handleInputChange(seccion, 'v', e.target.value)}
                          className="w-full p-2 border rounded text-center focus:border-purple-500 outline-none transition-all"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={h === 0 ? '' : h}
                          placeholder="0"
                          onChange={(e) => handleInputChange(seccion, 'h', e.target.value)}
                          className="w-full p-2 border rounded text-center focus:border-purple-500 outline-none transition-all"
                        />
                      </td>
                      <td className="p-4 text-center">
                        {/* MEJORA: Estilo condicional si el total es 0 */}
                        <span className={`text-xl font-black ${total > 0 ? 'text-purple-700' : 'text-gray-300'}`}>
                          {total}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Asistencias;