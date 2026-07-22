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
                INSERT OR REPLACE INTO personal (
                    cedula_trabajador, nombre, cargo, turno, horas_administrativas, estado, fecha_ingreso
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                cedula,
                str(data.get('nombre', '')).strip(),
                str(data.get('cargo', '')).strip(),
                str(data.get('turno', '')).strip(),
                int(data.get('horas_administrativas', 0)),
                str(data.get('estado', 'Activo')).strip(),
                str(data.get('fecha_ingreso', '')).strip()
            ))
            
            conn.commit()
            return {"status": "success", "message": "Trabajador registrado exitosamente."}
        except Exception as e:
            return {"status": "error", "message": str(e)}
        finally:
            if 'conn' in locals(): conn.close()

    def cargar_matriz_asistencia_personal(self, parametros):
        """Trae todo el personal de un turno y verifica cuántas horas trabajaron cada día."""
        turno = str(parametros.get('turno') or 'Mañana').strip()
        mes = str(parametros.get('mes') or 'Junio').strip()
        semana = str(parametros.get('semana') or 'Semana 1').strip()

        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT cedula_trabajador, nombre, cargo, horas_administrativas, estado, fecha_ingreso 
                FROM personal 
                WHERE LOWER(turno) = LOWER(?)
                ORDER BY nombre ASC
            """, (turno,))
            
            personal_rows = cursor.fetchall()
            resultados = []

            for empleado in personal_rows:
                cedula, nombre, cargo, horas_admin, estado, fecha_ingreso = empleado
                
                # Selecciona de la tabla 'asistencias_personal' usando la columna 'horas'
                cursor.execute("""
                    SELECT dia_semana, horas FROM asistencias_personal
                    WHERE cedula_trabajador = ? AND mes = ? AND semana = ?
                """, (cedula, mes, semana))
                
                asistencia_semana = {
                    "Lunes": "", "Martes": "", "Miércoles": "", 
                    "Jueves": "", "Viernes": ""
                }
                
                for row in cursor.fetchall():
                    dia = row[0]
                    horas_trabajadas = row[1]
                    if dia in asistencia_semana:
                        asistencia_semana[dia] = horas_trabajadas if horas_trabajadas else ""

                resultados.append({
                    "cedula": cedula,
                    "nombre": nombre,
                    "cargo": cargo,
                    "horas_administrativas": horas_admin,
                    "estado": estado,
                    "fecha_ingreso": fecha_ingreso,
                    "asistencia": asistencia_semana
                })

            return {"status": "success", "data": resultados}
        except Exception as e:
            return {"status": "error", "message": str(e)}
        finally:
            if 'conn' in locals(): conn.close()

    def actualizar_estado_trabajador(self, data):
        """Actualiza el estado (Activo, Suspendido, Despedido) de un trabajador."""
        try:
            cedula = int(data.get('cedula', 0))
            estado = str(data.get('estado', '')).strip()
            
            if not cedula or not estado:
                return {"status": "error", "message": "Datos incompletos para actualizar estado."}
                
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE personal SET estado = ? WHERE cedula_trabajador = ?
            """, (estado, cedula))
            
            conn.commit()
            return {"status": "success", "message": "Estado actualizado correctamente."}
        except Exception as e:
            return {"status": "error", "message": str(e)}
        finally:
            if 'conn' in locals(): conn.close()

    def guardar_asistencias_personal(self, data):
        """Guarda las horas trabajadas y actualiza el estado del personal."""
        mes = data.get('mes')
        semana = data.get('semana')
        registros = data.get('registros', [])

        try:
            conn = sqlite3.connect(self.db_path)
            conn.execute("PRAGMA foreign_keys = ON;")
            cursor = conn.cursor()
            
            for reg in registros:
                cedula = reg['cedula']
                estado = reg.get('estado') # ✨ Rescatamos el estado enviado desde React

                # ✨ NUEVO: Actualizamos el estado del trabajador en la tabla 'personal'
                if estado:
                    cursor.execute("""
                        UPDATE personal SET estado = ? WHERE cedula_trabajador = ?
                    """, (estado, cedula))

                # Lógica original para guardar las horas
                for dia, horas in reg['asistencia'].items():
                    try:
                        val_horas = float(horas)
                    except (ValueError, TypeError):
                        val_horas = 0.0

                    cursor.execute("""
                        INSERT OR REPLACE INTO asistencias_personal (
                            cedula_trabajador, mes, semana, dia_semana, horas
                        ) VALUES (?, ?, ?, ?, ?)
                    """, (cedula, mes, semana, dia, val_horas))
            
            conn.commit()
            return {"status": "success", "message": "Asistencias y estados guardados correctamente."}
        except Exception as e:
            if 'conn' in locals(): conn.rollback()
            return {"status": "error", "message": str(e)}
        finally:
            if 'conn' in locals(): conn.close()