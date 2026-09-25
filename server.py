import http.server
import socketserver
import os
import json
import webbrowser
import threading
import sys
import re
import time
import urllib.error
import urllib.request
from urllib.parse import parse_qs, urlparse, unquote

APP_VERSION = "2.3.1"
_UPDATE_CACHE = {
    "timestamp": 0,
    "data": None
}

def parse_semver_tuple(v):
    if not v:
        return (0, 0, 0)
    cleaned = str(v).strip().lstrip("vV")
    parts = []
    for seg in cleaned.split("."):
        m = re.match(r"^\d+", seg)
        parts.append(int(m.group()) if m else 0)
    while len(parts) < 3:
        parts.append(0)
    return tuple(parts[:3])

def fetch_latest_release(force=False):
    global _UPDATE_CACHE
    now = time.time()
    if not force and _UPDATE_CACHE["data"] and (now - _UPDATE_CACHE["timestamp"] < 3600):
        return _UPDATE_CACHE["data"]

    headers = {
        "User-Agent": f"FoFo-App/{APP_VERSION}",
        "Accept": "application/vnd.github.v3+json"
    }

    release_data = None
    # 1. Primary: Query GitHub API
    try:
        req = urllib.request.Request("https://api.github.com/repos/Flin-L/FoFo/releases/latest", headers=headers)
        with urllib.request.urlopen(req, timeout=4) as resp:
            if resp.status == 200:
                release_data = json.loads(resp.read().decode("utf-8"))
    except Exception:
        pass

    # 2. Fallback: Query jsdelivr CDN for raw version.json
    if not release_data:
        try:
            cdn_url = "https://fastly.jsdelivr.net/gh/Flin-L/FoFo@main/version.json"
            req2 = urllib.request.Request(cdn_url, headers=headers)
            with urllib.request.urlopen(req2, timeout=4) as resp2:
                if resp2.status == 200:
                    vjson = json.loads(resp2.read().decode("utf-8"))
                    release_data = {
                        "tag_name": vjson.get("latestVersion", ""),
                        "name": vjson.get("title", ""),
                        "body": vjson.get("releaseNotes", ""),
                        "html_url": vjson.get("releaseUrl", "https://github.com/Flin-L/FoFo/releases/latest"),
                        "published_at": vjson.get("releaseDate", ""),
                        "assets": [
                            {"name": "FoFo.exe", "browser_download_url": vjson.get("downloadUrl", "")}
                        ]
                    }
        except Exception:
            pass

    if not release_data:
        res = {
            "status": "error",
            "checked": False,
            "hasUpdate": False,
            "currentVersion": APP_VERSION,
            "latestVersion": APP_VERSION,
            "message": "暂未能连接至更新服务，请检查网络后重试"
        }
        return res

    tag = release_data.get("tag_name", "").strip()
    remote_ver = tag.lstrip("vV")
    has_update = parse_semver_tuple(remote_ver) > parse_semver_tuple(APP_VERSION)

    download_url = release_data.get("html_url", "https://github.com/Flin-L/FoFo/releases/latest")
    for asset in release_data.get("assets", []):
        if asset.get("name", "").lower().endswith(".exe"):
            download_url = asset.get("browser_download_url", download_url)
            break

    res = {
        "status": "ok",
        "checked": True,
        "hasUpdate": has_update,
        "currentVersion": APP_VERSION,
        "latestVersion": remote_ver if remote_ver else APP_VERSION,
        "tag": tag if tag.startswith("v") else (f"v{tag}" if tag else f"v{APP_VERSION}"),
        "title": release_data.get("name") or f"FoFo {tag}",
        "notes": release_data.get("body", ""),
        "releaseUrl": release_data.get("html_url", "https://github.com/Flin-L/FoFo/releases/latest"),
        "downloadUrl": download_url,
        "publishedAt": release_data.get("published_at", "")
    }

    _UPDATE_CACHE["timestamp"] = now
    _UPDATE_CACHE["data"] = res
    return res

# PyInstaller noconsole support: redirect stdout and stderr to avoid NoneType.write crashes
if sys.stdout is None:
    sys.stdout = open(os.devnull, "w", encoding="utf-8")
