#!/bin/bash
# ==============================================================================
# 🚀 FoFo 个人工作台 - macOS 专属原生应用生成脚本 (一键创建 /Applications/FoFo.app)
# ==============================================================================
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "🎨 正在生成 macOS 高清应用图标..."
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
iconutil -c icns /tmp/FoFo.iconset -o /tmp/appIcon.icns
rm -rf /tmp/FoFo.iconset

echo "🔨 正在编译 macOS 原生应用包 /Applications/FoFo.app..."
cat << EOF > /tmp/fofo_launcher.applescript
set projectDir to "$DIR"

try
    set pingCheck to do shell script "curl -s -m 1 http://localhost:3210/api/ping || echo 'down'"
    if pingCheck does not contain "ok" then
        set pyBin to "/usr/local/bin/python3"
        do shell script "cd " & quoted form of projectDir & " && nohup " & pyBin & " server.py > /dev/null 2>&1 &"
        repeat 30 times
            delay 0.1
            set checkAgain to do shell script "curl -s -m 1 http://localhost:3210/api/ping || echo 'down'"
            if checkAgain contains "ok" then exit repeat
        end repeat
    end if
    open location "http://localhost:3210"
on error errMsg
    display alert "FoFo 启动失败" message errMsg as critical
end try
EOF

rm -rf /Applications/FoFo.app
osacompile -o /Applications/FoFo.app /tmp/fofo_launcher.applescript
rm -f /tmp/fofo_launcher.applescript

# 替换为 FoFo 专属亮闪高保真图标
cp /tmp/appIcon.icns /Applications/FoFo.app/Contents/Resources/applet.icns
rm -f /tmp/appIcon.icns

# 刷新系统 LaunchServices 与 Finder 缓存
touch /Applications/FoFo.app
/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -f /Applications/FoFo.app

echo "✅ 成功生成 /Applications/FoFo.app！"
echo "💡 您现在可以在访达「应用程序」中将 FoFo 拖入程序坞（Dock），或通过 Spotlight (Command+空格) 搜索直接启动。"
