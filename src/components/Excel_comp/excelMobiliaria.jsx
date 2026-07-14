/**
 * Genera y descarga un archivo Excel por mobilaria usando la plantilla del backend
 */
export const generarExcelMobiliaria = async (inventario, nombreArchivo, fechaDefecto) => {
  if (!inventario || inventario.length === 0) {
    alert("⚠️ No hay artículos registrados para exportar.");
    return false;
  }

  const nombreDescarga = !nombreArchivo || nombreArchivo.trim() === "" ? fechaDefecto : nombreArchivo.trim();

  if (window.pywebview && window.pywebview.api) {
    try {
      const respuesta = await window.pywebview.api.generar_excel_mobiliaria(inventario, nombreDescarga);
      
      if (respuesta.status === "success") {
        alert("✅ Archivo Excel generado y guardado correctamente.");
        return true;
      } else if (respuesta.status === "error") {
        alert(`❌ Ocurrió un error: ${respuesta.message}`);
        return false;
      } else if (respuesta.status === "cancelado") {
        // El usuario cerró la ventana de guardar sin descargar
        return false;
      }
    } catch (error) {
      alert("❌ Error de comunicación con el sistema local: " + error.message);
      return false;
    }
  } else {
    alert("🖥️ Estás en el navegador. La generación con plantilla solo funciona en la app de escritorio.");
    return false;
  }
};