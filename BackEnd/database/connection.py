import sqlite3
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(base_dir, 'data',"Control_Estudiantil.db")

def get_db_connection():
    """
    Establece y configura la conexión con la base de datos SQLite3.
    Activa las llaves foráneas y el mapeo de filas a diccionarios.
    """
    try:
        conn = sqlite3.connect(db_path)
        
        # ⚡ Permite acceder a las columnas por su nombre como un diccionario: row["grado"]
        conn.row_factory = sqlite3.Row
        
        # ⚠️ REGLA DE ORO: SQLite exige activar el soporte de llaves foráneas por cada conexión
        conn.execute("PRAGMA foreign_keys = ON;")
        
        return conn
        
    except sqlite3.Error as e:
        print(f"❌ Error crítico al conectar con SQLite: {str(e)}")
        return None