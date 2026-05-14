import Navbar from "./components/Navbar";
import { Link, Routes, Route } from 'react-router-dom';
import Asistencias from "./pages/asistencias";
import CargaNotas from "./pages/CargaNotas"; 

function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Navbar />

      <main className="p-8">
        <Routes>
          <Route path="/" element={
            <div className="page-transition max-w-7xl mx-auto"> 
              <header className="bg-white shadow-md rounded-xl p-8 mb-10 border-t-8 border-purple-700">
                <h1 className="text-4xl font-black text-purple-700 flex items-center justify-center">Gestión Administrativa</h1>
                <p className="text-xl text-gray-600 italic font-medium mt-2 flex items-center justify-center">
                    Gestion de Asistencias y Notas
                </p>
              </header>

              {/* Ajustamos el grid para que las tarjetas respiren mejor */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Card: Registro de Asistencias - MAS GRANDE */}
                <div className="bg-white p-10 rounded-2xl shadow-sm border-l-8 border-purple-500 hover:shadow-xl transition-all hover:scale-[1.02] flex flex-col justify-between">
                  <div>
                    <h2 className="font-black text-2xl text-gray-800 mb-4">Registro de Asistencias</h2>
                    <p className="text-gray-500 text-lg leading-relaxed">
                      Control detallado de asistencias diarias. Organizado por niveles educativos y secciones (A, B, C).
                    </p>
                  </div>
                  <Link
                    to="/asistencias"
                    className="mt-8 inline-block bg-purple-100 text-purple-700 px-6 py-3 rounded-lg font-bold hover:bg-purple-700 hover:text-white transition-colors text-center shadow-sm"
                  >
                    Abrir Módulo de Asistencia →
                  </Link>
                </div>

                {/* Card: Carga de Notas - MAS GRANDE */}
                <div className="bg-white p-10 rounded-2xl shadow-sm border-l-8 border-blue-500 hover:shadow-xl transition-all hover:scale-[1.02] flex flex-col justify-between">
                  <div>
                    <h2 className="font-black text-2xl text-gray-800 mb-4">Carga de Notas</h2>
                    <p className="text-gray-500 text-lg leading-relaxed">
                      Gestión académica de calificaciones. Cálculo automático de promedios y visualización de listados generales.
                    </p>
                  </div>
                  <Link 
                    to="/notas" 
                    className="mt-8 inline-block bg-blue-100 text-blue-700 px-6 py-3 rounded-lg font-bold hover:bg-blue-700 hover:text-white transition-colors text-center shadow-sm"
                  >
                    Abrir Módulo de Calificaciones →
                  </Link>
                </div>

              </section>
            </div>
          } />

          <Route path="/asistencias" element={<Asistencias />} />
          <Route path="/notas" element={<CargaNotas />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;