if sys.stderr is None:
    sys.stderr = open(os.devnull, "w", encoding="utf-8")

PORT = 3210
BASE_DIR = os.path.dirname(sys.executable) if getattr(sys, "frozen", False) else os.path.dirname(os.path.abspath(__file__))
# Prioritize local assets if running in a workspace containing index.html, else fallback to bundled MEIPASS
if os.path.exists(os.path.join(BASE_DIR, "index.html")):
    RESOURCE_DIR = BASE_DIR
else:
    RESOURCE_DIR = getattr(sys, "_MEIPASS", BASE_DIR)
DATA_DIR = os.path.join(BASE_DIR, "data")
EXPORT_DIR = os.path.join(BASE_DIR, "exports")
DOCS_DIR = os.path.join(BASE_DIR, "documents")
AI_SESSION_DIR = os.path.join(BASE_DIR, ".FoFoAI")
AI_SESSION_FILE = os.path.join(AI_SESSION_DIR, "sessions.json")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(EXPORT_DIR, exist_ok=True)
os.makedirs(DOCS_DIR, exist_ok=True)
os.makedirs(AI_SESSION_DIR, exist_ok=True)


class FoFoHandler(http.server.SimpleHTTPRequestHandler):
    server_instance = None
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=RESOURCE_DIR, **kwargs)

    def log_message(self, format, *args):
        # Override to safely handle logging without crashing when sys.stderr is unavailable
        try:
            if sys.stderr:
                sys.stderr.write("%s - - [%s] %s\n" %
                                 (self.address_string(),
                                  self.log_date_time_string(),
                                  format % args))
        except Exception:
            pass

    def send_bytes_response(self, content_bytes, content_type="application/json; charset=utf-8", status=200, extra_headers=None):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        if extra_headers:
            for k, v in extra_headers.items():
                self.send_header(k, v)
        self.end_headers()
        self.wfile.write(content_bytes)

    def send_json_response(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_bytes_response(body, "application/json; charset=utf-8", status)

    def end_headers(self):
        parsed = urlparse(self.path)
        if parsed.path.endswith((".html", ".js")) or parsed.path in {"", "/"}:
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/ping":
            self.send_json_response({
                "status": "ok",
                "app": "FoFo",
                "version": APP_VERSION,
                "dir": os.path.abspath(BASE_DIR)
            })
            return

        if parsed.path == "/api/check_update":
            query_params = parse_qs(parsed.query)
            force = query_params.get("force", ["0"])[0] in ("1", "true", "True")
            update_info = fetch_latest_release(force=force)
            self.send_json_response(update_info)
            return

        if parsed.path == "/api/ai/sessions":
            default_session = {
                "id": "chat-default",
                "title": "新会话",
                "createdAt": "",
                "updatedAt": "",
                "messages": []
            }
            payload = {"currentId": default_session["id"], "sessions": [default_session], "persisted": False}
            if os.path.exists(AI_SESSION_FILE):
                try:
                    with open(AI_SESSION_FILE, "r", encoding="utf-8") as f:
                        saved = json.load(f)
                    if isinstance(saved, dict) and isinstance(saved.get("sessions"), list) and saved["sessions"]:
                        payload = {
                            "currentId": saved.get("currentId") or saved["sessions"][0].get("id"),
                            "sessions": saved["sessions"],
                            "persisted": True
                        }
                except (OSError, ValueError, TypeError):
                    pass
            self.send_json_response(payload)
            return

        if parsed.path == "/api/data":
            data_file = os.path.join(DATA_DIR, "workspace.json")
            if os.path.exists(data_file):
                with open(data_file, "rb") as f:
                    content = f.read()
                self.send_bytes_response(content, "application/json; charset=utf-8")
            else:
                self.send_bytes_response(b"{}", "application/json; charset=utf-8")
            return

        if parsed.path == "/api/reading":
            params = parse_qs(parsed.query)
            date_str = params.get("date", [""])[0]
            if date_str:
                safe_date = os.path.basename(date_str)
                file_path = os.path.join(DOCS_DIR, f"reading_{safe_date}.json")
                if os.path.exists(file_path):
                    with open(file_path, "rb") as f:
                        content = f.read()
                    self.send_bytes_response(content, "application/json; charset=utf-8")
                    return
            self.send_bytes_response(b"[]", "application/json; charset=utf-8")
            return
        
        if parsed.path.startswith("/osimg/"):
            rel_path = unquote(parsed.path.lstrip("/")).replace("/", os.sep)
            target = os.path.join(BASE_DIR, rel_path)
            if not os.path.exists(target):
                target = os.path.join(RESOURCE_DIR, rel_path)
            if os.path.exists(target) and os.path.isfile(target):
                ext = os.path.splitext(target)[1].lower()
                content_type = {
                    ".png": "image/png",
                    ".jpg": "image/jpeg",
                    ".jpeg": "image/jpeg",
                    ".webp": "image/webp"
                }.get(ext, "application/octet-stream")
                with open(target, "rb") as f:
                    content = f.read()
                self.send_bytes_response(content, content_type, extra_headers={"Cache-Control": "public, max-age=86400"})
                return
            self.send_response(404)
            self.end_headers()
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        if parsed.path == "/api/shutdown":
            self.send_json_response({"status": "stopping"})
            if self.server_instance:
                threading.Thread(target=self.server_instance.shutdown, daemon=True).start()
            return

        if parsed.path == "/api/ai/sessions":
            try:
                payload = json.loads(body.decode("utf-8"))
                sessions = payload.get("sessions") if isinstance(payload, dict) else None
                if not isinstance(sessions, list) or not sessions:
                    raise ValueError("会话数据不能为空")
                safe_sessions = []
                for session in sessions:
                    if not isinstance(session, dict) or not str(session.get("id", "")).strip():
                        continue
                    safe_sessions.append({
                        "id": str(session.get("id")),
                        "title": str(session.get("title") or "新会话")[:80],
                        "createdAt": str(session.get("createdAt") or ""),
                        "updatedAt": str(session.get("updatedAt") or ""),
                        "messages": session.get("messages") if isinstance(session.get("messages"), list) else []
                    })
                if not safe_sessions:
                    raise ValueError("会话数据不能为空")
                current_id = str(payload.get("currentId") or safe_sessions[0]["id"])
                if not any(session["id"] == current_id for session in safe_sessions):
                    current_id = safe_sessions[0]["id"]
                saved_payload = {"currentId": current_id, "sessions": safe_sessions}
                temp_file = f"{AI_SESSION_FILE}.tmp"
                with open(temp_file, "w", encoding="utf-8") as f:
                    json.dump(saved_payload, f, ensure_ascii=False, indent=2)
                os.replace(temp_file, AI_SESSION_FILE)
                self.send_json_response({"status": "saved", "currentId": current_id, "count": len(safe_sessions)})
            except (ValueError, OSError, TypeError) as error:
                self.send_json_response({"status": "error", "message": str(error)}, status=400)
            return

        if parsed.path == "/api/ai":
            try:
                payload = json.loads(body.decode("utf-8"))
                prompt = str(payload.get("prompt", "")).strip()
                if not prompt:
                    self.send_json_response({"status": "error", "message": "缺少 AI 请求内容"}, status=400)
                    return

                provider = str(payload.get("provider", "")).strip().lower() or os.environ.get("FOFO_AI_PROVIDER", "gemini").strip().lower() or "gemini"
                provider_configs = {
                    "gemini": {
                        "label": "Google Gemini",
                        "env_key": "GEMINI_API_KEY",
                        "default_model": "gemini-3.6-flash",
                        "endpoint": "https://generativelanguage.googleapis.com/v1beta/models"
                    },
                    "openai": {
                        "label": "OpenAI",
                        "env_key": "OPENAI_API_KEY",
                        "default_model": "gpt-5-mini",
                        "endpoint": "https://api.openai.com/v1/responses"
                    },
                    "deepseek": {
                        "label": "DeepSeek",
                        "env_key": "DEEPSEEK_API_KEY",
                        "default_model": "deepseek-flash",
                        "endpoint": "https://api.deepseek.com/responses"
                    }
                }
                if provider not in provider_configs:
                    self.send_json_response({"status": "error", "message": f"不支持的 AI 服务商：{provider}"}, status=400)
                    return

                provider_config = provider_configs[provider]
                api_key = os.environ.get(provider_config["env_key"], "").strip()
                if not api_key:
                    self.send_json_response({
                        "status": "disabled",
                        "message": f"未配置 {provider_config['env_key']}。请按 AI 配置中的教程设置环境变量，或改用直接配置 API Key 模式。"
                    }, status=503)
                    return

                model = str(payload.get("model", "")).strip() or os.environ.get("FOFO_AI_MODEL", "").strip() or provider_config["default_model"]

                if provider == "gemini":
                    gemini_url = f"{provider_config['endpoint']}/{model}:generateContent?key={api_key}"
                    request_payload = {
                        "system_instruction": {
                            "parts": [{"text": "你是 FoFo 的工作流秘书。只基于用户提供的工作上下文回答，给出可执行、可确认的建议，不要声称已经修改本地数据。"}]
                        },
                        "contents": [
                            {"role": "user", "parts": [{"text": prompt}]}
                        ],
                        "generationConfig": {
                            "maxOutputTokens": 1500
                        }
                    }
                    request = urllib.request.Request(
                        gemini_url,
                        data=json.dumps(request_payload, ensure_ascii=False).encode("utf-8"),
                        headers={"Content-Type": "application/json"},
                        method="POST"
                    )
                else:
                    request_payload = {
                        "model": model,
                        "instructions": "你是 FoFo 的工作流秘书。只基于用户提供的工作上下文回答，给出可执行、可确认的建议，不要声称已经修改本地数据。",
                        "input": prompt,
                        "max_output_tokens": 1200
                    }
                    if provider == "deepseek":
                        request_payload["reasoning"] = {"effort": "none"}
                    request = urllib.request.Request(
                        provider_config["endpoint"],
                        data=json.dumps(request_payload, ensure_ascii=False).encode("utf-8"),
                        headers={
                            "Authorization": f"Bearer {api_key}",
                            "Content-Type": "application/json"
                        },
                        method="POST"
                    )

                with urllib.request.urlopen(request, timeout=60) as response:
                    result = json.loads(response.read().decode("utf-8"))

                output_parts = []
                for cand in result.get("candidates", []):
                    cand_content = cand.get("content", {})
                    parts = cand_content.get("parts", []) if isinstance(cand_content, dict) else []
                    for p in parts:
                        if isinstance(p, dict) and p.get("text"):
                            output_parts.append(p["text"])
                        elif isinstance(p, str):
                            output_parts.append(p)

                output_text = result.get("output_text")
                if isinstance(output_text, str):
                    output_parts.append(output_text)
                for item in result.get("output", []):
                    if item.get("type") in {"reasoning", "reasoning_text"}:
                        continue
                    content_items = item.get("content", [])
                    if isinstance(content_items, str):
                        output_parts.append(content_items)
                    else:
                        for content in content_items:
                            if content.get("type") == "output_text" and content.get("text"):
                                output_parts.append(content.get("text"))
                            elif isinstance(content, str):
                                output_parts.append(content)
                for choice in result.get("choices", []):
                    message = choice.get("message", {})
                    content = message.get("content", "") if isinstance(message, dict) else ""
                    if isinstance(content, str) and content:
                        output_parts.append(content)
                output = "\n".join(dict.fromkeys(part for part in output_parts if part)).strip()
                self.send_json_response({"status": "ok", "output": output, "model": model, "provider": provider_config["label"]})
            except urllib.error.HTTPError as error:
                detail = error.read().decode("utf-8", errors="replace")
                self.send_json_response({"status": "error", "message": f"AI API 请求失败: {detail[:500]}"}, status=error.code)
            except Exception as error:
                self.send_json_response({"status": "error", "message": f"AI 服务异常: {str(error)}"}, status=500)
            return

        if parsed.path == "/api/data":
            data_file = os.path.join(DATA_DIR, "workspace.json")
            with open(data_file, "wb") as f:
                f.write(body)
            self.send_json_response({"status": "saved", "path": data_file})
            return

        if parsed.path == "/api/reading":
            payload = json.loads(body.decode("utf-8"))
            date_str = payload.get("date", "")
            items = payload.get("items", [])
            safe_date = os.path.basename(date_str)
            target_path = os.path.join(DOCS_DIR, f"reading_{safe_date}.json")
            with open(target_path, "w", encoding="utf-8") as f:
                json.dump(items, f, ensure_ascii=False, indent=2)
            self.send_json_response({"status": "saved", "path": target_path})
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

            self.send_json_response({"status": "ok" if success else "error", "message": message})
            return

        if parsed.path == "/api/export":
            payload = json.loads(body.decode("utf-8"))
            filename = payload.get("filename", "export.md")
            content = payload.get("content", "")
            
            safe_name = os.path.basename(filename)
            target_path = os.path.join(EXPORT_DIR, safe_name)
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(content)

            self.send_json_response({"status": "exported", "filepath": target_path})
            return

        self.send_error(404, "Not Found")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

import socket
import hashlib
import ctypes

_APP_MUTEX = None

def get_workspace_mutex():
    """Ensure single process per workspace directory on Windows using a Named Mutex."""
    global _APP_MUTEX
    if sys.platform != "win32":
        return True
    try:
        norm_dir = os.path.normcase(os.path.abspath(BASE_DIR))
        dir_hash = hashlib.md5(norm_dir.encode("utf-8")).hexdigest()[:16]
        mutex_name = f"Local\\FoFo_Workspace_{dir_hash}"
        kernel32 = ctypes.windll.kernel32
        _APP_MUTEX = kernel32.CreateMutexW(None, False, mutex_name)
        if kernel32.GetLastError() == 183:  # ERROR_ALREADY_EXISTS
            return False
        return True
    except Exception:
        return True

class FoFoServer(socketserver.ThreadingTCPServer):
    daemon_threads = True
    allow_reuse_address = False

    def server_bind(self):
        # On Windows, enforce exclusive address use so two different workspaces/processes NEVER share the same port!
        if hasattr(socket, "SO_EXCLUSIVEADDRUSE"):
            try:
                self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
            except OSError:
                pass
        super().server_bind()

def check_existing_instance(port):
    """Check if an instance of FoFo is already running on the given port."""
    url = f"http://localhost:{port}/api/ping"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "FoFo-Launcher"})
        with urllib.request.urlopen(req, timeout=0.4) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                if data.get("app") == "FoFo":
                    return data
    except Exception:
        pass
    return None

