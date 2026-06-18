import sqlite3
from database.connection import get_db_connection

class AttendanceController:
    def guardar_asistencia_global(self, datos):
        """
        Guarda o actualiza el reporte estadístico diario enviado desde React.
        'datos' debe ser un diccionario con la siguiente estructura:
        {
            "salon_id": int,
            "semana": int,
            "dia_semana": str,
            "cant_varones": int,
            "cant_hembras": int
        }
        """
        conn = get_db_connection()
        if not conn:
            return {"success": False, "message": "No se pudo establecer conexión con la base de datos."}
            
        cursor = conn.cursor()
        try:
            # Si el registro ya existe para ese día/salón, simplemente actualiza los conteos.
            query = """
                INSERT OR REPLACE INTO asistencia_global 
                (salon_id, semana, dia_semana, cant_varones, cant_hembras)
                VALUES (?, ?, ?, ?, ?);
            """
            
            cursor.execute(query, (
                int(datos["salon_id"]),
                int(datos["semana"]),
                datos["dia_semana"],
                int(datos["cant_varones"]),
                int(datos["cant_hembras"])
            ))
            
            conn.commit()
            return {"success": True, "message": "Reporte estadístico guardado correctamente."}
            
        except sqlite3.IntegrityError as e:
            return {"success": False, "message": f"Error de integridad (¿Existe el salon_id?): {str(e)}"}
        except Exception as e:
            return {"success": False, "message": f"Error inesperado en el servidor: {str(e)}"}
        finally:
            conn.close()

    def obtener_asistencia_global(self, salon_id, semana, dia_semana):
        """
        Recupera los datos de asistencia de un salón específico en un día y semana determinados.
        Sirve para rellenar los inputs en React cuando la maestra navega por la interfaz.
        """
        conn = get_db_connection()
        if not conn:
            return {"success": False, "message": "No se pudo conectar a la base de datos."}
            
        cursor = conn.cursor()
        try:
            query = """
                SELECT cant_varones, cant_hembras 
                FROM asistencia_global 
                WHERE salon_id = ? AND semana = ? AND dia_semana = ?;
            """
            cursor.execute(query, (int(salon_id), int(semana), dia_semana))
            fila = cursor.fetchone()
            
            if fila:
                return {
                    "success": True,
                    "encontrado": True,
                    "data": {
                        "cant_varones": fila["cant_varones"],
                        "cant_hembras": fila["cant_hembras"]
                    }
                }
            
            # Si no existe registro previo, devolvemos ceros para limpiar los inputs de la interfaz
            return {
                "success": True,
                "encontrado": False,
                "data": {"cant_varones": 0, "cant_hembras": 0}
            }
            
        except Exception as e:
            return {"success": False, "message": f"Error al consultar la asistencia: {str(e)}"}
        finally:
            conn.close()