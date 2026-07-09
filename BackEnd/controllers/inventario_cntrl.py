import sqlite3

class InventarioController:
    def __init__(self, db_path):
        self.db_path = db_path

    def cargar_inventario(self):
        """Recupera todos los bienes usando las columnas exactas de la tabla."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        try:
            # Consultamos las columnas exactas visibles en tu captura de pantalla
            cursor.execute("""
                SELECT mobiliario_id, nombre, cantidad, activo, comentarios
                FROM inventario_mobiliario
                ORDER BY mobiliario_id DESC
            """)
            
            filas = cursor.fetchall()
            resultados = []

            for fila in filas:
                # Mapeamos 'activo' a un booleano para el checkbox de React
                estado_texto = str(fila[3] or "").strip().lower()
                esta_en_uso = (estado_texto in ["en uso", "1", "true", "activo"])

                resultados.append({
                    "id": fila[0],          # mobiliario_id
                    "nombre": fila[1],      # nombre
                    "cantidad": fila[2],    # cantidad
                    "enUso": esta_en_uso,   # activo (mapeado a bool)
                    "observaciones": fila[4] if fila[4] else ""  # comentarios
                })

            return {"status": "success", "data": resultados}
        except Exception as e:
            print(f"❌ Error al cargar inventario: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            conn.close()

    def guardar_inventario_masivo(self, lista_articulos):
        """Inserta nuevos registros o actualiza los existentes respetando tu esquema."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        try:
            for item in lista_articulos:
                item_id = item.get('id')
                nombre = item.get('nombre', '').strip()
                cantidad = int(item.get('cantidad', 0))
                # Guardamos como texto 'En uso' o 'En desuso' tal como se ve en tu DB
                estado_uso = "En uso" if item.get('enUso', True) else "En desuso"
                comentarios = item.get('observaciones', '').strip()

                # Si el ID es muy grande (generado por Date.now() en React), asumimos que es NUEVO
                if item_id and item_id < 1000000000:
                    cursor.execute("""
                        UPDATE inventario_mobiliario 
                        SET nombre = ?, cantidad = ?, activo = ?, comentarios = ?
                        WHERE mobiliario_id = ?
                    """, (nombre, cantidad, estado_uso, comentarios, item_id))
                else:
                    cursor.execute("""
                        INSERT INTO inventario_mobiliario (nombre, cantidad, activo, comentarios)
                        VALUES (?, ?, ?, ?)
                    """, (nombre, cantidad, estado_uso, comentarios))

            conn.commit()
            return {"status": "success", "message": "Base de datos sincronizada exitosamente."}
        except Exception as e:
            conn.rollback()
            print(f"❌ Error al guardar inventario: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            conn.close()

    def eliminar_articulo(self, id_articulo):
        """Elimina un bien usando el identificador exacto de tu tabla."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM inventario_mobiliario WHERE mobiliario_id = ?", (int(id_articulo),))
            conn.commit()
            return {"status": "success", "message": "Artículo eliminado de la base de datos."}
        except Exception as e:
            conn.rollback()
            print(f"❌ Error al eliminar artículo: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            conn.close()