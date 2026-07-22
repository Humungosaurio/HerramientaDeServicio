/**
 * Genera y descarga un archivo Excel de Asistencias Detalladas.
 * Mapea la información basada en la selección y se comunica con el backend.
 */export const excelAsis = async (alumnos, opcionExportar, mesSeleccionado, semanaSeleccionada, nombreArchivo = "") => {
  // 1. Filtrar estudiantes válidos (Que tengan nombre y no estén retirados)[cite: 4]
  let datosAExportar = alumnos.filter(al => al.nombre && al.nombre.trim() !== "" && al.estado !== 'Retirado');

  if (datosAExportar.length === 0) {
    alert(`⚠️ No hay estudiantes registrados o vigentes en "${opcionExportar}" para el mes de ${mesSeleccionado}.`);
    return false;
  }

  // 2. Mapear los datos básicos[cite: 4]
  const datosMapeados = datosAExportar.map(al => ({
    id: al.id,
    nombre: al.nombre,
    sexo: al.sexo || ''
  }));

  // 3. Establecer nombre del archivo por defecto[cite: 4]
  const fechaDefecto = new Date().toISOString().split('T')[0];
  const nombreDescarga = !nombreArchivo || nombreArchivo.trim() === "" 
    ? `Asistencias_${opcionExportar.replace(/ /g, '_').replace(/-/g, '').replace(/__/g, '_')}_${mesSeleccionado}_${fechaDefecto}` 
    : nombreArchivo.trim();

  // 4. Enviar los datos exactos al controlador de Python[cite: 4]
  if (window.pywebview && window.pywebview.api) {
    try {
      const respuesta = await window.pywebview.api.generar_excel_asistencias({
        datos: datosMapeados,             
        opcion_filtro: opcionExportar,    
        mes: mesSeleccionado,
        nombre_archivo: nombreDescarga
      });
      
      if (respuesta.status === "success") {
        alert(`✅ Archivo Excel de "${opcionExportar}" generado correctamente en tu equipo.`);
        return true;
      } else if (respuesta.status === "error") {
        alert(`❌ Ocurrió un error al generar el Excel: ${respuesta.message}`);
        return false;
      }
    } catch (error) {
      alert("❌ Error de comunicación con el sistema local: " + error.message);
      return false;
    }
  } else {
    alert("🖥️ Estás en el navegador. La generación de plantillas Excel solo funciona ejecutando la aplicación de escritorio.");
    return false;
  }
};