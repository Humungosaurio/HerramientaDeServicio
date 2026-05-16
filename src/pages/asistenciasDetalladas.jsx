import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

const AsistenciasDetalladas = () => {
    // 1. Estados de control de la interfaz (Nivel, Sección, Turno y Semana)
    const [nivelSeleccionado, setNivelSeleccionado] = useState('Maternal');
    const [seccionSeleccionada, setSeccionSeleccionada] = useState('A');
    const [turnoSeleccionado, setTurnoSeleccionado] = useState('Mañana');
    const [semanaSeleccionada, setSemanaSeleccionada] = useState('Semana 1');
    const [showResumen, setShowResumen] = useState(false);

    const niveles = ['Maternal', '1er Nivel', '2do Nivel', '3er Nivel'];
    const secciones = ['A', 'B'];
    const turnos = ['☀️Mañana', '🌙Tarde'];
    const semanas = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    // 2. Base de datos de estudiantes pre-ingresados con Turno incluido
    const [estudiantes] = useState([
        { id: 1, nombre: "Pedro Alana", nivel: "Maternal", seccion: "A", turno: "Mañana", sexo: "v" },
        { id: 2, nombre: "Nicol Blanco", nivel: "Maternal", seccion: "A", turno: "Mañana", sexo: "h" },
        { id: 3, nombre: "Carlos Mendoza", nivel: "Maternal", seccion: "B", turno: "Mañana", sexo: "v" },
        { id: 4, nombre: "Sofía Rodríguez", nivel: "Maternal", seccion: "A", turno: "Tarde", sexo: "h" },
        { id: 5, nombre: "Alejandro Gómez", nivel: "1er Nivel", seccion: "A", turno: "Mañana", sexo: "v" },
        { id: 6, nombre: "Mariana Vivas", nivel: "2do Nivel", seccion: "A", turno: "Tarde", sexo: "h" },
    ]);

    // Genera estructura mensual (4 semanas x 5 días) para cada estudiante
    const generarEstructuraAsistenciaIndividual = () => {
        const estructura = {};
        semanas.forEach(semana => {
            estructura[semana] = {};
            diasSemana.forEach(dia => {
                estructura[semana][dia] = false; // false = ausente, true = presente
            });
        });
        return estructura;
    };

    // 3. Estado global de asistencias estructurado por ID de estudiante
    const [registroAsistencias, setRegistroAsistencias] = useState(() => {
        const estadoInicial = {};
        estudiantes.forEach(estudiante => {
            estadoInicial[estudiante.id] = generarEstructuraAsistenciaIndividual();
        });
        return estadoInicial;
    });

    // 4. Filtrado de alumnos por Nivel, Sección y Turno seleccionado
    const estudiantesFiltrados = useMemo(() => {
        return estudiantes
            .filter(est =>
                est.nivel === nivelSeleccionado &&
                est.seccion === seccionSeleccionada &&
                est.turno === turnoSeleccionado
            )
            .sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [estudiantes, nivelSeleccionado, seccionSeleccionada, turnoSeleccionado]);

    // 5. Manejador para activar/desactivar la asistencia de un día específico
    const handleAsistenciaChange = (estudianteId, dia) => {
        setRegistroAsistencias(prev => ({
            ...prev,
            [estudianteId]: {
                ...prev[estudianteId],
                [semanaSeleccionada]: {
                    ...prev[estudianteId][semanaSeleccionada],
                    [dia]: !prev[estudianteId][semanaSeleccionada][dia]
                }
            }
        }));
    };

    // 6. Funciones de cálculo estadístico para el Modal de Cronograma
    const calcularTotalesPorDia = (nivel, semana, dia) => {
        let v = 0;
        let h = 0;
        estudiantes.forEach(est => {
            if (est.nivel === nivel && registroAsistencias[est.id]?.[semana]?.[dia]) {
                if (est.sexo === 'v') v++;
                if (est.sexo === 'h') h++;
            }
        });
        return { v, h, t: v + h };
    };

    const calcularTotalSemanalNivel = (nivel, semana) => {
        let total = 0;
        diasSemana.forEach(dia => {
            total += calcularTotalesPorDia(nivel, semana, dia).t;
        });
        return total;
    };

    const guardarCambios = () => {
        alert(`Asistencias de ${nivelSeleccionado} (Sección ${seccionSeleccionada} - Turno ${turnoSeleccionado}) — ${semanaSeleccionada} guardadas con éxito.`);
    };

    return (
        <div className="p-8 page-transition relative">
            <div className="flex flex-col md:flex-row gap-6">

                {/* SIDEBAR DE NIVELES */}
                <aside className="md:w-1/4 flex md:flex-col overflow-x-auto gap-2">
                    {niveles.map((nivel) => (
                        <button
                            key={nivel}
                            onClick={() => setNivelSeleccionado(nivel)}
                            className={`px-4 py-3 rounded-lg text-left font-bold transition-all ${nivelSeleccionado === nivel
                                ? 'bg-purple-700 text-white shadow-lg scale-105'
                                : 'text-gray-600 hover:bg-purple-50 bg-white border border-gray-100'
                                }`}
                        >
                            {nivel}
                        </button>
                    ))}
                </aside>

                {/* CONTENIDO PRINCIPAL */}
                <main className="flex-1">
                    <header className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-end border-b pb-4 gap-4">
                        <div>
                            <p className="text-sm text-purple-600 font-bold uppercase tracking-widest">Módulo Inicial (Estudiantes)</p>
                            <h1 className="text-3xl font-black text-white">
                                {nivelSeleccionado} — {semanaSeleccionada}
                            </h1>
                        </div>

                        {/* BOTONES DE ACCIÓN */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setShowResumen(true)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-bold shadow-md transition-all flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Ver Cronograma Mensual
                            </button>

                            <Link to="/" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-bold hover:bg-gray-50 flex items-center">
                                Inicio
                            </Link>

                            <button onClick={guardarCambios} className="bg-purple-600 hover:bg-purple-800 text-white px-6 py-2 rounded-md font-bold shadow-md">
                                Guardar Reporte
                            </button>
                        </div>
                    </header>

                    {/* CONTROLES FILTROS (Sección, Turno y Semana) */}
                    <div className="flex flex-wrap gap-4 mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
                        {/* Filtro de Sección */}
                        <div className="flex bg-gray-200 p-1 rounded-xl w-fit font-bold shadow-inner">
                            {secciones.map(sec => (
                                <button
                                    key={sec}
                                    onClick={() => setSeccionSeleccionada(sec)}
                                    className={`px-5 py-1.5 rounded-lg text-sm transition-all ${seccionSeleccionada === sec ? 'bg-white text-purple-700 shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Sección {sec}
                                </button>
                            ))}
                        </div>

                        {/* Filtro de Turno (Mañana / Tarde) */}
                        <div className="flex bg-gray-200 p-1 rounded-xl w-fit font-bold shadow-inner">
                            {turnos.map(tur => (
                                <button
                                    key={tur}
                                    onClick={() => setTurnoSeleccionado(tur)}
                                    className={`px-5 py-1.5 rounded-lg text-sm transition-all ${turnoSeleccionado === tur ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    {tur}
                                </button>
                            ))}
                        </div>

                        {/* Selector de Semanas */}
                        <div className="flex bg-gray-200 p-1 rounded-xl w-fit font-bold shadow-inner">
                            {semanas.map((semana) => (
                                <button
                                    key={semana}
                                    onClick={() => setSemanaSeleccionada(semana)}
                                    className={`px-4 py-1.5 rounded-lg text-sm transition-all ${semanaSeleccionada === semana ? 'bg-purple-700 text-white shadow-md' : 'text-gray-600 hover:text-purple-700'}`}
                                >
                                    {semana}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* TABLA CON LAS 5 COLUMNAS DE DÍAS SIMULTÁNEAS */}
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-purple-50 p-3 border-b text-xs font-bold text-purple-800 uppercase tracking-wider flex justify-between">
                            <span>Nivel: {nivelSeleccionado} — Sección "{seccionSeleccionada}" ({turnoSeleccionado})</span>
                            <span className="text-indigo-700">Vista Semanal: {semanaSeleccionada}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="p-4 text-left min-w-[200px]">Nombre del Estudiante</th>
                                        <th className="p-4 text-center">Género</th>
                                        {/* Renderizado de las columnas de Lunes a Viernes */}
                                        {diasSemana.map(dia => (
                                            <th key={dia} className="p-4 text-center bg-purple-50/50 text-purple-900 font-black">
                                                {dia}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {estudiantesFiltrados.length > 0 ? (
                                        estudiantesFiltrados.map((estudiante) => (
                                            <tr key={estudiante.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 font-bold text-gray-700 text-left">{estudiante.nombre}</td>
                                                <td className="p-4 text-center text-gray-500 font-semibold text-sm">
                                                    {estudiante.sexo === 'v' ? '👦 V' : '👧 H'}
                                                </td>

                                                {/* Renderizado de los 5 interruptores de asistencia correspondientes a cada día */}
                                                {diasSemana.map(dia => {
                                                    const asistio = registroAsistencias[estudiante.id]?.[semanaSeleccionada]?.[dia] || false;
                                                    return (
                                                        <td key={dia} className="p-4 text-center">
                                                            <div className="flex justify-center items-center min-h-[36px]">
                                                                <label className="inline-flex items-center justify-center cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={asistio}
                                                                        onChange={() => handleAsistenciaChange(estudiante.id, dia)}
                                                                        className="sr-only peer"
                                                                    />
                                                                    {/* Tu Switch Estilizado original */}
                                                                    <div className="w-10 h-6 flex items-center bg-gray-200 rounded-full p-0.5 duration-300 ease-in-out peer-checked:bg-green-500 after:bg-white after:w-5 after:h-5 after:rounded-full after:shadow-md after:duration-300 peer-checked:after:translate-x-4"></div>
                                                                </label>
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="p-10 text-center text-sm font-semibold text-gray-400">
                                                No hay alumnos registrados en {nivelSeleccionado} — Sección "{seccionSeleccionada}" ({turnoSeleccionado})
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* MODAL DE RESUMEN DETALLADO CRONOLÓGICO */}
            {showResumen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden">
                        <div className="p-6 border-b bg-blue-600 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black">Reporte General de Asistencia Estudiantil</h2>
                                <p className="text-blue-100 text-sm">Cronograma detallado por Semanas y Días (Matrícula Consolidada)</p>
                            </div>
                            <button onClick={() => setShowResumen(false)} className="text-3xl hover:text-gray-200">&times;</button>
                        </div>

                        <div className="p-6 bg-gray-100 max-h-[75vh] overflow-y-auto flex flex-col gap-8">
                            {niveles.map((nivel) => (
                                <div key={nivel} className="bg-white border rounded-2xl p-6 shadow-sm">
                                    <div className="border-b pb-2 mb-4">
                                        <h3 className="text-2xl font-black text-purple-800">{nivel}</h3>
                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Desglose Estadístico Mensual</p>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                        {semanas.map((sem) => (
                                            <div key={sem} className="bg-gray-50 rounded-xl border p-4">
                                                <div className="flex justify-between items-center border-b pb-2 mb-3">
                                                    <span className="font-extrabold text-gray-700 uppercase text-sm tracking-wide">{sem}</span>
                                                    <span className="text-xs font-black bg-purple-100 text-purple-800 px-2 py-1 rounded-md">
                                                        Total Semana: {calcularTotalSemanalNivel(nivel, sem)} alumnos
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-5 gap-2 text-center">
                                                    {diasSemana.map((dia) => {
                                                        const totalDia = calcularTotalesPorDia(nivel, sem, dia);
                                                        return (
                                                            <div key={dia} className="bg-white border rounded-lg p-2 flex flex-col justify-between shadow-sm">
                                                                <p className="text-[10px] font-black uppercase text-indigo-600 tracking-tight border-b pb-1 mb-1">
                                                                    {dia.substring(0, 3)}
                                                                </p>
                                                                <div className="text-[10px] text-gray-500 space-y-0.5 font-medium">
                                                                    <p><span className="text-blue-500 font-bold">V:</span> {totalDia.v}</p>
                                                                    <p><span className="text-pink-500 font-bold">H:</span> {totalDia.h}</p>
                                                                </div>
                                                                <div className="mt-1.5 pt-1 border-t bg-gray-50 rounded font-black text-xs text-gray-800">
                                                                    T: {totalDia.t}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-white flex justify-end border-t">
                            <button
                                onClick={() => setShowResumen(false)}
                                className="bg-gray-800 text-white px-8 py-2 rounded-lg font-bold hover:bg-black transition-all"
                            >
                                Cerrar Reporte
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AsistenciasDetalladas;