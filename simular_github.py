"""Simulador de GitHub Pages para probar la web como se vera publicada.

  python simular_github.py [puerto]

Diferencias con un servidor normal, copiadas del comportamiento real:
  - "/" sirve index.html
  - una URL sin extension que no existe devuelve 404.html con status 404
    (igual que GitHub Pages), en vez del listado de carpetas
  - "/assets/css" sin archivo final devuelve 404, no un directorio
  - respeta mayusculas/minusculas EXACTAS: es Linux, no Windows
"""
import http.server
import os
import socketserver
import sys
import posixpath
import urllib.parse

RAIZ = os.path.dirname(os.path.abspath(__file__))
PUERTO = int(sys.argv[1]) if len(sys.argv) > 1 else 8951


class Simulador(http.server.BaseHTTPRequestHandler):
    server_version = "GitHubPages-Sim"

    def resolver(self):
        ruta = urllib.parse.urlparse(self.path).path
        ruta = urllib.parse.unquote(ruta)
        # GitHub normaliza y no resuelve .. ni backslashes
        ruta = posixpath.normpath(ruta)
        if ruta.startswith(".."):
            return None
        if ruta == "/":
            ruta = "/index.html"
        completo = os.path.join(RAIZ, ruta.lstrip("/"))
        # case-sensitive, como en Linux
        if not os.path.isfile(completo):
            return None
        return completo

    def content_type(self, path):
        ext = os.path.splitext(path)[1].lower()
        return {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "text/javascript; charset=utf-8",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".svg": "image/svg+xml",
            ".mp3": "audio/mpeg",
            ".txt": "text/plain; charset=utf-8",
            ".xml": "application/xml; charset=utf-8",
            ".md": "text/markdown; charset=utf-8",
        }.get(ext, "application/octet-stream")

    def servir(self, path, status):
        data = open(path, "rb").read()
        self.send_response(status)
        self.send_header("Content-Type", self.content_type(path))
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "max-age=600")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)

    def do_GET(self):
        path = self.resolver()
        if path:
            self.servir(path, 200)
            return
        # 404 real de GitHub Pages
        ruta404 = os.path.join(RAIZ, "404.html")
        if os.path.isfile(ruta404):
            self.servir(ruta404, 404)
        else:
            self.send_error(404)

    do_HEAD = do_GET

    def log_message(self, *a):
        pass


class Servidor(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    with Servidor(("127.0.0.1", PUERTO), Simulador) as httpd:
        print(f"  Simulando GitHub Pages desde {RAIZ}")
        print(f"  http://127.0.0.1:{PUERTO}/")
        print("  Ctrl+C para cortar")
        httpd.serve_forever()
