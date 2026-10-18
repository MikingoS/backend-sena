import os
import subprocess
import webbrowser
import time
import json
import platform

def verificar_db():
    if not os.path.exists("db.json"):
        print("Creando archivo de base de datos inicial (db.json)...")
        datos_iniciales = {
            "inventario": [
                {"id": "0001", "nombre": "Carne", "stock": 3},
                {"id": "0002", "nombre": "Arroz", "stock": 5},
                {"id": "0003", "nombre": "Lenteja", "stock": 3},
                {"id": "0004", "nombre": "Frijol", "stock": 1},
                {"id": "0005", "nombre": "Harina", "stock": 2},
                {"id": "0006", "nombre": "Leche", "stock": 4},
                {"id": "0007", "nombre": "Azúcar", "stock": 1}
            ],
            "usuarios": [
                {"id": "U001", "nombre": "Juan H", "rol": "Administrador", "estado": "Activo"},
                {"id": "U002", "nombre": "Santiago A", "rol": "Vendedor", "estado": "Inactivo"},
                {"id": "U003", "nombre": "Camila S", "rol": "Vendedor", "estado": "Activo"}
            ],
            "movimientos": [
                {"id": 1, "fecha": "2026-07-11 10:45", "tipo": "Salida", "producto": "Arroz", "sku": "#0002", "cantidad": 2}
            ]
        }
        with open("db.json", "w", encoding="utf-8") as f:
            json.dump(datos_iniciales, f, indent=4, ensure_ascii=False)

def abrir_postman():
    print("[2/4] Abriendo Postman...")
    sistema = platform.system()
    try:
        if sistema == "Windows":
            ruta_postman = os.path.expandvars(r"%LOCALAPPDATA%\Postman\Postman.exe")
            if os.path.exists(ruta_postman):
                subprocess.Popen([ruta_postman])
            else:
                os.system("start postman")
        elif sistema == "Darwin": # macOS
            subprocess.Popen(["open", "-a", "Postman"])
        else: # Linux
            subprocess.Popen(["postman"])
    except Exception as e:
        print(f"No se pudo abrir Postman automáticamente: {e}. Por favor, ábrelo manualmente.")

def main():
    print("==========================================")
    print("   INICIANDO SISTEMA INTEGRADO STOCKFLOW")
    print("==========================================")
    
    # 1. Asegurar db.json
    verificar_db()

    # 2. Iniciar el servidor de la API en segundo plano (Forzando el intérprete de comandos de Windows para npx)
    print("[1/4] Levantando la API local con json-server...")
    try:
        if platform.system() == "Windows":
            api_process = subprocess.Popen(["cmd.exe", "/c", "npx", "json-server", "--watch", "db.json", "--port", "3000"])
        else:
            api_process = subprocess.Popen(["npx", "json-server", "--watch", "db.json", "--port", "3000"])
    except Exception as e:
        print(f"Error al iniciar la API: {e}")
        return

    time.sleep(3)

    # 3. Abrir Postman automáticamente
    abrir_postman()

    # 4. Abrir la página web en el navegador
    print("[3/4] Abriendo la interfaz web (index.html)...")
    index_path = os.path.abspath("index.html")
    
    if os.path.exists(index_path):
        webbrowser.open(f"file:///{index_path}")
    else:
        print("¡Advertencia! No se encontró el archivo index.html en esta carpeta.")

    print("[4/4] ¡Todo listo!")
    print("------------------------------------------")
    print("-> La API está corriendo en: http://localhost:3000")
    print("-> Postman se ha abierto para tus evidencias.")
    print("-> Presiona CTRL + C en esta terminal cuando termines para apagar todo.")
    print("------------------------------------------")

    try:
        # Mantiene la ejecución abierta de forma indefinida hasta que presiones Ctrl + C
        api_process.wait()
    except KeyboardInterrupt:
        print("\nApagando servidores y cerrando sistema...")
        api_process.terminate()

if __name__ == "__main__":
    main()