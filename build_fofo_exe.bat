@echo off
setlocal
cd /d "%~dp0"
set PYINSTALLER_CMD=pyinstaller
where.exe pyinstaller >nul 2>&1
if errorlevel 1 (
  python -m PyInstaller --version >nul 2>&1
  if errorlevel 1 (
    echo PyInstaller is not installed.
    echo Install it with: python -m pip install pyinstaller
    pause
    exit /b 1
  )
  set PYINSTALLER_CMD=python -m PyInstaller
)
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
%PYINSTALLER_CMD% --noconfirm --clean --onefile --noconsole --name FoFo ^
  --icon=sparkle.ico ^
  --add-data "index.html;." ^
  --add-data "css;css" ^
  --add-data "js;js" ^
  --add-data "assets;assets" ^
  --add-data "osimg;osimg" ^
  --add-data "sparkle.png;." ^
  --add-data "sparkle.ico;." ^
  server.py
if exist dist\FoFo.exe (
  copy /y dist\FoFo.exe .\FoFo.exe >nul
  echo Build complete: FoFo.exe in project root.
) else (
  echo Build failed.
)
pause
