import * as XLSX from 'xlsx';

/**
 * Genera y descarga un archivo Excel estilizado con la matrícula de estudiantes.
 * * @param {Array} estudiantes - Estado completo de estudiantes.
 * @param {string} seccionExportar - ID de la sección por la que filtrar (vacío para todas).
 * @param {string} nombreArchivo - Nombre ingresado por el usuario para el archivo.
 * @param {string} fechaDefecto - Fecha actual formateada en caso de nombre vacío.
 * @returns {boolean} - Devuelve true si la exportación fue exitosa.
 */
export const generarExcelEstudiantes = (estudiantes, seccionExportar, nombreArchivo, fechaDefecto) => {
  // 1. Filtrar estudiantes que tengan al menos un nombre válido
  let datosAExportar = estudiantes.filter(est => est.nombre && est.nombre.trim() !== "");

  // 2. Aplicar filtro de sección si fue seleccionado
  if (seccionExportar) {
    datosAExportar = datosAExportar.filter(est => {
      const idSeccion = `${est.turno}-${est.nivelEstudio}-${est.seccion}`.toLowerCase().replace(/ /g, '_');
      return idSeccion === seccionExportar;
    });
  }

  // 3. Validar si hay registros para exportar
  if (datosAExportar.length === 0) {
    alert("⚠️ No hay estudiantes registrados en la sección seleccionada para exportar.");
    return false;
  }

  // 4. Mapear y limpiar las columnas para la visualización final del reporte
  const datosLimpios = datosAExportar.map(est => ({
    "Nombres y Apellidos": est.nombre || '—',
    "Cédula Escolar": est.cedulaEscolar || '—',
    "Fecha Nacimiento": est.fechaNacimiento || '—',
    "Edad": est.edad ? `${est.edad} años` : '—',
    "Género": est.genero || '—',
    "Nivel": est.nivelEstudio || '—',
    "Turno": est.turno || '—',
    "Sección": est.seccion || '—',
    "Estado": est.estado || 'Vigente',
    "Condición / Diversidad": est.condicion || 'Ninguna',
    "Dirección Alumno": est.direccion || '—',
    "Talla Mono": est.tallaMono || '—',
    "Talla Camisa": est.tallaCamisa || '—',
    "Talla Calzado": est.tallaCalzado || '—',
    "Tipo de Sangre": est.tipoSangre || '—',
    "Representante Legal": est.representanteLegal || '—',
    "C.I. Representante": est.repCi || '—',
    "Teléfono Rep.": est.repTelefono || '—',
    "Correo Rep.": est.repCorreo || '—'
  }));

  // 5. Crear el libro y la hoja de cálculo
  const worksheet = XLSX.utils.json_to_sheet(datosLimpios);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Matrícula");

  // 6. ✨ ESTILIZADO: Auto-ajuste inteligente del ancho de las columnas
  // Esto evita que los textos se corten u oculten en las celdas
  if (datosLimpios.length > 0) {
    const columnasKeys = Object.keys(datosLimpios[0]);
    const columnasWidths = columnasKeys.map(key => {
      // Obtiene la longitud máxima entre el encabezado y los valores de esa columna
      const maxLongitud = Math.max(
        key.length,
        ...datosLimpios.map(fila => String(fila[key] ?? '').length)
      );
      return { wch: maxLongitud + 3 }; // +3 caracteres de margen de cortesía
    });
    worksheet['!cols'] = columnasWidths;
  }

  // 7. Determinar nombre de descarga definitivo
  const nombreDescarga = !nombreArchivo || nombreArchivo.trim() === "" ? fechaDefecto : nombreArchivo.trim();

  // 8. Forzar la descarga del archivo binario .xlsx
  XLSX.writeFile(workbook, `${nombreDescarga}.xlsx`);

  return true;
};