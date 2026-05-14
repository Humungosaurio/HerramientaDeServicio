const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-sm relative">
      
      {/* Lado Izquierdo: Espacio para Logo o Menú */}
      <div className="flex items-center z-10">
        {/* Puedes poner un icono de menú o logo pequeño aquí */}
        <div className="w-8 h-8 bg-purple-100 rounded-lg"></div> 
      </div>

      {/* CENTRO: Nombre de la rectoría */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-xl font-black whitespace-nowrap text-purple-700 pointer-events-auto">
          C.E.I Receptoría Simóncito San Joaquín
        </span>
      </div>

      {/* Lado Derecho: Perfil o Acciones */}
      <div className="flex items-center gap-4 z-10">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs">
          JM
        </div>
      </div>

    </nav>
  );
};

export default Navbar;
