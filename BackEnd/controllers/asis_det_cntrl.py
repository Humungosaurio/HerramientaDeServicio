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

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        try:
            # Trae alumnos del salón
            cursor.execute("""
                SELECT e.cedula_estudiantil, e.est_nombre, e.est_genero 
                FROM Estudiante e
                JOIN salones s ON e.salon_id = s.salon_id
                WHERE LOWER(s.grado) = LOWER(?) AND LOWER(s.turno) = LOWER(?) AND LOWER(s.seccion) = LOWER(?)
                ORDER BY e.est_nombre ASC
            """, (grado, turno, seccion))
            
            alumnos = cursor.fetchall()
            resultados = []

            for alumno in alumnos:
                cedula, nombre, genero = alumno
                
                cursor.execute("""
                    SELECT dia_semana, estado FROM asistencias
                    WHERE cedula_estudiantil = ? AND mes = ? AND semana = ?
                """, (cedula, mes, semana))
                
                asistencia_semana = {"Lunes": False, "Martes": False, "Miércoles": False, "Jueves": False, "Viernes": False}
                for row in cursor.fetchall():
                    if row[0] in asistencia_semana:
                        asistencia_semana[row[0]] = (row[1] == 'Presente')

                resultados.append({
                    "id": cedula, "nombre": nombre, "sexo": 'v' if genero == 'Masculino' else 'h',
                    "asistencia": asistencia_semana
                })
            return {"status": "success", "data": resultados}
        except Exception as e:
            return {"status": "error", "message": str(e)}
        finally:
            conn.close()

    def guardar_asistencias(self, data):
        mes = data.get('mes')
        semana = data.get('semana')
        registros = data.get('registros', [])

        conn = sqlite3.connect(self.db_path)
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
            conn.close()

    def obtener_resumen_global(self, parametros):
        grado = str(parametros.get('grado') or '').strip()
        turno = str(parametros.get('turno') or '').strip()
        semana = str(parametros.get('semana') or 'Semana 1').strip()
        mes = str(parametros.get('mes') or 'Junio').strip()

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        try:
            # Calcula V y H presentes por sección
            cursor.execute("""
                SELECT 
                    s.seccion,
                    COUNT(CASE WHEN e.est_genero = 'Masculino' AND a.estado = 'Presente' THEN 1 END) as varones,
                    COUNT(CASE WHEN e.est_genero = 'Femenino' AND a.estado = 'Presente' THEN 1 END) as hembras
                FROM salones s
                LEFT JOIN Estudiante e ON s.salon_id = e.salon_id
                LEFT JOIN asistencias a ON e.cedula_estudiantil = a.cedula_estudiantil AND a.mes = ? AND a.semana = ?
                WHERE LOWER(s.grado) = LOWER(?) AND LOWER(s.turno) = LOWER(?)
                GROUP BY s.seccion
                ORDER BY s.seccion ASC
            """, (mes, semana, grado, turno))
            
            data = [{"seccion": row[0], "v": row[1], "h": row[2], "total": row[1] + row[2]} for row in cursor.fetchall()]
            return {"status": "success", "data": data}
        except Exception as e:
            return {"status": "error", "message": str(e)}
        finally:
            conn.close()