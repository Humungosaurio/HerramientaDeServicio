import sqlite3

class AcademicController:
    def __init__(self, db_path):
        # Recibe la ruta absoluta calculada por main.py
        self.db_path = db_path

    def registrar_estudiante_completo(self, data):
        conn = sqlite3.connect(self.db_path)
        # Activamos las llaves foráneas para respetar tus relaciones relacionales
        conn.execute("PRAGMA foreign_keys = ON;")
        cursor = conn.cursor()
        
        try:
            # Helper para convertir strings vacíos o limpios a enteros de forma segura
            def to_int_optional(x):
                s = str(x or '').strip()
                return int(s) if s.isdigit() else None

            # ---------------------------------------------------------
            # 1) Extracción y Validación de Cédulas (Claves Primarias)
            # ---------------------------------------------------------
            rep_ci = to_int_optional(data.get('repCi'))
            
            # Si no viene una cédula institucional específica, heredamos la del representante legal
            re_inst_ci = to_int_optional(data.get('re_inst_ci')) or rep_ci
            
            est_ci = to_int_optional(data.get('cedulaEscolar'))

            if not rep_ci or not est_ci:
                raise Exception("La cédula del representante legal (repCi) y del estudiante (cedulaEscolar) son obligatorias.")

            # ---------------------------------------------------------
            # 2) Insertar o Actualizar en 'representante_legal'
            # ---------------------------------------------------------
            trabaja_rep = 1 if str(data.get('repTrabaja')).lower() in ('sí', 'si', '1') else 0
            
            cursor.execute("""
                INSERT OR REPLACE INTO representante (
                    representante_ci, nombre, direccion, fecha_nacimiento,
                    grado_educacion, trabaja, direccion_trabajo
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                rep_ci,
                data.get('repNombre'),
                data.get('repDireccion') or data.get('direccion'),
                data.get('repFechaLugarNac'),
                data.get('repGradoInstruccion'),
                trabaja_rep,
                data.get('repDondeTrabaja') if trabaja_rep == 1 else None
            ))
            
            # ---------------------------------------------------------
            # 3) Insertar o Actualizar en 'rep_responsable'
            # ---------------------------------------------------------
            trabaja_inst = 1 if str(data.get('repTrabajaInst')).lower() in ('sí', 'si', '1') else 0
            
            cursor.execute("""
                INSERT OR REPLACE INTO rep_responsable (
                    re_inst_ci, nombre, direccion, fecha_nacimiento,
                    grado_educacion, trabaja, direccion_trabajo
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                re_inst_ci,
                data.get('representanteInstitucional') or data.get('repNombre'),
                data.get('direccion') or data.get('repDireccion'),
                data.get('repFechaLugarNacInst') or data.get('repFechaLugarNac'),
                data.get('repGradoInstruccionInst') or data.get('repGradoInstruccion'),
                trabaja_inst,
                data.get('repDondeTrabajaInst') if trabaja_inst == 1 else None
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
                raise Exception(f"No se encontró el salón en la base de datos para: Grado '{grado}', Turno '{turno}', Sección '{seccion}'. Verifique la configuración de salones.")
            
            salon_id = row[0]

            # ---------------------------------------------------------
            # 5) Insertar o Actualizar en 'Estudiante'
            # ---------------------------------------------------------
            cursor.execute("""
                INSERT OR REPLACE INTO Estudiante (
                    cedula_estudiantil, est_nombre, est_direccion, est_genero,
                    neurodiversidad, est_fecha_nacimiento, 
                    re_inst_ci, representante_ci, salon_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                est_ci,
                data.get('nombre'),
                data.get('direccion'),
                data.get('genero'),
                data.get('condicion'),
                data.get('fechaNacimiento'),
                re_inst_ci,
                rep_ci,
                salon_id
            ))

            # Guardamos todos los cambios de forma segura
            conn.commit()
            return {"status": "success"}

        except Exception as e:
            conn.rollback()
            print(f"❌ ERROR CRÍTICO EN BACKEND: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            conn.close()