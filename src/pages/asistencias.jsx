import { Link } from 'react-router-dom';
{/* Esto se va a cambiar todo Hacer barra de navegacion en componentes y agregarla a esta pagina */}
const Asistencias = () => {
  return (
    <div className="p-8 page-transition" >
      {/* Encabezado de la página */}
      <h1 className="text-3xl font-bold text-purple-700 mb-6">
        Registro de Asistencias
      </h1>

      {/* Contenedor principal en blanco */}
      <div className="bg-white p-6 rounded-xl shadow-sm min-h-[100]">
        <p className="text-gray-500">
          El lienzo está en blanco. Aquí puedes empezar a construir tu tabla o formulario.
        </p>
      </div>

      {/* Botón para regresar */}
      <div className="mt-6">
        <Link to="/" className="text-blue-600 font-semibold hover:underline">
          ← Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default Asistencias;