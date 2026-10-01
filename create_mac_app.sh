#!/bin/bash
# ==============================================================================
# 🚀 FoFo 个人工作台 - macOS 专属原生应用构建脚本 (生成 /Applications/FoFo.app)
# ==============================================================================
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "🎨 1. 正在生成 macOS 高清应用图标 (appIcon.icns)..."
mkdir -p /tmp/FoFo.iconset
sips -z 16 16     sparkle.png --out /tmp/FoFo.iconset/icon_16x16.png > /dev/null
sips -z 32 32     sparkle.png --out /tmp/FoFo.iconset/icon_16x16@2x.png > /dev/null
sips -z 32 32     sparkle.png --out /tmp/FoFo.iconset/icon_32x32.png > /dev/null
sips -z 64 64     sparkle.png --out /tmp/FoFo.iconset/icon_32x32@2x.png > /dev/null
sips -z 128 128   sparkle.png --out /tmp/FoFo.iconset/icon_128x128.png > /dev/null
sips -z 256 256   sparkle.png --out /tmp/FoFo.iconset/icon_128x128@2x.png > /dev/null
sips -z 256 256   sparkle.png --out /tmp/FoFo.iconset/icon_256x256.png > /dev/null
sips -z 512 512   sparkle.png --out /tmp/FoFo.iconset/icon_256x256@2x.png > /dev/null
sips -z 512 512   sparkle.png --out /tmp/FoFo.iconset/icon_512x512.png > /dev/null
iconutil -c icns /tmp/FoFo.iconset -o appIcon.icns
rm -rf /tmp/FoFo.iconset

echo "🔨 2. 正在编译 Universal 架构原生 Mach-O 守护进程与调度引擎..."
cat << 'EOF' > /tmp/launcher.c
#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>
#include <sys/stat.h>
#include <fcntl.h>

void spawn_daemon(const char *dir, const char *py_bin) {
    pid_t pid = fork();
    if (pid < 0) return;
    if (pid > 0) return; // Parent returns
    
    // Child: detach completely into independent session
    setsid();
    
    pid_t pid2 = fork();
    if (pid2 < 0) _exit(1);
    if (pid2 > 0) _exit(0); // Intermediate child exits, grandchild reparents to launchd (PID 1)
    
    // Grandchild daemon
    if (chdir(dir) != 0) _exit(1);
    
    int devnull = open("/dev/null", O_RDWR);
    if (devnull >= 0) {
        dup2(devnull, STDIN_FILENO);
        dup2(devnull, STDOUT_FILENO);
        dup2(devnull, STDERR_FILENO);
        close(devnull);
    }
    
    execl(py_bin, py_bin, "server.py", (char *)NULL);
    _exit(1);
}

int main(int argc, char *argv[]) {
    // 优先使用本地独立自用版 FoFo_macOS，回退使用开发目录
    const char *self_use_dir = "/Users/fulin/Projects/FoFo_macOS";
    const char *dev_dir = "/Users/fulin/Projects/FoFo_development";
    
    struct stat st;
    const char *target_dir = self_use_dir;
    if (stat(self_use_dir, &st) != 0) {
        target_dir = dev_dir;
    }
    
    // 检测本地 3210 端口服务是否已在运行
    int running = (system("curl -s -m 1 http://localhost:3210/api/ping > /dev/null 2>&1") == 0);
    
    if (!running) {
        const char *py_bin = "/usr/local/bin/python3";
        if (access(py_bin, X_OK) != 0) {
            py_bin = "/usr/bin/python3";
        }
        spawn_daemon(target_dir, py_bin);
        
        for (int i = 0; i < 30; i++) {
            usleep(100000); // 100ms
            if (system("curl -s -m 1 http://localhost:3210/api/ping > /dev/null 2>&1") == 0) {
                break;
            }
        }
    }
    
    // 以完全独立的无干扰应用窗口打开 FoFo
    // 1. 优先使用 Microsoft Edge 独立桌面应用窗口模式 (--app)
    if (access("/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge", X_OK) == 0) {
        system("nohup \"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge\" --app=\"http://localhost:3210\" > /dev/null 2>&1 &");
        return 0;
    }
    
    // 2. 次选使用 Google Chrome 独立应用窗口模式 (--app)
    if (access("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", X_OK) == 0) {
        system("nohup \"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome\" --app=\"http://localhost:3210\" > /dev/null 2>&1 &");
        return 0;
    }
    
    // 3. 回退为 Safari 新窗口
    system("osascript -e 'tell application \"Safari\" to make new document with properties {URL:\"http://localhost:3210\"}' > /dev/null 2>&1 || open \"http://localhost:3210\"");
    return 0;
}
EOF

clang -O2 -arch arm64 -arch x86_64 /tmp/launcher.c -o /tmp/FoFo_binary
rm -f /tmp/launcher.c

echo "📦 3. 正在组装 /Applications/FoFo.app 原生软件目录..."
APP_DIR="/Applications/FoFo.app"
rm -rf "$APP_DIR"
mkdir -p "$APP_DIR/Contents/MacOS"
mkdir -p "$APP_DIR/Contents/Resources"

cp /tmp/FoFo_binary "$APP_DIR/Contents/MacOS/FoFo"
chmod +x "$APP_DIR/Contents/MacOS/FoFo"
rm -f /tmp/FoFo_binary

cp appIcon.icns "$APP_DIR/Contents/Resources/appIcon.icns"

cat << 'EOF' > "$APP_DIR/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>FoFo</string>
    <key>CFBundleIconFile</key>
    <string>appIcon</string>
    <key>CFBundleIdentifier</key>
    <string>com.fofo.personal.workstation</string>
    <key>CFBundleName</key>
    <string>FoFo</string>
    <key>CFBundleDisplayName</key>
    <string>FoFo</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>2.3.2</string>
    <key>CFBundleVersion</key>
    <string>2.3.2</string>
    <key>LSMinimumSystemVersion</key>
    <string>11.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

printf "APPL????" > "$APP_DIR/Contents/PkgInfo"

# 本地 Ad-hoc 签名
codesign --force --deep --sign - "$APP_DIR" > /dev/null 2>&1 || true

# 刷新系统 LaunchServices 与图标缓存
touch "$APP_DIR"
/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -f "$APP_DIR"

echo "✅ 成功生成 /Applications/FoFo.app！"
