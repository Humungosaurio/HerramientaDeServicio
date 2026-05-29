import Navbar from "./components/Navbar";
import { Link, Routes, Route } from "react-router-dom";
import Asistencias from "./pages/asistencias";
import RegistroAlumnos from "./pages/registroEstudiantes";
import AsistenciasPersonal from "./pages/asistenciaProfesores"; // Importación actualizada
import Footer from "./components/footer";
import AsistenciasDetalladas from "./pages/asistenciasDetalladas";
import BienesMobiliario from "./pages/mobiliario";
// Nota: Importa aquí tu componente de Mobiliario cuando lo crees, por ejemplo:
// import Mobiliario from "./pages/mobiliario";

function App() {
  const backgroundImage = "src/assets/FondoMinimalista.jpg";

  return (
    /* 1. Estructura flex y flex-col para asegurar el footer abajo */
    <div
      className="min-h-screen flex flex-col bg-fixed bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 35, 102, 0.75), rgba(0, 35, 102, 0.75)), url(${backgroundImage})`,
      }}
    >
      <Navbar />

      {/* 2. Main dinámico con flex-grow */}
      <main className="p-8 flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              <div className="page-transition max-w-7xl mx-auto">
                <header className="bg-white/0 backdrop-blur-lg shadow-2xl rounded-2xl p-8 mb-10 border-t-8 border-[#fdfbfb00]">
                  <h1 className="text-4xl font-black text-[#ffffff] flex items-center justify-center tracking-tight">
                    Gestión Administrativa
                  </h1>
                  <p className="text-xl text-[#ffffff] italic font-medium mt-2 flex items-center justify-center">
                    Control y Registro de Información Académica y de Personal
                  </p>
                </header>

                {/* Grid adaptado para albergar las 5 tarjetas de manera uniforme */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {/* Módulo: Registro Alumnos */}
                  <div className="group bg-white/70 p-6 rounded-3xl shadow-2xl border-l-12px border-[#002366] hover:bg-white transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between">
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] text-[#002366] flex items-center justify-center mb-6 shadow-inner">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                      <h2 className="font-black text-xl text-[#0F172A] mb-4">
                        Registro de Alumnos
                      </h2>
                      <p className="text-[#64748B] text-sm leading-relaxed">
                        Base de datos centralizada de matrícula. Gestión de
                        expedientes, datos de contacto y representantes.
                      </p>
                    </div>
                    <Link
                      to="/registro-estudiantes"
                      className="mt-8 inline-block bg-[#075efe] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#003399] transition-all text-center shadow-lg hover:shadow-blue-900/40 active:scale-95 text-sm"
                    >
                      Abrir Registro Alumnos 
                    </Link>
                  </div>

                  {/* Módulo: Asistencias de Estudiantes Detallado */}
                  <div className="group bg-white/70 p-6 rounded-3xl shadow-2xl border-l-12px border-[#002366] hover:bg-white transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between">
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] text-[#002366] flex items-center justify-center mb-6 shadow-inner">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </div>
                      <h2 className="font-black text-xl text-[#0F172A] mb-4">
                        Asistencia Alumnos Detallada
                      </h2>
                      <p className="text-[#64748B] text-sm leading-relaxed">
                        Seguimiento individualizado y pormenorizado del
                        comportamiento de asistencias y retrasos por alumno.
                      </p>
                    </div>
                    <Link
                      to="/asistenciasDetalladas"
                      className="mt-8 inline-block bg-[#075efe] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#003399] transition-all text-center shadow-lg hover:shadow-blue-900/40 active:scale-95 text-sm"
                    >
                      Abrir Detalle Alumnos 
                    </Link>
                  </div>

                  {/* Módulo: Asistencias Alumnos */}

                  <div className="group bg-white/70 p-6 rounded-3xl shadow-2xl border-l-12px border-[#002366] hover:bg-white transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between">
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] text-[#002366] flex items-center justify-center mb-6 shadow-inner">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                      </div>
                      <h2 className="font-black text-xl text-[#0F172A] mb-4">
                        Asistencia de Alumnos Totales
                      </h2>
                      <p className="text-[#64748B] text-sm leading-relaxed">
                        Monitoreo diario de presencia estudiantil. Herramienta
                        optimizada para el control por secciones y niveles.
                      </p>
                    </div>
                    <Link
                      to="/asistencias"
                      className="mt-8 inline-block bg-[#075efe] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#003399] transition-all text-center shadow-lg hover:shadow-blue-900/40 active:scale-95 text-sm"
                    >
                      Abrir Módulo Alumnos 
                    </Link>
                  </div>

                  {/* Módulo: Control de Asistencia de Personal */}
                  <div className="group bg-white/70 p-6 rounded-3xl shadow-2xl border-l-12px border-[#002366] hover:bg-white transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between">
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] text-[#002366] flex items-center justify-center mb-6 shadow-inner">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 014 0m-3 7a3 3 0 11-6 0 3 3 0 016 0zm2 2h6"
                          />
                        </svg>
                      </div>
                      <h2 className="font-black text-xl text-[#0F172A] mb-4">
                        Asistencia de Personal
                      </h2>
                      <p className="text-[#64748B] text-sm leading-relaxed">
                        Monitoreo de asistencia, incidencias y ausencias de los
                        colaboradores y personal de la institución por turnos.
                      </p>
                    </div>
                    <Link
                      to="/control-personal"
                      className="mt-8 inline-block bg-[#075efe] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#003399] transition-all text-center shadow-lg hover:shadow-blue-900/40 active:scale-95 text-sm"
                    >
                      Abrir Módulo Personal 
                    </Link>
                  </div>

                  {/* NUEVO MÓDULO: Mobiliarios Registrados */}
                  <div className="group bg-white/70 p-6 rounded-3xl shadow-2xl border-l-12px border-[#002366] hover:bg-white transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between">
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] text-[#002366] flex items-center justify-center mb-6 shadow-inner">
                        {/* Icono de Caja/Inventario */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                      <h2 className="font-black text-xl text-[#0F172A] mb-4">
                        Mobiliarios Registrados
                      </h2>
                      <p className="text-[#64748B] text-sm leading-relaxed">
                        Control de inventario de bienes materiales, 
                        estado de conservación y observaciones de la institución.
                      </p>
                    </div>
                    <Link
                      to="/mobiliario"
                      className="mt-1 inline-block bg-[#075efe] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#003399] transition-all text-center shadow-lg hover:shadow-blue-900/40 active:scale-95 text-sm"
                    >
                      Abrir Mobiliario                                  
                      
                    </Link>
                  </div>

                </section>
              </div>
            }
          />
          {/* Rutas de la Aplicación */}
          <Route path="/asistencias" element={<Asistencias />} />
          <Route path="/registro-estudiantes" element={<RegistroAlumnos />} />
          <Route path="/control-personal" element={<AsistenciasPersonal />} />
          <Route path="/asistenciasDetalladas" element={<AsistenciasDetalladas />} />
          <Route path="/mobiliario" element={<BienesMobiliario/>} />
        </Routes>
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
}

export default App;