def run_server():
    port = PORT
    max_attempts = 10
    current_dir = os.path.normcase(os.path.abspath(BASE_DIR))

    # 1. Single-instance check: if this exact workspace is already running, activate its browser tab and exit
    is_primary = get_workspace_mutex()
    if not is_primary:
        for test_port in range(PORT, PORT + max_attempts):
            existing = check_existing_instance(test_port)
            if existing:
                existing_dir = os.path.normcase(os.path.abspath(existing.get("dir", "")))
                if existing_dir == current_dir:
                    print(f"[FoFo] 检测到当前工作区服务已在后台运行 (端口 {test_port})，正在直接唤起浏览器...")
                    webbrowser.open(f"http://localhost:{test_port}")
                    sys.exit(0)
        sys.exit(0)

    # 2. Find an unoccupied port and launch multithreaded server
    for attempt in range(max_attempts):
        existing = check_existing_instance(port)
        if existing:
            # Port is occupied by another workspace (e.g. production F:\FoFo on 3210)!
            port += 1
            continue

        try:
            httpd = FoFoServer(("", port), FoFoHandler)
            FoFoHandler.server_instance = httpd
            print(f"[FoFo Personal WorkStation] 服务已启动: http://localhost:{port}")
            print(f"[存储目录] 数据自动保存在: {DATA_DIR}")
            print(f"[待阅目录] 待阅文档保存在: {DOCS_DIR}")
            print(f"[导出目录] Markdown 导出在: {EXPORT_DIR}")
            print(f"[AI 会话] 会话记录保存在: {AI_SESSION_FILE}")

            target_url = f"http://localhost:{port}"
            threading.Timer(0.5, lambda: webbrowser.open(target_url)).start()
            httpd.serve_forever()
            break
        except OSError:
            port += 1

if __name__ == "__main__":
    run_server()
