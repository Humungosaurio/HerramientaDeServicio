import sqlite3

class Asis_Det_Controller:
    def __init__(self, db_path):
        self.db_path = db_path

    def cargar_matriz_asistencia(self, parametros):
        grado = str(parametros.get('grado') or '').strip()
        turno = str(parametros.get('turno') or '').strip()
        seccion = str(parametros.get('seccion') or 'A').strip()
        mes = str(parametros.get('mes') or 'Junio').strip()
        semana = str(parametros.get('semana') or 'Semana 1').strip()

        # AÑADIDO: Conexión blindada con timeout y WAL para evitar bloqueos
        conn = sqlite3.connect(self.db_path, timeout=20.0)
        conn.execute("PRAGMA journal_mode=WAL;")
        cursor = conn.cursor()
        try:
            # CORREGIDO: Se cambia e.est_estatus por e.estado y se añade e.est_apellido
            cursor.execute("""
                SELECT e.cedula_estudiantil, e.est_nombre, e.est_apellido, e.est_genero, e.estado 
                FROM Estudiante e
                JOIN salones s ON e.salon_id = s.salon_id
                WHERE LOWER(s.grado) = LOWER(?) AND LOWER(s.turno) = LOWER(?) AND LOWER(s.seccion) = LOWER(?)
                  AND (LOWER(e.estado) != 'retirado' OR e.estado IS NULL)
                ORDER BY e.est_nombre ASC, e.est_apellido ASC
            """, (grado, turno, seccion))
            
            alumnos = cursor.fetchall()
            resultados = []

            for alumno in alumnos:
                cedula, nombre, apellido, genero, estatus = alumno
                
                # Unificamos nombre y apellido para que se vea completo en la tabla de React
                nombre_completo = f"{nombre or ''} {apellido or ''}".strip()
                if not nombre_completo:
                    nombre_completo = "Sin Nombre"
                
                cursor.execute("""
                    SELECT dia_semana, estado FROM asistencias
                    WHERE cedula_estudiantil = ? AND mes = ? AND semana = ?
                """, (cedula, mes, semana))
                
                asistencia_semana = {"Lunes": False, "Martes": False, "Miércoles": False, "Jueves": False, "Viernes": False}
                for row in cursor.fetchall():
                    if row[0] in asistencia_semana:
                        asistencia_semana[row[0]] = (row[1] == 'Presente')

                resultados.append({
                    "id": cedula,
                    "nombre": nombre_completo,  # <--- Ahora envía Nombre y Apellido
                    "sexo": 'v' if genero == 'Masculino' else 'h',
                    "estado": estatus or "Vigente",
                    "asistencia": asistencia_semana
                })
            return {"status": "success", "data": resultados}
        except Exception as e:
            print(f"❌ Error al cargar matriz de asistencia: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            cursor.close()
            conn.close()

    def guardar_asistencias(self, data):
        mes = data.get('mes')
        semana = data.get('semana')
        registros = data.get('registros', [])

        conn = sqlite3.connect(self.db_path, timeout=20.0)
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA foreign_keys = ON;")
        cursor = conn.cursor()
        try:
            for reg in registros:
                cedula = reg['id']
                for dia, presente in reg['asistencia'].items():
                    estado = 'Presente' if presente else 'Ausente'
                    cursor.execute("""
                        INSERT OR REPLACE INTO asistencias (cedula_estudiantil, mes, semana, dia_semana, estado) 
                        VALUES (?, ?, ?, ?, ?)
                    """, (cedula, mes, semana, dia, estado))
            conn.commit()
            return {"status": "success"}
        except Exception as e:
            conn.rollback()
            return {"status": "error", "message": str(e)}
        finally:
            cursor.close()
            conn.close()

    def obtener_resumen_global(self, parametros):
        grado = str(parametros.get('grado') or '').strip()
        turno = str(parametros.get('turno') or '').strip()
        semana = str(parametros.get('semana') or 'Semana 1').strip()
        mes = str(parametros.get('mes') or 'Junio').strip()

        conn = sqlite3.connect(self.db_path, timeout=20.0)
        conn.execute("PRAGMA journal_mode=WAL;")
        cursor = conn.cursor()
        try:
            # 1. Buscamos todas las secciones existentes para el Grado y Turno seleccionados
            cursor.execute("""
                SELECT salon_id, seccion 
                FROM salones 
                WHERE LOWER(grado) = LOWER(?) AND LOWER(turno) = LOWER(?)
                ORDER BY seccion ASC
            """, (grado, turno))
            
            salones = cursor.fetchall()
            dias_semana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
            data_final = []

            # 2. Por cada sección, calculamos las asistencias por día
            for salon_id, seccion in salones:
                dias_dict = {}
                
                for dia in dias_semana:
                    # Contamos varones y hembras presentes en ese día específico
                    cursor.execute("""
                        SELECT 
                            COUNT(CASE WHEN e.est_genero = 'Masculino' AND a.estado = 'Presente' THEN 1 END) as varones,
                            COUNT(CASE WHEN e.est_genero = 'Femenino' AND a.estado = 'Presente' THEN 1 END) as hembras
                        FROM Estudiante e
                        LEFT JOIN asistencias a ON e.cedula_estudiantil = a.cedula_estudiantil 
                            AND a.mes = ? AND a.semana = ? AND a.dia_semana = ?
                        WHERE e.salon_id = ? 
                          AND (LOWER(e.estado) != 'retirado' OR e.estado IS NULL)
                    """, (mes, semana, dia, salon_id))
                    
                    row = cursor.fetchone()
                    v = row[0] if row else 0
                    h = row[1] if row else 0
                    
                    # Armamos la estructura exacta que pide React en el frontend
                    dias_dict[dia] = {
                        "v": v,
                        "h": h,
                        "total": v + h
                    }

                data_final.append({
                    "seccion": seccion,
                    "dias": dias_dict
                })

            return {"status": "success", "data": data_final}
        except Exception as e:
            print(f"❌ Error en resumen global por días: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            cursor.close()
            conn.close()