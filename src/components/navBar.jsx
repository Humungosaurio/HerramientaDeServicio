import { useState } from 'react';

const Navbar = () => {
  // Estado para controlar la apertura de la sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <nav className="bg-white/95 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-sm relative">
        
        {/* Lado Izquierdo: LOGO DEL COLEGIO */}
        <div className="flex items-center z-10">
          <div className="w-15 h-15 flex items-center justify-center overflow-hidden">
            <img 
              src="/src/assets/LogoReceptoria.png" // <--- Asegúrate de que el nombre coincida con tu archivo
              alt="Logo C.E.I Simoncito"
              className="w-full h-full object-contain"
            />
          </div> 
        </div>

        {/* CENTRO: Nombre de la rectoría */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-16">
          <span className="text-lg md:text-xl font-black text-black pointer-events-auto text-center leading-tight">
            C.E.I Receptoría Simóncito San Joaquín
          </span>
        </div>

        {/* Lado Derecho: Botón Hamburguesa */}
        <div className="flex items-center gap-4 z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg text-black hover:bg-purple-50 transition-colors focus:outline-none"
            aria-label="Abrir menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

      </nav>

      {/* --- SIDEBAR COMPONENTS --- */}
      
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Panel de la Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out p-6 flex flex-col justify-between ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        <div>
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div className="flex items-center gap-2">
              <img src="/src/assets/WhatsApp Image 2026-05-08 at 4.54.11 PM.jpeg" alt="mini logo" className="w-6 h-6 object-contain" />
              <h3 className="text-lg font-black text-gray-800">Menú del Sistema</h3>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
            >
              &times;
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-10 text-center bg-purple-50 rounded-2xl border border-purple-100 p-6">
            <div className="text-4xl mb-3 animate-pulse">🚧</div>
            <h4 className="text-sm font-bold text-purple-900 uppercase tracking-widest">Módulo en Desarrollo</h4>
            <p className="text-xs text-purple-700 mt-2 leading-relaxed">
              Estamos preparando nuevas herramientas de gestión para la institución.
            </p>
          </div>
        </div>

        <div className="text-center text-[10px] text-gray-400 border-t pt-4 uppercase font-bold tracking-widest">
          Simoncito San Joaquín — Carabobo &copy; 2026
        </div>

      </div>
    </>
  );
};

export default Navbar;