import os
import sqlite3
import webview
from controllers.register_cntrl import AcademicController
from controllers.asis_det_cntrl import Asis_Det_Controller
from controllers.personal_cntrl import PersonalController
from controllers.inventario_cntrl import InventarioController
from controllers.excels.reporte_cntrl import ReporteController
from controllers.excels.reporte_ini_cntrl import ReporteIniController
from controllers.excels.mobiliaria_cntrl import MobiliariaController
from controllers.excels.asistencia_cntrl import AsistenciasController

def inicializar_base_de_datos(db_path):
    db_dir = os.path.dirname(db_path)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        print(f"📁 Directorio creado: {db_dir}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    conn.execute("PRAGMA foreign_keys = ON;")

    esquema_sql = """
    CREATE TABLE IF NOT EXISTS salones (
        salon_id INTEGER PRIMARY KEY AUTOINCREMENT,
        grado TEXT NOT NULL,
        turno TEXT NOT NULL,
        seccion TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS representante (
        representante_ci INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        direccion TEXT,
        fecha_nacimiento TEXT,
        grado_educacion TEXT,
        trabaja INTEGER,
        direccion_trabajo TEXT,
        parentesco TEXT,
        lugar_nacimiento TEXT,
        telefono TEXT,
        correo TEXT
    );

    CREATE TABLE IF NOT EXISTS rep_responsable (
        re_inst_ci INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        direccion TEXT,
        fecha_nacimiento TEXT,
        grado_educacion TEXT,
        trabaja INTEGER,
        direccion_trabajo TEXT,
        parentesco TEXT,
        lugar_nacimiento TEXT,
        telefono TEXT,
        correo TEXT
    );

    CREATE TABLE IF NOT EXISTS Estudiante (
        cedula_estudiantil INTEGER PRIMARY KEY,
        est_nombre TEXT NOT NULL,
        est_direccion TEXT,
        est_genero TEXT NOT NULL,
        neurodiversidad TEXT,
        est_fecha_nacimiento TEXT,
        re_inst_ci INTEGER,
        representante_ci INTEGER,
        salon_id INTEGER NOT NULL,
        tipo_sangre TEXT,
        talla_mono TEXT,
        talla_camisa TEXT,
        talla_calzado TEXT,
        FOREIGN KEY (salon_id) REFERENCES salones(salon_id) ON DELETE RESTRICT,
        FOREIGN KEY (representante_ci) REFERENCES representante(representante_ci) ON DELETE SET NULL,
        FOREIGN KEY (re_inst_ci) REFERENCES rep_responsable(re_inst_ci) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS asistencias (
        asistencia_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cedula_estudiantil INTEGER NOT NULL,
        mes TEXT NOT NULL,
        semana TEXT NOT NULL,
        dia_semana TEXT NOT NULL,
        estado TEXT NOT NULL,
        UNIQUE(cedula_estudiantil, mes, semana, dia_semana),
        FOREIGN KEY (cedula_estudiantil) REFERENCES Estudiante(cedula_estudiantil) ON DELETE CASCADE
    );

        CREATE TABLE IF NOT EXISTS personal (
        cedula_trabajador INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        cargo TEXT NOT NULL,
        turno TEXT,
        horas_administrativas INTEGER
    );

    CREATE TABLE IF NOT EXISTS asistencias_personal (
        asistencia_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cedula_trabajador INTEGER NOT NULL,
        mes TEXT NOT NULL,
        semana TEXT NOT NULL,
        dia_semana TEXT NOT NULL,
        estado TEXT NOT NULL,
        FOREIGN KEY (cedula_trabajador) REFERENCES personal(cedula_trabajador) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS inventario_mobiliario (
        mobiliario_id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        codigo_bien TEXT UNIQUE,
        cantidad INTEGER DEFAULT 0,
        activo TEXT,
        comentarios TEXT
    );
    """

    try:
        cursor.executescript(esquema_sql)
        cursor.execute("SELECT COUNT(*) FROM salones")
        if cursor.fetchone()[0] == 0:
            print("🏫 Tabla 'salones' vacía. Precargando la configuración institucional...")
            salones_iniciales = [
                ('Maternal', 'Mañana', 'A'), ('Maternal', 'Tarde', 'B'),
                ('1er Nivel', 'Mañana', 'A'), ('1er Nivel', 'Mañana', 'B'),
                ('1er Nivel', 'Tarde', 'C'), ('1er Nivel', 'Tarde', 'D'),
                ('2do Nivel', 'Mañana', 'A'), ('2do Nivel', 'Mañana', 'B'),
                ('2do Nivel', 'Tarde', 'C'), ('2do Nivel', 'Tarde', 'D'),
                ('3er Nivel', 'Mañana', 'A'), ('3er Nivel', 'Tarde', 'B'), ('3er Nivel', 'Tarde', 'C')
            ]
            cursor.executemany(
                "INSERT INTO salones (grado, turno, seccion) VALUES (?, ?, ?)", 
                salones_iniciales
            )
            print(f"✅ Se han registrado {len(salones_iniciales)} aulas correctamente.")

        conn.commit()
        print("✅ Estructura de base de datos verificada y sincronizada con los controladores.")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error al inicializar las tablas en main.py: {e}")
    finally:
        conn.close()


class SistemaAPI:
    def __init__(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.db_path = os.path.join(base_dir, "database", "data", "Control_Estudiantil.db")
        
        inicializar_base_de_datos(self.db_path)
        
        self.controlador_academico = AcademicController(self.db_path)
        self.controlador_asistencia = Asis_Det_Controller(self.db_path)
        self.controlador_personal = PersonalController(self.db_path)
        self.controlador_inventario = InventarioController(self.db_path)
        self.controlador_reporte_ini = ReporteIniController()
        self.controlador_mobiliaria = MobiliariaController()
        self.controlador_reporte = ReporteController()
        
        # LÍNEA CORREGIDA: Se instancia AsistenciasController en lugar de Asis_Det_Controller
        self.controlador_asistencias_excel = AsistenciasController(self.db_path)

    # =========================================================
    # PUENTES ACADÉMICOS Y ESTUDIANTILES
    # =========================================================
    def registrar_estudiante_completo(self, data):
        return self.controlador_academico.registrar_estudiante_completo(data)

    def obtener_estudiantes(self):
        return self.controlador_academico.obtener_estudiantes()

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
        return self.controlador_personal.registrar_trabajador(data)

    def cargar_matriz_asistencia_personal(self, parametros):
        return self.controlador_personal.cargar_matriz_asistencia_personal(parametros)

    def guardar_asistencias_personal(self, data):
        return self.controlador_personal.guardar_asistencias_personal(data)
    
    # =========================================================
    # PUENTES PARA EL INVENTARIO
    # =========================================================
    def cargar_inventario(self):
        return self.controlador_inventario.cargar_inventario()

    def guardar_inventario_masivo(self, lista_bienes):
        return self.controlador_inventario.guardar_inventario_masivo(lista_bienes)

    def eliminar_articulo(self, id_articulo):
        return self.controlador_inventario.eliminar_articulo(id_articulo)
    
    # =========================================================
    # PUENTE PARA EXCEL / REPORTES
    # =========================================================
    def generar_excel_desde_plantilla(self, datos_estudiantes, nombre_archivo):
        return self.controlador_reporte.generar_excel_desde_plantilla(datos_estudiantes, nombre_archivo)
    
    def generar_excel_inicial_desde_plantilla(self, datos_estudiantes, nombre_archivo):
        return self.controlador_reporte_ini.generar_excel_desde_plantilla(datos_estudiantes, nombre_archivo)
    
    def generar_excel_mobiliaria(self, datos_mobiliario, nombre_archivo):
        return self.controlador_mobiliaria.generar_excel_desde_plantilla(datos_mobiliario, nombre_archivo)
    
    def generar_excel_asistencias(self, params):
        return self.controlador_asistencias_excel.generar_excel_asistencias(params)

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