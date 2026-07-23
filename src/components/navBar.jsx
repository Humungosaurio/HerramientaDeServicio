import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // ◄ Añadimos useNavigate
import logoReceptoria from '../assets/LogoReceptoria.png';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate(); // ◄ Inicializamos el hook de navegación segura

  // Función para disparar el respaldo de la Base de Datos vía Python (PyWebView)
  const handleRespaldoBD = async () => {
    if (window.pywebview && window.pywebview.api) {
      try {
        const res = await window.pywebview.api.respaldar_bd();
        if (res.status === 'success') {
          alert(`✅ Respaldo exitoso.\nArchivo guardado en: ${res.ruta}`);
        } else {
          alert(`❌ Error al respaldar: ${res.message}`);
        }
      } catch (error) {
        alert("❌ Error de conexión con el controlador del sistema.");
      }
    } else {
      alert("🖥️ Entorno Web / Navegador: Esta función requiere el sistema ejecutable R.A.I. 26.");
    }
  };

  // Función para un reinicio seguro en entornos PyWebView
  const handleReinicioSeguro = () => {
    setIsSidebarOpen(false);
    navigate('/'); // Navega a la raíz sin romper el sistema de archivos local
  };

  // Componente interno reutilizable para los enlaces del menú
  const NavItem = ({ to, icon, label, fileRef }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setIsSidebarOpen(false)}
        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive
          ? 'bg-purple-100 text-purple-800 font-bold shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600 font-medium'
          }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl w-6 text-center">{icon}</span>
          <span className="text-sm">{label}</span>
        </div>
        <span className="text-[9px] opacity-0 group-hover:opacity-60 bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-mono transition-opacity uppercase tracking-tight">
          {fileRef}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-sm relative z-30">

        {/* Lado Izquierdo: Logo Institucional */}
        <div className="flex items-center z-10">
          <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
            <img
              src={logoReceptoria}
              alt="Logo C.E.I Simoncito"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Centro: Título del Plantel */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-16">
          <span className="text-base md:text-lg font-black text-gray-800 pointer-events-auto text-center leading-tight">
            C.E.I Simóncito Receptoría San Joaquín
          </span>
        </div>

        {/* Lado Derecho: Botón del Centro de Atajos (Hamburguesa) */}
        <div className="flex items-center gap-4 z-10">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors focus:outline-none flex items-center gap-2 font-bold text-sm"
            aria-label="Abrir panel"
          >
            <span className="hidden md:inline text-xs uppercase tracking-wider text-gray-500">Menú</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

      </nav>

      {/* --- COMPONENTES DE LA BARRA LATERAL (SIDEBAR) --- */}

      {/* Fondo difuminado externo (Overlay) */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Contenedor Deslizable */}
      <div className={`fixed top-0 right-0 h-full w-[340px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>

        {/* Encabezado del Panel */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <img src={logoReceptoria} alt="mini logo" className="w-8 h-8 object-contain" />
              <div>
                <h3 className="text-lg font-black text-gray-800 leading-none">R.A.I. 26</h3>
                <span className="text-[10px] text-purple-600 font-bold uppercase tracking-widest">Atajos del Sistema</span>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Enlaces Mapeados */}
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6 custom-scrollbar">

          {/* Bloque 1: Gestión Estudiantil y Matrícula */}
          <div>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2.5 px-2">Área Académica</h4>
            <nav className="flex flex-col gap-1">

              <NavItem
                to="/registro-estudiantes"
                icon="🧑 "
                label="Matrícula de Estudiantes"
                fileRef="registroEstudiantes"
              />

              {/* ◄ CORRECCIÓN: Coincide exactamente con App.jsx */}
              <NavItem
                to="/AsistenciasDetalladas"
                icon="📝"
                label="Listado detallado"
                fileRef="asistenciasDetalladas"
              />

              <NavItem
                to="/asistencias"
                icon="📊"
                label="Asistencias totales"
                fileRef="asistencias"
              />

            </nav>
          </div>

          {/* Bloque 2: Infraestructura y Recursos Humanos */}
          <div>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2.5 px-2">Administración</h4>
            <nav className="flex flex-col gap-1">

              {/* ◄ CORRECCIÓN: Ahora apunta a /control-personal como en App.jsx */}
              <NavItem
                to="/control-personal"
                icon="👨‍🏫"
                label="Asistencia del Personal"
                fileRef="asistenciaProfesores"
              />

              <NavItem
                to="/mobiliario"
                icon="🪑"
                label="Bienes y Mobiliario"
                fileRef="mobiliario"
              />

            </nav>
          </div>

          {/* Bloque 3: Utilidades del Sistema Local */}
          <div className="mt-2 border-t border-gray-100 pt-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 px-2">Mantenimiento</h4>
            <div className="flex flex-col gap-2">
              {/* ◄ CORRECCIÓN: Navegación segura que no crashea PyWebView */}
              <button
                onClick={handleReinicioSeguro}
                className="flex items-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl transition-colors w-full text-left text-xs font-bold"
              >
                <span>🏠</span>
                <span>Regresar al Panel Principal</span>
              </button>
            </div>
          </div>

        </div>

        {/* Pie de la Barra Lateral */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
            Simoncito San Joaquín — Carabobo &copy; 2026
          </div>
        </div>

      </div>
    </>
  );
};

export default Navbar;