import Navbar from "./components/Navbar";
import { Link, Routes, Route } from 'react-router-dom';
import Asistencias from "./pages/asistencias";

function App() {
  return (
    // Quitamos la clase del contenedor de afuera para que no se quede estática
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Se llama a las paginas que quieras en el navegador  */}
      <Navbar />

      <main className="p-8">
        <Routes>
          {/* RUTA PRINCIPAL (HOME) */}
          <Route path="/" element={
            /* div que realiza animacion de transicion*/
            <div className="page-transition"> 
              <header className="bg-white shadow-md rounded-lg p-6 mb-8 border-t-4 border-purple-700">
                {/* Importante cambiarlo por el nombre de la institucion */}
                <h1 className="text-3xl font-bold text-purple-700">Rectoría</h1>
                <p className="text-gray-600 italic font-medium">
                  Gestión Administrativa y de Notas
                </p>
              </header>

              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Modelo basico de cartas si quiere mas copia y pega */}
                {/* Card: Registro de Asistencias */}
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                  <h2 className="font-bold text-xl text-gray-700 mb-2">Registro de Asistencias</h2>
                  <p className="text-gray-500 text-sm">Gestion de asistencias</p>
                  <Link
                    to="/asistencias"
                    className="mt-10 inline-block text-purple-600 font-semibold hover:underline text-sm"
                  >
                    Ver mas →
                  </Link>
                </div>

                {/* Card: Carga de Notas */}
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                    <h2 className="font-bold text-xl text-gray-700 mb-2">Carga de Notas</h2>
                    <p className="text-gray-500 text-sm">
                      Gestión de calificaciones y generación de reportes.
                    </p>
                    <Link 
                      to="/notas" 
                      className="mt-4 inline-block text-blue-600 font-semibold hover:underline text-sm"
                    >
                      Ver calificaciones →
                    </Link>
                </div>
              </section>
            </div>
          } />

          {/* RUTA DE ASISTENCIAS */}
          <Route path="/asistencias" element={<Asistencias />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;