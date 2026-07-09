import os
import sqlite3
import webview
from controllers.register_cntrl import AcademicController
from controllers.asis_det_cntrl import Asis_Det_Controller
from controllers.personal_cntrl import PersonalController
from controllers.inventario_cntrl import InventarioController

def inicializar_base_de_datos(db_path):
    """
    Verifica si la base de datos y sus directorios existen.
    Si no existen, crea la estructura de carpetas y ejecuta el esquema DDL completo
    requerido por todos los controladores del sistema.
    """
    # 1. Asegurar que el directorio de la base de datos exista
    db_dir = os.path.dirname(db_path)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        print(f"📁 Directorio creado: {db_dir}")

    # 2. Conectar y crear tablas solo si es necesario
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Habilitar estricto cumplimiento de claves foráneas
    conn.execute("PRAGMA foreign_keys = ON;")

    # 3. Esquema SQL consolidado para todo el sistema
    esquema_sql = """
    -- =========================================================
    -- MÓDULO ACADÉMICO Y ESTUDIANTIL (AcademicController / Asis_Det_Controller)
    -- =========================================================
    
    CREATE TABLE IF NOT EXISTS salones (
        salon_id INTEGER PRIMARY KEY AUTOINCREMENT,
        grado TEXT NOT NULL,          -- Ej: 'Maternal', '1er Nivel'
        turno TEXT NOT NULL,          -- Ej: 'Mañana', 'Tarde'
        seccion TEXT NOT NULL         -- Ej: 'A', 'B'
    );

    CREATE TABLE IF NOT EXISTS Estudiante (
        cedula_estudiantil INTEGER PRIMARY KEY,
        est_nombre TEXT NOT NULL,
        est_genero TEXT NOT NULL,     -- 'Masculino' o 'Femenino'
        salon_id INTEGER NOT NULL,
        FOREIGN KEY (salon_id) REFERENCES salones(salon_id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS asistencias (
        asistencia_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cedula_estudiantil INTEGER NOT NULL,
        mes TEXT NOT NULL,
        semana TEXT NOT NULL,
        dia_semana TEXT NOT NULL,
        estado TEXT NOT NULL,         -- 'Presente' o 'Ausente'
        FOREIGN KEY (cedula_estudiantil) REFERENCES Estudiante(cedula_estudiantil) ON DELETE CASCADE,
        UNIQUE(cedula_estudiantil, mes, semana, dia_semana)
    );

    -- =========================================================
    -- MÓDULO DE RECURSOS HUMANOS (PersonalController)
    -- =========================================================

    CREATE TABLE IF NOT EXISTS personal (
        cedula_trabajador INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        cargo TEXT NOT NULL,
        turno TEXT NOT NULL,
        horas_administrativas INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS asistencias_personal (
        asistencia_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cedula_trabajador INTEGER NOT NULL,
        mes TEXT NOT NULL,
        semana TEXT NOT NULL,
        dia_semana TEXT NOT NULL,
        estado TEXT NOT NULL,         -- 'Presente' o 'Ausente'
        FOREIGN KEY (cedula_trabajador) REFERENCES personal(cedula_trabajador) ON DELETE CASCADE,
        UNIQUE(cedula_trabajador, mes, semana, dia_semana)
    );

    --- MODULO DE INVENTARIO

    CREATE TABLE IF NOT EXISTS inventario_mobiliario (
        mobiliario_id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        cantidad INTEGER NOT NULL CHECK(cantidad >= 0),
        activo TEXT NOT NULL DEFAULT 'En uso',
        comentario TEXT
    );

    """
    
    try:
        cursor.executescript(esquema_sql)
        conn.commit()
        print("✅ Estructura de base de datos verificada/creada exitosamente.")
    except Exception as e:
        print(f"❌ Error crítico al inicializar la base de datos: {e}")
    finally:
        conn.close()


class SistemaAPI:
    def __init__(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.db_path = os.path.join(base_dir, "database", "data", "Control_Estudiantil.db")
        
        # 🚀 AUTO-INIT: Ejecutar la verificación antes de instanciar los controladores
        inicializar_base_de_datos(self.db_path)
        
        self.controlador_academico = AcademicController(self.db_path)
        self.controlador_asistencia = Asis_Det_Controller(self.db_path)
        self.controlador_personal = PersonalController(self.db_path)
        self.controlador_inventario = InventarioController(self.db_path)

    # =========================================================
    # PUENTES ACADÉMICOS Y ESTUDIANTILES
    # =========================================================
    def registrar_estudiante_completo(self, data):
        return self.controlador_academico.registrar_estudiante_completo(data)

    def cargar_matriz_asistencia(self, parametros):
        return self.controlador_asistencia.cargar_matriz_asistencia(parametros)

    def guardar_asistencias(self, data):
        return self.controlador_asistencia.guardar_asistencias(data)

    def obtener_resumen_global(self, parametros):
        return self.controlador_asistencia.obtener_resumen_global(parametros)
    
    # =========================================================
    # PUENTES PARA EL PERSONAL
    # =========================================================
    def registrar_trabajador(self, data):
        """Permite guardar un nuevo empleado desde el formulario en React"""
        return self.controlador_personal.registrar_trabajador(data)

    def cargar_matriz_asistencia_personal(self, parametros):
        """Carga la lista de empleados en la interfaz de asistencia"""
        return self.controlador_personal.cargar_matriz_asistencia_personal(parametros)

    def guardar_asistencias_personal(self, data):
        """Guarda el pase de lista del personal ejecutado en React"""
        return self.controlador_personal.guardar_asistencias_personal(data)
    
    # PUENTE PARA EL INVENTARIO
    
    def cargar_inventario(self):
        """Devuelve la lista completa de bienes registrados en SQLite"""
        return self.controlador_inventario.cargar_inventario()

    def guardar_inventario_masivo(self, lista_bienes):
        """Inserta o actualiza lotes de mobiliario en SQLite"""
        return self.controlador_inventario.guardar_inventario_masivo(lista_bienes)

    def eliminar_articulo_inventario(self, id_articulo):
        """Elimina un bien de manera permanente por su ID"""
        return self.controlador_inventario.eliminar_articulo(id_articulo)


def iniciar_aplicacion():
    api_global = SistemaAPI()
    window = webview.create_window(
        title="Registro Administrativo - Simoncito",
        url="http://localhost:5173",
        js_api=api_global,
        width=1200, height=700, resizable=True, min_size=(1024, 600)
    )
    webview.start(debug=True)

if __name__ == "__main__":
    iniciar_aplicacion()