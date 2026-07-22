/**
 * Genera y descarga un archivo Excel de Asistencias Detalladas.
 * Mapea la información basada en la selección y se comunica con el backend.
 */
export const excelAsis = async (alumnos, opcionExportar, mesSeleccionado, semanaSeleccionada, nombreArchivo = "") => {
  // Nota: asegúrate de que el arreglo 'alumnos' venga del backend con nombre, estado y sexo.
  
  if (!alumnos || alumnos.length === 0) {
     // Enviar un aviso si la lista está vacía, pero si quieres probar el archivo en blanco, puedes remover esto.
     alert(`⚠️ No hay estudiantes registrados en la sala "${opcionExportar}" para descargar.`);
     return false;
  }

  // 1. Filtrar estudiantes válidos (Que tengan nombre y no estén retirados)
  let datosAExportar = alumnos.filter(al => al.nombre && al.nombre.trim() !== "" && al.estado !== 'Retirado');

  // 2. Mapear los datos básicos
  const datosMapeados = datosAExportar.map(al => ({
    id: al.id,
    nombre: al.nombre,
    sexo: al.sexo || ''
  }));

  // 3. Establecer nombre del archivo por defecto
  const fechaDefecto = new Date().toISOString().split('T')[0];
  const nombreFiltroLimpio = opcionExportar.replace(/ /g, '_').replace(/-/g, '').replace(/__/g, '_');
  
  const nombreDescarga = !nombreArchivo || nombreArchivo.trim() === "" 
    ? `Asistencias_Detalladas_${nombreFiltroLimpio}_${mesSeleccionado}_${semanaSeleccionada.replace(' ','')}_${fechaDefecto}.xlsx` 
    : nombreArchivo.trim();

  // 4. Enviar los datos exactos al controlador de Python
  if (window.pywebview && window.pywebview.api) {
    try {
      // Llamada al método Python que utilizará la plantilla Asistencias_detalladas.xlsx
      const respuesta = await window.pywebview.api.generar_excel_asistencias({
        datos: datosMapeados,             
        opcion_filtro: opcionExportar, // ✅ CORRECCIÓN: Se cambió 'sala' por 'opcion_filtro' para que Python lo reciba bien
        mes: mesSeleccionado,
        nombre_archivo: nombreDescarga
      });
      
      if (respuesta.status === "success") {
        alert(`✅ Archivo Excel de "${opcionExportar}" generado correctamente en la carpeta de descargas.`);
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