import os
import webview
from controllers.register_cntrl import AcademicController
from controllers.asis_det_cntrl import Asis_Det_Controller
from controllers.personal_cntrl import PersonalController

class SistemaAPI:
    def __init__(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.db_path = os.path.join(base_dir, "database", "data", "Control_Estudiantil.db")
        
        self.controlador_academico = AcademicController(self.db_path)
        self.controlador_asistencia = Asis_Det_Controller(self.db_path)
        self.controlador_personal = PersonalController(self.db_path)

    def registrar_estudiante_completo(self, data):
        return self.controlador_academico.registrar_estudiante_completo(data)

    # NUEVOS PUENTES PARA ASISTENCIA
    def cargar_matriz_asistencia(self, parametros):
        return self.controlador_asistencia.cargar_matriz_asistencia(parametros)

    def guardar_asistencias(self, data):
        return self.controlador_asistencia.guardar_asistencias(data)

    def obtener_resumen_global(self, parametros):
        return self.controlador_asistencia.obtener_resumen_global(parametros)
    
    #Puente para las asistencia de los trabajadores

    def registrar_trabajador(self, data):
        """Permite guardar un nuevo empleado desde el formulario en React"""
        return self.controlador_personal.registrar_trabajador(data)

    def cargar_matriz_asistencia_personal(self, parametros):
        """Carga la lista de empleados en la interfaz de asistencia"""
        return self.controlador_personal.cargar_matriz_asistencia_personal(parametros)

    def guardar_asistencias_personal(self, data):
        """Guarda el pase de lista del personal ejecutado en React"""
        return self.controlador_personal.guardar_asistencias_personal(data)

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