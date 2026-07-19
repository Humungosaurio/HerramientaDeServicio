import sqlite3
from datetime import datetime

class AcademicController:
    def __init__(self, db_path):
        self.db_path = db_path

    def registrar_estudiante_completo(self, data):
        # 1. AÑADIDO: timeout=20 le dice a Python que si la BD está ocupada, 
        # espere hasta 20 segundos a que se libere antes de dar error.
        conn = sqlite3.connect(self.db_path, timeout=20.0)
        
        # 2. AÑADIDO: Modo WAL para evitar bloqueos entre lecturas y escrituras
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA foreign_keys = ON;")
        cursor = conn.cursor()
        
        try:
            def to_int_optional(x):
                s = str(x or '').strip()
                return int(s) if s.isdigit() else None

            rep_ci = to_int_optional(data.get('repCi'))
            re_inst_ci = to_int_optional(data.get('re_inst_ci')) or rep_ci
            est_ci = to_int_optional(data.get('cedulaEscolar'))

            if not rep_ci or not est_ci:
                raise Exception("La cédula del representante legal (repCi) y del estudiante (cedulaEscolar) son obligatorias.")

            trabaja_rep = 1 if str(data.get('repTrabaja')).lower() in ('sí', 'si', '1', 'true') else 0
            
            cursor.execute("""
                INSERT OR REPLACE INTO representante (
                    representante_ci, nombre, direccion, fecha_nacimiento,
                    grado_educacion, trabaja, direccion_trabajo,
                    parentesco, lugar_nacimiento, telefono, correo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                rep_ci,
                data.get('repNombre') or data.get('representanteLegal') or 'Sin Nombre',
                data.get('repDireccion') or data.get('direccion') or 'Sin Dirección',
                data.get('repFechaNacimiento') or '2000-01-01',
                data.get('repGradoInstruccion') or 'No especificado',
                trabaja_rep,
                data.get('repDondeTrabaja') if trabaja_rep == 1 else None,
                data.get('repParentesco') or 'Representante Legal',
                data.get('repLugarNacimiento') or '',
                data.get('repTelefono') or '',
                data.get('repCorreo') or ''
            ))
            
            trabaja_inst = 1 if str(data.get('re_inst_trabaja')).lower() in ('sí', 'si', '1', 'true') else 0
            
            cursor.execute("""
                INSERT OR REPLACE INTO rep_responsable (
                    re_inst_ci, nombre, direccion, fecha_nacimiento,
                    grado_educacion, trabaja, direccion_trabajo,
                    parentesco, lugar_nacimiento, telefono, correo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                re_inst_ci,
                data.get('representanteInstitucional') or data.get('repNombre') or 'Sin Nombre',
                data.get('re_inst_direccion') or data.get('repDireccion') or data.get('direccion') or 'Sin Dirección',
                data.get('re_inst_fechaNacimiento') or data.get('repFechaNacimiento') or '2000-01-01',
                data.get('re_inst_gradoInstruccion') or data.get('repGradoInstruccion') or 'No especificado',
                trabaja_inst,
                data.get('re_inst_dondeTrabaja') if trabaja_inst == 1 else None,
                data.get('re_inst_parentesco') or data.get('repParentesco') or 'Institucional',
                data.get('re_inst_lugarNacimiento') or data.get('repLugarNacimiento') or '',
                data.get('re_inst_telefono') or data.get('repTelefono') or '',
                data.get('re_inst_correo') or data.get('repCorreo') or ''
            ))

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

            fecha_hoy = datetime.now().strftime("%d-%m-%Y")

            cursor.execute("""
                INSERT OR REPLACE INTO Estudiante (
                    cedula_estudiantil, est_nombre, est_apellido, est_direccion, est_genero,
                    neurodiversidad, est_fecha_nacimiento, fecha_ingreso, 
                    re_inst_ci, representante_ci, salon_id,
                    tipo_sangre, talla_mono, talla_camisa, talla_calzado, estado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                est_ci,
                data.get('nombre') or 'Estudiante Sin Nombre',
                data.get('apellido') or 'Estudiante Sin Apellido',
                data.get('direccion') or 'Sin Dirección',
                data.get('genero') or 'No especificado',
                data.get('condicion') or 'Ninguna',
                data.get('fechaNacimiento') or '2020-01-01',
                fecha_hoy,
                re_inst_ci,
                rep_ci,
                salon_id,
                data.get('tipoSangre') or 'Desconocido',
                str(data.get('tallaMono') or ''),
                str(data.get('tallaCamisa') or ''),
                str(data.get('tallaCalzado') or ''),
                data.get('estado') or 'Vigente'
            ))

            conn.commit()
            return {"status": "success"}

        except Exception as e:
            conn.rollback()
            print(f"❌ ERROR CRÍTICO EN BACKEND: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            # 3. CRÍTICO: Aseguramos cerrar el cursor y la conexión siempre
            cursor.close()
            conn.close()

    def obtener_estudiantes(self):
        conn = sqlite3.connect(self.db_path)
        conn = sqlite3.connect(self.db_path, timeout=20.0) # <-- AÑADE TIMEOUT AQUÍ
        conn.execute("PRAGMA journal_mode=WAL;")           # <-- Y MODO WAL AQUÍ
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        conn.row_factory = sqlite3.Row 
        cursor = conn.cursor()
        try:
            # AÑADIDO: e.estado en el SELECT
            query = """
                SELECT 
                    e.cedula_estudiantil, e.est_nombre, e.est_apellido, e.fecha_ingreso, e.est_direccion, e.est_genero,
                    e.neurodiversidad, e.est_fecha_nacimiento, e.tipo_sangre,
                    e.talla_mono, e.talla_camisa, e.talla_calzado, e.re_inst_ci, e.estado,
                    s.grado, s.turno, s.seccion,
                    
                    r.representante_ci, r.nombre as rep_nombre, r.telefono as rep_tlf, 
                    r.correo as rep_correo, r.direccion as rep_dir, r.fecha_nacimiento as rep_fnac, 
                    r.parentesco as rep_par, r.lugar_nacimiento as rep_lnac, 
                    r.grado_educacion as rep_grado, r.trabaja as rep_trab, r.direccion_trabajo as rep_dir_trab,
                    
                    ri.re_inst_ci as inst_ci, ri.nombre as inst_nombre, ri.telefono as inst_tlf, 
                    ri.correo as inst_correo, ri.direccion as inst_dir, ri.fecha_nacimiento as inst_fnac, 
                    ri.parentesco as inst_par, ri.lugar_nacimiento as inst_lnac, 
                    ri.grado_educacion as inst_grado, ri.trabaja as inst_trab, ri.direccion_trabajo as inst_dir_trab
                    
                FROM Estudiante e
                LEFT JOIN salones s ON e.salon_id = s.salon_id
                LEFT JOIN representante r ON e.representante_ci = r.representante_ci
                LEFT JOIN rep_responsable ri ON e.re_inst_ci = ri.re_inst_ci
            """
            cursor.execute(query)
            rows = cursor.fetchall()
            
            estudiantes_formateados = []
            for row in rows:
                rep_ci = str(row['representante_ci'] or "")
                inst_ci = str(row['inst_ci'] or "")
                tiene_inst = True if (inst_ci and inst_ci != rep_ci) else False

                estudiantes_formateados.append({
                    "id": str(row['cedula_estudiantil']), 
                    "cedulaEscolar": str(row['cedula_estudiantil']),
                    "nombre": row['est_nombre'] or "",
                    "apellido": row['est_apellido'] or "",
                    "fechaIngreso": row['fecha_ingreso'] or "",
                    "direccion": row['est_direccion'] or "",
                    "genero": row['est_genero'] or "",
                    "condicion": row['neurodiversidad'] or "Ninguna",
                    "fechaNacimiento": row['est_fecha_nacimiento'] or "",
                    "tipoSangre": row['tipo_sangre'] or "",
                    "tallaMono": str(row['talla_mono'] or ""),
                    "tallaCamisa": str(row['talla_camisa'] or ""),
                    "tallaCalzado": str(row['talla_calzado'] or ""),
                    "nivelEstudio": row['grado'] or "",
                    "turno": row['turno'] or "",
                    "seccion": row['seccion'] or "",
                    "estado": row['estado'] or "Vigente", # <--- AHORA LEE EL VALOR DE LA BD
                    "edad": "",
                    
                    "repCi": rep_ci,
                    "repNombre": row['rep_nombre'] or "",
                    "repTelefono": row['rep_tlf'] or "",
                    "repCorreo": row['rep_correo'] or "",
                    "repDireccion": row['rep_dir'] or "",
                    "repFechaNacimiento": row['rep_fnac'] or "",
                    "repParentesco": row['rep_par'] or "",
                    "repLugarNacimiento": row['rep_lnac'] or "",
                    "repGradoInstruccion": row['rep_grado'] or "",
                    "repTrabaja": "Sí" if row['rep_trab'] == 1 else "No",
                    "repDondeTrabaja": row['rep_dir_trab'] or "",
                    
                    "tieneRepInstitucional": tiene_inst,
                    "re_inst_ci": inst_ci,
                    "representanteInstitucional": row['inst_nombre'] or "",
                    "re_inst_telefono": row['inst_tlf'] or "",
                    "re_inst_correo": row['inst_correo'] or "",
                    "re_inst_direccion": row['inst_dir'] or "",
                    "re_inst_fechaNacimiento": row['inst_fnac'] or "",
                    "re_inst_parentesco": row['inst_par'] or "",
                    "re_inst_lugarNacimiento": row['inst_lnac'] or "",
                    "re_inst_gradoInstruccion": row['inst_grado'] or "",
                    "re_inst_trabaja": "Sí" if row['inst_trab'] == 1 else "No",
                    "re_inst_dondeTrabaja": row['inst_dir_trab'] or ""
                })
            return estudiantes_formateados
        except Exception as e:
            print(f"❌ Error al consultar estudiantes para el frontend: {e}")
            return []
        finally:
            conn.close()