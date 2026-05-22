import webview
# 🔄 Corregido: Importamos 'AttendanceController' desde tu archivo 'attendance_cntrl'
from controllers.attendance_cntrl import AttendanceController

def iniciar_aplicacion():
    """
    Inicializa el entorno de escritorio de pywebview, configura la ventana
    e inyecta la API local para la comunicación bidireccional con React.
    """
    # 🛠️ Instanciamos la clase con el nombre correcto
    api_asistencia = AttendanceController()
    
    # Creamos la interfaz gráfica de escritorio
    window = webview.create_window(
        title="Registro Administrativo",
        url="http://localhost:5173",  # URL de tu servidor de desarrollo de Vite / React
        js_api=api_asistencia,         # Expone las funciones de asistencia en window.pywebview.api
        width=1200,
        height=700,
        resizable=True,
        min_size=(1024, 600)          # Evita que deformen la interfaz rompiendo el diseño de Tailwind
    )
    
    # Arrancamos el ciclo de vida de la aplicación
    webview.start(debug=True)

if __name__ == "__main__":
    iniciar_aplicacion()