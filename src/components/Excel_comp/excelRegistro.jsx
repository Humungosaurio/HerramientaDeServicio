/**
 * Genera y descarga un archivo Excel eligiendo dinámicamente el controlador según el tipo de matrícula.
 */
export const generarExcelEstudiantes = async (estudiantes, seccionExportar, nombreArchivo, fechaDefecto, tipoMatricula) => {
  // 1. Filtrar estudiantes válidos
  let datosAExportar = estudiantes.filter(est => est.nombre && est.nombre.trim() !== "");

  // 2. Aplicar filtro de sección
  if (seccionExportar) {
    datosAExportar = datosAExportar.filter(est => {
      const idSeccion = `${est.turno}-${est.nivelEstudio}-${est.seccion}`.toLowerCase().replace(/ /g, '_');
      return idSeccion === seccionExportar;
    });
  }

  if (datosAExportar.length === 0) {
    alert("⚠️ No hay estudiantes registrados en la sección seleccionada para exportar.");
    return false;
  }

  const nombreDescarga = !nombreArchivo || nombreArchivo.trim() === "" ? fechaDefecto : nombreArchivo.trim();

  // 3. Enviar los datos al controlador de Python correspondiente
  if (window.pywebview && window.pywebview.api) {
    try {
      let respuesta;
      
      // Decidimos qué función del backend llamar basándonos en la UI
      if (tipoMatricula === "inicial") {
        respuesta = await window.pywebview.api.generar_excel_inicial_desde_plantilla(datosAExportar, nombreDescarga);
      } else {
        respuesta = await window.pywebview.api.generar_excel_desde_plantilla(datosAExportar, nombreDescarga);
      }
      
      if (respuesta.status === "success") {
        alert(`✅ Archivo Excel de Matrícula ${tipoMatricula === 'inicial' ? 'Inicial' : 'Final'} generado correctamente.`);
        return true;
      } else if (respuesta.status === "error") {
        alert(`❌ Ocurrió un error en el backend: ${respuesta.message}`);
        return false;
      }
    } catch (error) {
      alert("❌ Error de comunicación con el sistema local: " + error.message);
      return false;
    }
  } else {
    alert("🖥️ Estás en el navegador. La generación exacta de plantillas solo funciona ejecutando la aplicación de escritorio.");
    return false;
  }
};