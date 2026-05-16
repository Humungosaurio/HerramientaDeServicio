import Navbar from "./components/Navbar";
import { Link, Routes, Route } from 'react-router-dom';
import Asistencias from "./pages/asistencias";
import RegistroAlumnos from "./pages/registroEstudiantes"; 
import AsistenciasProfesores from "./pages/asistenciaProfesores";
import Footer from "./components/footer";
import AsistenciasDetalladas from "./pages/asistenciasDetalladas";

function App() {
  const backgroundImageUrl = "https://media.istockphoto.com/id/1410950079/es/foto/aula-de-estilo-moderno-en-el-render-3d-de-la-ma%C3%B1ana.jpg?s=612x612&w=0&k=20&c=_-4QTU59DP_N9qSVrvVd0FNRvUA5SgNxlAclJOd3PT0=";
  
  return (
    /* 1. Cambiamos a flex y flex-col. min-h-screen asegura que ocupe todo el alto */
    <div 
      className="min-h-screen flex flex-col bg-fixed bg-cover bg-center"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 35, 102, 0.75), rgba(0, 35, 102, 0.75)), url(${backgroundImageUrl})` 
      }}
    >
      <Navbar />

      {/* 2. Añadimos 'flex-grow' al main para que empuje al footer hacia abajo */}
      <main className="p-8 flex-grow">
        <Routes>
          <Route path="/" element={
            <div className="page-transition max-w-7xl mx-auto"> 
              
              <header className="bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl p-8 mb-10 border-t-8 border-[#fdfbfb00]">
                <h1 className="text-4xl font-black text-[#000000] flex items-center justify-center tracking-tight">
                  Gestión Administrative
                </h1>
                <p className="text-xl text-[#475569] italic font-medium mt-2 flex items-center justify-center">
                  Control y Registro de Información Académica
                </p>
              </header>

              <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Módulo: Asistencias Alumnos */}
                <div className="group bg-white/95 p-10 rounded-3xl shadow-2xl border-l-[12px] border-[#002366] hover:bg-white transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] text-[#002366] flex items-center justify-center mb-6 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <h2 className="font-black text-2xl text-[#0F172A] mb-4">Asistencia de Alumnos Totales</h2>
                    <p className="text-[#64748B] text-lg leading-relaxed">
                      Monitoreo diario de presencia estudiantil. Herramienta optimizada para el control por secciones y niveles.
                    </p>
                  </div>
                  <Link
                    to="/asistencias"
                    className="mt-10 inline-block bg-[#075efe] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#003399] transition-all text-center shadow-lg hover:shadow-blue-900/40 active:scale-95"
                  >
                    Abrir Módulo Alumnos →
                  </Link>
                </div>

                {/* Módulo: Registro Alumnos*/}
                <div className="group bg-white/95 p-10 rounded-3xl shadow-2xl border-l-[12px] border-[#002366] hover:bg-white transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] text-[#002366] flex items-center justify-center mb-6 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h2 className="font-black text-2xl text-[#0F172A] mb-4">Registro de Alumnos</h2>
                    <p className="text-[#64748B] text-lg leading-relaxed">
                      Base de datos centralizada de matrícula. Gestión de expedientes, datos de contacto y representantes.
                    </p>
                  </div>
                  <Link 
                    to="/registro-estudiantes" 
                    className="mt-10 inline-block bg-[#075efe] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#003399] transition-all text-center shadow-lg hover:shadow-blue-900/40 active:scale-95"
                  >
                    Abrir Registro de Alumnos →
                  </Link>
                </div>
                
                {/* Módulo: Asistencias de Profesores */}
                <div className="group bg-white/95 p-10 rounded-3xl shadow-2xl border-l-[12px] border-[#002366] hover:bg-white transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] text-[#002366] flex items-center justify-center mb-6 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <h2 className="font-black text-2xl text-[#0F172A] mb-4">Asistencia de Profesores</h2>
                    <p className="text-[#64748B] text-lg leading-relaxed">
                      Monitoreo de guardias, asistencia y ausencias del cuerpo docente de la institución organizados por turnos.
                    </p>
                  </div>
                  <Link
                    to="/registro-profesores"
                    className="mt-10 inline-block bg-[#075efe] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#003399] transition-all text-center shadow-lg hover:shadow-blue-900/40 active:scale-95"
                  >
                    Abrir Módulo Profesores →
                  </Link>
                </div>
                {/* Módulo: Asistencias de Estudiamtes uno por uno*/}
                <div className="group bg-white/95 p-10 rounded-3xl shadow-2xl border-l-[12px] border-[#002366] hover:bg-white transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] text-[#002366] flex items-center justify-center mb-6 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <h2 className="font-black text-2xl text-[#0F172A] mb-4">Asistencia de Alumnos detallado</h2>
                    <p className="text-[#64748B] text-lg leading-relaxed">
                      Monitoreo de guardias, asistencia y ausencias del cuerpo docente de la institución organizados por turnos.
                    </p>
                  </div>
                  <Link
                    to="/asistenciasDetalladas"
                    className="mt-10 inline-block bg-[#075efe] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#003399] transition-all text-center shadow-lg hover:shadow-blue-900/40 active:scale-95"
                  >
                    Abrir Módulo Profesores →
                  </Link>
                </div>
              </section>
            </div>
          } />

          <Route path="/asistencias" element={<Asistencias />} />
          <Route path="/registro-estudiantes" element={<RegistroAlumnos />} />
          <Route path="/registro-profesores" element={<AsistenciasProfesores />} />
          <Route path="/asistenciasDetalladas" element={<AsistenciasDetalladas />} />
        </Routes>
      </main>

      {/* 3. El footer ahora estará siempre al final debido al flex-grow del main */}
      <Footer />
    </div>
  );
}

export default App;