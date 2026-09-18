@echo off
chcp 65001 > nul
title FoFo 个人工作台
cd /d "%~dp0"

echo ========================================================
echo          🚀 正在启动 FoFo 个人工作台...
echo ========================================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] 检测到 Python 环境，正在启动本地极速工作台...
    python server.py
) else (
    echo [提示] 未找到全局 Python 命令，正在以浏览器模式直接打开工作台...
    start index.html
)

pause
