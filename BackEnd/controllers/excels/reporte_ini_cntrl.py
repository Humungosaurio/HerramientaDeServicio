import os
import webview
import openpyxl

class ReporteIniController:
    def __init__(self):
        pass

    def generar_excel_desde_plantilla(self, datos_estudiantes, nombre_archivo):
        try:
            # Apuntamos a la raíz del backend (subimos 3 niveles: excels -> controllers -> BackEnd)
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            
            # Buscamos específicamente el archivo matricula_inicial.xlsx en la carpeta Excels
            ruta_plantilla = os.path.join(base_dir, "Excels", "matricula_inicial.xlsx")
            
            if not os.path.exists(ruta_plantilla):
                return {
                    "status": "error", 
                    "message": f"No se encontró el archivo en la ruta esperada: {ruta_plantilla}"
                }

            window = webview.windows[0]
            result = window.create_file_dialog(
                webview.SAVE_DIALOG,
                directory='',
                save_filename=f"{nombre_archivo}.xlsx",
                file_types=('Archivos Excel (*.xlsx)', 'Todos los archivos (*.*)')
            )

            if not result:
                return {"status": "cancelado"}

            ruta_guardado = result[0]

            # Cargar plantilla preservando estilos e imágenes
            wb = openpyxl.load_workbook(ruta_plantilla)
            ws = wb.active

            # =========================================================
            # FUNCIÓN AUXILIAR PARA CELDAS COMBINADAS
            # =========================================================
            def escribir_celda_segura(fila, col, valor):
                try:
                    ws.cell(row=fila, column=col, value=valor)
                except AttributeError:
                    celda = ws.cell(row=fila, column=col)
                    for rango in ws.merged_cells.ranges:
                        if celda.coordinate in rango:
                            ws.cell(row=rango.min_row, column=rango.min_col, value=valor)
                            break

            # =========================================================
            # COORDENADAS EXACTAS DEL FORMATO RR-DEA-05-03 (Matrícula Inicial)
            # =========================================================
            fila_actual = 14 # Los registros comienzan en la fila 14
            limite_filas = 48 # Solo admite hasta 35 estudiantes (fila 48)

            for i, est in enumerate(datos_estudiantes):
                if fila_actual > limite_filas:
                    print("⚠️ Se alcanzó el límite de estudiantes por plantilla (35).")
                    break
                
                # --- EXTRACCIÓN DE TODOS LOS DATOS (Igual al reporte final) ---
                cedula = est.get('cedulaEscolar') or est.get('cedula_estudiantil') or ''
                lugar_nac = est.get('lugarNacimiento') or est.get('lugar_nacimiento') or ''
                ef = est.get('entidadFederal') or est.get('ef') or est.get('est_ef') or ''
                genero = est.get('genero') or est.get('est_genero') or ''
                fecha_nac = est.get('fechaNacimiento') or est.get('est_fecha_nacimiento') or ''
                
                apellidos = est.get('apellidos', '')
                nombres = est.get('nombres', '')

                # 0. Número de estudiante (N°) - Columna 1
                escribir_celda_segura(fila_actual, 1, str(i + 1).zfill(2))
                
                # 1. Cédula - Columna 2
                escribir_celda_segura(fila_actual, 2, cedula)
                
                # 2. Separación y Escritura de Nombres y Apellidos
                if not apellidos and not nombres:
                    nombre_completo = str(est.get('nombre') or est.get('est_nombre') or '').strip().upper()
                    partes_nombre = nombre_completo.split()
                    
                    if len(partes_nombre) >= 3:
                        apellidos = " ".join(partes_nombre[:2])
                        nombres = " ".join(partes_nombre[2:])
                    elif len(partes_nombre) == 2:
                        apellidos = partes_nombre[0]
                        nombres = partes_nombre[1]
                    else:
                        apellidos = nombre_completo
                        nombres = ""

                # Apellidos - Columna 4
                escribir_celda_segura(fila_actual, 4, str(apellidos).upper())
                
                # Nombres - Columna 9
                escribir_celda_segura(fila_actual, 9, str(nombres).upper())

                # 3. Sexo - Columna 14
                escribir_celda_segura(fila_actual, 14, genero[0].upper() if genero else '')

                # 4. Fecha de nacimiento: Día (Col 15), Mes (Col 16), Año (Col 17)
                if fecha_nac:
                    sep = '-' if '-' in fecha_nac else '/'
                    partes = fecha_nac.split(sep)
                    if len(partes) == 3:
                        if len(partes[0]) == 4: # Formato YYYY-MM-DD
                            dia, mes, anio = partes[2], partes[1], partes[0]
                        else: # Formato DD-MM-YYYY
                            dia, mes, anio = partes[0], partes[1], partes[2]
                            
                        escribir_celda_segura(fila_actual, 15, dia)  
                        escribir_celda_segura(fila_actual, 16, mes)  
                        escribir_celda_segura(fila_actual, 17, anio) 

                # 5. Escolaridad: RG (Regular) Col 18 - RP (Repitiente) Col 19
                # Si el sistema lo provee lo marcamos, por defecto será 'RG'
                escolaridad = est.get('escolaridad') or est.get('est_escolaridad') or 'RG'
                if str(escolaridad).upper() == 'RP':
                    escribir_celda_segura(fila_actual, 19, 'X')
                else:
                    escribir_celda_segura(fila_actual, 18, 'X')

                # Nota: lugar_nac y ef son extraídos para mantener la paridad con el final, 
                # pero el formato "Matrícula Inicial" no tiene columnas designadas para estos dos atributos.

                # Avanzamos al siguiente registro
                fila_actual += 1

            wb.save(ruta_guardado)
            return {"status": "success"}

        except Exception as e:
            print(f"❌ Error al generar Excel inicial: {e}")
            return {"status": "error", "message": str(e)}