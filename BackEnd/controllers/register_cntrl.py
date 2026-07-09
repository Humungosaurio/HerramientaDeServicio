import sqlite3

class AcademicController:
    def __init__(self, db_path):
        self.db_path = db_path

    def registrar_estudiante_completo(self, data):
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA foreign_keys = ON;")
        cursor = conn.cursor()
        
        try:
            def to_int_optional(x):
                s = str(x or '').strip()
                return int(s) if s.isdigit() else None

            # ---------------------------------------------------------
            # 1) Extracción y Validación de Cédulas (Claves Primarias)
            # ---------------------------------------------------------
            rep_ci = to_int_optional(data.get('repCi'))
            
            # Si el usuario no especificó otra cédula institucional, usa por defecto la legal
            re_inst_ci = to_int_optional(data.get('re_inst_ci')) or rep_ci
            est_ci = to_int_optional(data.get('cedulaEscolar'))

            if not rep_ci or not est_ci:
                raise Exception("La cédula del representante legal (repCi) y del estudiante (cedulaEscolar) son obligatorias.")

            # ---------------------------------------------------------
            # 2) Insertar o Actualizar en 'representante' (Legal)
            # ---------------------------------------------------------
            trabaja_rep = 1 if str(data.get('repTrabaja')).lower() in ('sí', 'si', '1', 'true') else 0
            
            cursor.execute("""
                INSERT OR REPLACE INTO representante (
                    representante_ci, nombre, direccion, fecha_nacimiento,
                    grado_educacion, trabaja, direccion_trabajo,
                    parentesco, lugar_nacimiento
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                rep_ci,
                data.get('repNombre') or data.get('representanteLegal') or 'Sin Nombre',
                data.get('repDireccion') or data.get('direccion') or 'Sin Dirección',
                data.get('repFechaNacimiento') or '2000-01-01',
                data.get('repGradoInstruccion') or 'No especificado',
                trabaja_rep,
                data.get('repDondeTrabaja') if trabaja_rep == 1 else None,
                data.get('repParentesco') or 'Representante Legal',
                data.get('repLugarNacimiento') or ''
            ))
            
            # ---------------------------------------------------------
            # 3) Insertar o Actualizar en 'rep_responsable' (Institucional)
            # ---------------------------------------------------------
            trabaja_inst = 1 if str(data.get('re_inst_trabaja')).lower() in ('sí', 'si', '1', 'true') else 0
            
            # Nota: Si en el frontend no se activó el formulario extra, aquí
            # llegarán exactamente los mismos datos duplicados del rep. legal.
            cursor.execute("""
                INSERT OR REPLACE INTO rep_responsable (
                    re_inst_ci, nombre, direccion, fecha_nacimiento,
                    grado_educacion, trabaja, direccion_trabajo,
                    parentesco, lugar_nacimiento
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                re_inst_ci,
                data.get('representanteInstitucional') or data.get('repNombre') or 'Sin Nombre',
                data.get('re_inst_direccion') or data.get('repDireccion') or data.get('direccion') or 'Sin Dirección',
                data.get('re_inst_fechaNacimiento') or data.get('repFechaNacimiento') or '2000-01-01',
                data.get('re_inst_gradoInstruccion') or data.get('repGradoInstruccion') or 'No especificado',
                trabaja_inst,
                data.get('re_inst_dondeTrabaja') if trabaja_inst == 1 else None,
                data.get('re_inst_parentesco') or data.get('repParentesco') or 'Institucional',
                data.get('re_inst_lugarNacimiento') or data.get('repLugarNacimiento') or ''
            ))

            # ---------------------------------------------------------
            # 4) Obtener el 'salon_id' desde la tabla 'salones'
            # ---------------------------------------------------------
            grado = str(data.get('nivelEstudio') or data.get('grado') or data.get('nivel') or '').strip()
            turno = str(data.get('turno') or '').strip()
            seccion = str(data.get('seccion') or '').strip()

            cursor.execute("""
                SELECT salon_id FROM salones 
                WHERE LOWER(grado) = LOWER(?) 
                  AND LOWER(turno) = LOWER(?) 
                  AND LOWER(seccion) = LOWER(?)
                """, (grado, turno, seccion))
            
            row = cursor.fetchone()
            if not row:
                raise Exception(f"No se encontró el salón en la base de datos para: Grado '{grado}', Turno '{turno}', Sección '{seccion}'.")
            
            salon_id = row[0]

            # ---------------------------------------------------------
            # 5) Insertar o Actualizar en 'Estudiante'
            # ---------------------------------------------------------
            cursor.execute("""
                INSERT OR REPLACE INTO Estudiante (
                    cedula_estudiantil, est_nombre, est_direccion, est_genero,
                    neurodiversidad, est_fecha_nacimiento, 
                    re_inst_ci, representante_ci, salon_id,
                    tipo_sangre, talla_mono, talla_camisa, talla_calzado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                est_ci,
                data.get('nombre') or 'Estudiante Sin Nombre',
                data.get('direccion') or 'Sin Dirección',
                data.get('genero') or 'No especificado',
                data.get('condicion') or 'Ninguna',
                data.get('fechaNacimiento') or '2020-01-01',
                re_inst_ci,
                rep_ci,
                salon_id,
                data.get('tipoSangre') or 'Desconocido',
                str(data.get('tallaMono') or ''),
                str(data.get('tallaCamisa') or ''),
                str(data.get('tallaCalzado') or '')
            ))

            conn.commit()
            return {"status": "success"}

        except Exception as e:
            conn.rollback()
            print(f"❌ ERROR CRÍTICO EN BACKEND: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            conn.close()