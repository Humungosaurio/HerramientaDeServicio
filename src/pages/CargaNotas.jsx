import { useState } from 'react';
import { Link } from 'react-router-dom';

const CargaNotas = () => {
  // Notas iniciales vacías
  const [estudiantes, setEstudiantes] = useState([
    { id: 1, nombre: '', fechaNacimiento: '', n1: "", n2: "", n3: "", promedio: "0.00" },
  ]);
  
  const [showModal, setShowModal] = useState(false);

  const agregarFila = () => {
    const nuevoEstudiante = {
      id: Date.now(),
      nombre: '',
      fechaNacimiento: '',
      n1: "",
      n2: "",
      n3: "",
      promedio: "0.00"
    };
    setEstudiantes([...estudiantes, nuevoEstudiante]);
  };

  const handleInputChange = (id, campo, valor) => {
    setEstudiantes(prevEstudiantes =>
      prevEstudiantes.map(est => {
        if (est.id === id) {
          let valorFinal = valor;

          // VALIDACIÓN DE RANGO (0 a 20)
          if (['n1', 'n2', 'n3'].includes(campo)) {
            if (valor !== "") {
              const num = parseFloat(valor);
              if (num > 20) valorFinal = "20"; // Si supera 20, forzamos a 20
              if (num < 0) valorFinal = "0";   // Evitamos números negativos
            }
          }

          const esCampoTexto = campo === 'nombre' || campo === 'fechaNacimiento';
          const actualizado = { ...est, [campo]: esCampoTexto ? valor : valorFinal };

          // Recálculo del promedio
          if (['n1', 'n2', 'n3'].includes(campo)) {
            const v1 = parseFloat(actualizado.n1) || 0;
            const v2 = parseFloat(actualizado.n2) || 0;
            const v3 = parseFloat(actualizado.n3) || 0;
            actualizado.promedio = ((v1 + v2 + v3) / 3).toFixed(2);
          }
          return actualizado;
        }
        return est;
      })
    );
  };

  const guardarNotas = () => {
    alert("Notas sincronizadas correctamente.");
  };

  return (
    <div className="p-8 page-transition relative">
      <div className="flex flex-col gap-6">
        
        {/* HEADER */}
        <header className="flex justify-between items-end border-b pb-4">
          <div>
            <p className="text-sm text-purple-600 font-bold uppercase tracking-widest">Módulo Académico</p>
            <h1 className="text-3xl font-black text-gray-800">Carga de Calificaciones</h1>
          </div>

          <div className="flex gap-x-3">
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-bold shadow-md transition-all flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Ver Listado General
            </button>

            <Link 
              to="/" 
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-bold hover:bg-gray-50 transition-all flex items-center shadow-sm"
            >
              Inicio
            </Link>

            <button 
              onClick={guardarNotas}
              className="bg-purple-600 hover:bg-purple-800 text-white px-6 py-2 rounded-md font-bold shadow-md transition-all active:scale-95"
            >
              Guardar Notas
            </button>
          </div>
        </header>

        {/* TABLA PRINCIPAL */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest text-center">
              <tr>
                <th className="p-4 text-left">Nombre del Estudiante</th>
                <th className="p-4">F. Nacimiento</th>
                <th className="p-4">Nota 1</th>
                <th className="p-4">Nota 2</th>
                <th className="p-4">Nota 3</th>
                <th className="p-4 bg-purple-50 text-purple-700">Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {estudiantes.map((est) => (
                <tr key={est.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <input
                      type="text"
                      placeholder="Nombre del alumno"
                      className="w-full p-2 bg-gray-50 rounded outline-none"
                      value={est.nombre}
                      onChange={(e) => handleInputChange(est.id, 'nombre', e.target.value)}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="date"
                      className="w-full p-2 bg-gray-50 rounded outline-none text-sm"
                      value={est.fechaNacimiento}
                      onChange={(e) => handleInputChange(est.id, 'fechaNacimiento', e.target.value)}
                    />
                  </td>
                  {[ 'n1', 'n2', 'n3' ].map(nota => (
                    <td key={nota} className="p-3">
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          placeholder="0"
                          min="0"
                          max="20"
                          className="w-20 mx-auto p-2 border rounded text-center outline-purple-500"
                          value={est[nota]}
                          onChange={(e) => handleInputChange(est.id, nota, e.target.value)}
                        />
                        <span className="text-[10px] text-gray-400 mt-1">Máx: 20</span>
                      </div>
                    </td>
                  ))}
                  <td className="p-3 text-center">
                    <span className={`text-lg font-black ${parseFloat(est.promedio) >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                      {est.promedio}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-gray-50 border-t">
            <button onClick={agregarFila} className="text-purple-600 hover:text-purple-800 font-bold flex items-center text-sm transition-colors">
              <span className="text-xl mr-1">+</span> Añadir Estudiante
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE LISTADO GENERAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-purple-700 text-white">
              <h2 className="text-xl font-bold">Listado General de Promedios</h2>
              <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200 text-2xl">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {estudiantes.filter(e => e.nombre.trim() !== "").map((est) => (
                  <div key={est.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                    <div>
                      <p className="font-bold text-gray-800 uppercase text-sm">{est.nombre}</p>
                      <p className="text-xs text-gray-500">Estudiante Regular</p>
                    </div>
                    <div className={`text-xl font-black ${parseFloat(est.promedio) >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                      {est.promedio}
                    </div>
                  </div>
                ))}
                {estudiantes.filter(e => e.nombre.trim() !== "").length === 0 && (
                  <p className="col-span-2 text-center text-gray-400 py-10">No hay estudiantes registrados con nombre.</p>
                )}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="bg-gray-800 hover:bg-black text-white px-6 py-2 rounded-lg font-bold transition-colors"
              >
                Cerrar Vista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CargaNotas;