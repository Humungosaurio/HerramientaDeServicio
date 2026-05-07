const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-sm">
      {/* Lado Izquierdo: Logo o Título */}
      <div className="flex items-center">
        <span className="self-center text-xl font-bold whitespace-nowrap text-purple-700">
          Rectoria Pedro
        </span>
      </div>
      {/* Lado Derecho: Perfil o Acciones 
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
          JM
        </div>
      </div>
      */}
    </nav>
  );
};

export default Navbar;
