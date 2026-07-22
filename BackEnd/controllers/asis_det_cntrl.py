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

        conn = sqlite3.connect(self.db_path, timeout=20.0)
        conn.execute("PRAGMA journal_mode=WAL;")
        cursor = conn.cursor()
        try:
            # CORRECCIÓN: Evitamos LOWER() en SQL para columnas con 'ñ' o acentos.
            # Se asume que el frontend envía los datos con el formato correcto (ej. 'Mañana', '1er Nivel').
            cursor.execute("""
                SELECT e.cedula_estudiantil, e.est_nombre, e.est_apellido, e.est_genero, e.estado 
                FROM Estudiante e
                JOIN salones s ON e.salon_id = s.salon_id
                WHERE TRIM(s.grado) = ? 
                  AND TRIM(s.turno) = ? 
                  AND TRIM(s.seccion) = ?
                  AND (TRIM(LOWER(e.estado)) != 'retirado' OR e.estado IS NULL)
                ORDER BY e.est_nombre ASC, e.est_apellido ASC
            """, (grado, turno, seccion))
            
            alumnos = cursor.fetchall()
            resultados = []

            for alumno in alumnos:
                cedula, nombre, apellido, genero, estatus = alumno
                
                nombre_completo = f"{nombre or ''} {apellido or ''}".strip()
                if not nombre_completo:
                    nombre_completo = "Sin Nombre"
                
                # CORRECCIÓN: Traemos el dia_semana tal cual está y lo procesamos en Python
                cursor.execute("""
                    SELECT TRIM(dia_semana), TRIM(LOWER(estado)) FROM asistencias
                    WHERE cedula_estudiantil = ? 
                      AND TRIM(mes) = ? 
                      AND TRIM(semana) = ?
                """, (cedula, mes, semana))
                
                asistencia_semana = {"Lunes": False, "Martes": False, "Miércoles": False, "Jueves": False, "Viernes": False}
                for row in cursor.fetchall():
                    # Usamos Python para convertir a minúsculas, ya que sí soporta UTF-8 correctamente
                    dia_db = str(row[0]).lower()
                    estado_db = str(row[1])
                    es_presente = (estado_db == 'presente')
                    
                    if dia_db == 'lunes': asistencia_semana["Lunes"] = es_presente
                    elif dia_db == 'martes': asistencia_semana["Martes"] = es_presente
                    elif dia_db in ['miércoles', 'miercoles']: asistencia_semana["Miércoles"] = es_presente
                    elif dia_db == 'jueves': asistencia_semana["Jueves"] = es_presente
                    elif dia_db == 'viernes': asistencia_semana["Viernes"] = es_presente

                resultados.append({
                    "id": cedula,
                    "nombre": nombre_completo, 
                    "sexo": 'v' if str(genero).strip().lower() in ['masculino', 'm', 'v', 'varon', 'varón'] else 'h',
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
        mes = str(data.get('mes') or '').strip()
        semana = str(data.get('semana') or '').strip()
        registros = data.get('registros', [])

        conn = sqlite3.connect(self.db_path, timeout=20.0)
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA foreign_keys = ON;")
        cursor = conn.cursor()
        try:
            for reg in registros:
                cedula = reg.get('id')
                
                if not cedula or str(cedula).strip() == "":
                    continue 

                for dia, presente in reg['asistencia'].items():
                    estado = 'Presente' if presente else 'Ausente'
                    dia_limpio = str(dia).strip()
                    
                    # IMPORTANTE: Si la tabla no tiene una restricción UNIQUE en (cedula_estudiantil, mes, semana, dia_semana), 
                    # esto creará duplicados. Te recomiendo verificar el esquema de tu base de datos.
                    cursor.execute("""
                        INSERT OR REPLACE INTO asistencias (cedula_estudiantil, mes, semana, dia_semana, estado) 
                        VALUES (?, ?, ?, ?, ?)
                    """, (cedula, mes, semana, dia_limpio, estado))
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
        mes = str(parametros.get('mes') or 'Julio').strip()
        seccion_solicitada = str(parametros.get('seccion') or '').strip()

        conn = sqlite3.connect(self.db_path, timeout=20.0)
        conn.execute("PRAGMA journal_mode=WAL;")
        cursor = conn.cursor()
        try:
            # 1. Filtramos por sección si viene el parámetro, sino traemos todas las del nivel
            if seccion_solicitada:
                cursor.execute("""
                    SELECT salon_id, seccion 
                    FROM salones 
                    WHERE TRIM(grado) = ? 
                    AND TRIM(turno) = ? 
                    AND TRIM(seccion) = ?
                """, (grado, turno, seccion_solicitada))
            else:
                cursor.execute("""
                    SELECT salon_id, seccion 
                    FROM salones 
                    WHERE TRIM(grado) = ? 
                    AND TRIM(turno) = ?
                    ORDER BY seccion ASC
                """, (grado, turno))
            
            salones = cursor.fetchall()
            dias_semana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
            
            data_final = []
            alumnos_lista = []

            for salon_id, seccion in salones:
                dias_dict = {}
                
                # 2. Obtenemos lista de alumnos del salón (Necesario para el Excel)
                cursor.execute("""
                    SELECT cedula_estudiantil, est_nombre, est_apellido, est_genero, estado
                    FROM Estudiante
                    WHERE salon_id = ? 
                    AND (TRIM(LOWER(estado)) != 'retirado' OR estado IS NULL)
                    ORDER BY est_nombre ASC, est_apellido ASC
                """, (salon_id,))
                
                alumnos_seccion = cursor.fetchall()
                for alumno in alumnos_seccion:
                    cedula, nombre, apellido, genero, estado = alumno
                    nombre_completo = f"{nombre or ''} {apellido or ''}".strip()
                    
                    # Lo guardamos en la lista global de alumnos
                    alumnos_lista.append({
                        "id": cedula, 
                        "nombre": nombre_completo, 
                        "sexo": genero, 
                        "estado": estado, 
                        "seccion": seccion 
                    })

                # 3. Conteo de asistencias por día (CORREGIDA LA INDENTACIÓN)
                for dia in dias_semana:
                    dia_limpio = dia.strip()

                    cursor.execute("""
                        SELECT 
                            SUM(CASE WHEN (e.est_genero LIKE 'M%' OR e.est_genero LIKE 'm%' OR e.est_genero LIKE 'V%' OR e.est_genero LIKE 'v%' OR e.est_genero LIKE 'Niño%') AND a.estado LIKE '%Presente%' THEN 1 ELSE 0 END) as varones,
                            SUM(CASE WHEN (e.est_genero LIKE 'F%' OR e.est_genero LIKE 'f%' OR e.est_genero LIKE 'H%' OR e.est_genero LIKE 'h%' OR e.est_genero LIKE 'Niña%') AND a.estado LIKE '%Presente%' THEN 1 ELSE 0 END) as hembras
                        FROM Estudiante e
                        INNER JOIN asistencias a ON CAST(e.cedula_estudiantil AS TEXT) = CAST(a.cedula_estudiantil AS TEXT)
                        WHERE CAST(e.salon_id AS TEXT) = CAST(? AS TEXT) 
                        AND a.mes LIKE ?
                        AND a.semana LIKE ? 
                        AND (a.dia_semana LIKE ? OR a.dia_semana LIKE ?)
                        AND (e.estado NOT LIKE '%Retirado%' OR e.estado IS NULL)
                    """, (
                        salon_id, 
                        f"%{mes.strip()}%", 
                        f"%{semana.strip()}%", 
                        f"%{dia_limpio}%", 
                        f"%{dia_limpio.replace('é', 'e')}%"
                    ))
                    
                    row = cursor.fetchone()
                    
                    v = int(row[0] or 0) if row else 0
                    h = int(row[1] or 0) if row else 0
                    
                    dias_dict[dia] = {"v": v, "h": h, "total": v + h}

                # 4. Agregamos el resumen de esta sección a data_final (ESTO FALTABA)
                data_final.append({
                    "seccion": seccion,
                    "dias": dias_dict
                })

            # 5. Retornamos la respuesta enviando ambas variables (ESTO FALTABA)
            return {
                "status": "success", 
                "data": data_final, 
                "alumnos_lista": alumnos_lista
            }
            
        except Exception as e:
            print(f"❌ Error en resumen global por días: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            cursor.close()
            conn.close()