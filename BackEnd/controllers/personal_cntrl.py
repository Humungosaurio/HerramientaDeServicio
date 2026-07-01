import sqlite3

class PersonalController:
    def __init__(self, db_path):
        self.db_path = db_path

    def registrar_trabajador(self, data):
        """Registra o actualiza los datos de un miembro del personal."""
        try:
            cedula = int(data.get('cedula', 0))
            if not cedula:
                return {"status": "error", "message": "La cédula es obligatoria y debe ser numérica."}
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT OR REPLACE INTO personal (cedula_trabajador, nombre, cargo, turno, horas_administrativas)
                VALUES (?, ?, ?, ?, ?)
            """, (
                cedula,
                str(data.get('nombre', '')).strip(),
                str(data.get('cargo', '')).strip(),
                str(data.get('turno', '')).strip(),
                int(data.get('horas_administrativas', 0))
            ))
            
            conn.commit()
            return {"status": "success", "message": "Trabajador registrado exitosamente."}
        except Exception as e:
            return {"status": "error", "message": str(e)}
        finally:
            if 'conn' in locals(): conn.close()

    def cargar_matriz_asistencia_personal(self, parametros):
        """Trae todo el personal de un turno y verifica qué días de la semana asistieron."""
        turno = str(parametros.get('turno') or 'Mañana').strip()
        mes = str(parametros.get('mes') or 'Junio').strip()
        semana = str(parametros.get('semana') or 'Semana 1').strip()

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        try:
            # 1. Obtener todos los trabajadores asignados a ese turno
            cursor.execute("""
                SELECT cedula_trabajador, nombre, cargo, horas_administrativas 
                FROM personal 
                WHERE LOWER(turno) = LOWER(?)
                ORDER BY nombre ASC
            """, (turno,))
            
            personal_rows = cursor.fetchall()
            resultados = []

            # 2. Por cada trabajador, mapear sus asistencias de la semana
            for empleado in personal_rows:
                cedula, nombre, cargo, horas = empleado
                
                cursor.execute("""
                    SELECT dia_semana, estado FROM asistencias_personal
                    WHERE cedula_trabajador = ? AND mes = ? AND semana = ?
                """, (cedula, mes, semana))
                
                asistencia_semana = {
                    "Lunes": False, "Martes": False, "Miércoles": False, 
                    "Jueves": False, "Viernes": False
                }
                
                for row in cursor.fetchall():
                    dia = row[0]
                    estado = row[1]
                    if dia in asistencia_semana:
                        asistencia_semana[dia] = (estado == 'Presente')

                resultados.append({
                    "cedula": cedula,
                    "nombre": nombre,
                    "cargo": cargo,
                    "horas_administrativas": horas,
                    "asistencia": asistencia_semana
                })

            return {"status": "success", "data": resultados}
        except Exception as e:
            return {"status": "error", "message": str(e)}
        finally:
            conn.close()

    def guardar_asistencias_personal(self, data):
        """Guarda el estado de asistencia de todo el personal enviado desde React."""
        mes = data.get('mes')
        semana = data.get('semana')
        registros = data.get('registros', [])

        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA foreign_keys = ON;")
        cursor = conn.cursor()
        try:
            for reg in registros:
                cedula = reg['cedula']
                for dia, presente in reg['asistencia'].items():
                    estado = 'Presente' if presente else 'Ausente'
                    cursor.execute("""
                        INSERT OR REPLACE INTO asistencias_personal (
                            cedula_trabajador, mes, semana, dia_semana, estado
                        ) VALUES (?, ?, ?, ?, ?)
                    """, (cedula, mes, semana, dia, estado))
            conn.commit()
            return {"status": "success", "message": "Asistencias del personal guardadas."}
        except Exception as e:
            conn.rollback()
            return {"status": "error", "message": str(e)}
        finally:
            conn.close()