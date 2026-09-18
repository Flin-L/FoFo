import http.server
import socketserver
import os
import json
import webbrowser
import threading
import sys
from urllib.parse import parse_qs, urlparse

PORT = 3210
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
EXPORT_DIR = os.path.join(BASE_DIR, "exports")
DOCS_DIR = os.path.join(BASE_DIR, "documents")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(EXPORT_DIR, exist_ok=True)
os.makedirs(DOCS_DIR, exist_ok=True)

class FoFoHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/data":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            data_file = os.path.join(DATA_DIR, "workspace.json")
            if os.path.exists(data_file):
                with open(data_file, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.wfile.write(b"{}")
            return

        if parsed.path == "/api/reading":
            params = parse_qs(parsed.query)
            date_str = params.get("date", [""])[0]
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            
            if date_str:
                safe_date = os.path.basename(date_str)
                file_path = os.path.join(DOCS_DIR, f"reading_{safe_date}.json")
                if os.path.exists(file_path):
                    with open(file_path, "rb") as f:
                        self.wfile.write(f.read())
                        return
            self.wfile.write(b"[]")
            return
        
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        if parsed.path == "/api/data":
            data_file = os.path.join(DATA_DIR, "workspace.json")
            with open(data_file, "wb") as f:
                f.write(body)
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "saved", "path": data_file}).encode("utf-8"))
            return

        if parsed.path == "/api/reading":
            payload = json.loads(body.decode("utf-8"))
            date_str = payload.get("date", "")
            items = payload.get("items", [])
            safe_date = os.path.basename(date_str)
            target_path = os.path.join(DOCS_DIR, f"reading_{safe_date}.json")
            with open(target_path, "w", encoding="utf-8") as f:
                json.dump(items, f, ensure_ascii=False, indent=2)

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "saved", "path": target_path}).encode("utf-8"))
            return

        if parsed.path == "/api/open":
            payload = json.loads(body.decode("utf-8"))
            item_type = payload.get("type", "file")
            target = payload.get("path", "").strip()

            success = False
            message = ""

            try:
                if item_type == "url":
                    # Add protocol if missing
                    url = target
                    if not (url.startswith("http://") or url.startswith("https://")):
                        url = "https://" + url
                    webbrowser.open(url)
                    success = True
                    message = f"已打开网页: {url}"
                else:
                    norm_path = os.path.normpath(target)
                    if os.path.exists(norm_path):
                        os.startfile(norm_path)
                        success = True
                        message = f"已打开本地文件: {norm_path}"
                    else:
                        success = False
                        message = f"文件未找到: {norm_path}"
            except Exception as e:
                success = False
                message = f"打开失败: {str(e)}"

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok" if success else "error", "message": message}).encode("utf-8"))
            return

        if parsed.path == "/api/export":
            payload = json.loads(body.decode("utf-8"))
            filename = payload.get("filename", "export.md")
            content = payload.get("content", "")
            
            safe_name = os.path.basename(filename)
            target_path = os.path.join(EXPORT_DIR, safe_name)
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(content)

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "exported", "filepath": target_path}).encode("utf-8"))
            return

        self.send_error(404, "Not Found")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

def run_server():
    port = PORT
    for attempt in range(10):
        try:
            with socketserver.TCPServer(("", port), FoFoHandler) as httpd:
                print(f"[FoFo Personal WorkStation] 服务已启动: http://localhost:{port}")
                print(f"[存储目录] 数据自动保存在: {DATA_DIR}")
                print(f"[待阅目录] 待阅文档保存在: {DOCS_DIR}")
                print(f"[导出目录] Markdown 导出在: {EXPORT_DIR}")
                threading.Timer(0.8, lambda: webbrowser.open(f"http://localhost:{port}")).start()
                httpd.serve_forever()
                break
        except OSError:
            port += 1

if __name__ == "__main__":
    run_server()
