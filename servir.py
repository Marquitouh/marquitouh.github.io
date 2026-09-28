"""Servidor estatico para previsualizar la web.
Uso:  python servir.py [puerto]

A diferencia de "python -m http.server", este:
  - es multi-hilo (varias peticiones a la vez, no se bloquea)
  - fuerza UTF-8 en los .html
  - no cachea (ideal mientras se edita: se_ctrl+F5 no hace falta)
"""
import http.server
import os
import socketserver
import sys
import threading
import webbrowser

RAIZ = os.path.dirname(os.path.abspath(__file__))
PUERTO = int(sys.argv[1]) if len(sys.argv) > 1 else 8899


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=RAIZ, **kw)

    def end_headers(self):
        # sin cache: asi los cambios de css/js se ven al recargar
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        if self.path.endswith(".html"):
            self.send_header("Content-Type", "text/html; charset=utf-8")
        super().end_headers()

    def log_message(self, *a):
        pass  # silencio


class Servidor(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    with Servidor(("127.0.0.1", PUERTO), Handler) as httpd:
        print(f"  Sirviendo  {RAIZ}")
        print(f"  http://127.0.0.1:{PUERTO}/")
        print("  Ctrl+C para cortar")
        httpd.serve_forever()
