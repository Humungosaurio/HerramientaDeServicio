import os
import webview
from controllers.register_cntrl import AcademicController

class SistemaAPI:
    def __init__(self):
        #Detecta la ubicación de main.py (Carpeta BackEnd/)
        base_dir = os.path.dirname(os.path.abspath(__file__))
        
        #CORRECCIÓN: Entramos a 'data' y usamos el nombre exacto en minúsculas
        self.db_path = os.path.join(base_dir,"database", "data", "Control_Estudiantil.db")
        
        self.controlador_academico = AcademicController(self.db_path)

    def registrar_estudiante_completo(self, data):
        return self.controlador_academico.registrar_estudiante_completo(data)


def iniciar_aplicacion():
    api_global = SistemaAPI()
    
    window = webview.create_window(
        title="Registro Administrativo - Simoncito",
        url="http://localhost:5173",
        js_api=api_global,
        width=1200,
        height=700,
        resizable=True,
        min_size=(1024, 600)
    )
    
    webview.start(debug=True)


if __name__ == "__main__":
    iniciar_aplicacion()