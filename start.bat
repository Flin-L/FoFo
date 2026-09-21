@echo off
setlocal
title FoFo Workstation
cd /d "%~dp0"

where.exe py >nul 2>&1
if not errorlevel 1 goto run_py

where.exe python >nul 2>&1
if not errorlevel 1 goto run_python

if exist "%LocalAppData%\Programs\Python\Python310\python.exe" goto run_python310
if exist "%LocalAppData%\Programs\Python\Python311\python.exe" goto run_python311
if exist "%LocalAppData%\Programs\Python\Python312\python.exe" goto run_python312
if exist "%LocalAppData%\Programs\Python\Python313\python.exe" goto run_python313

echo [INFO] Python was not found. Opening browser mode...
start "" index.html
goto finish

:run_py
echo [OK] Starting FoFo with Python Launcher...
py -3 server.py
goto finish

:run_python
echo [OK] Starting FoFo with Python from PATH...
python server.py
goto finish

:run_python310
echo [OK] Starting FoFo with Python 3.10...
"%LocalAppData%\Programs\Python\Python310\python.exe" server.py
goto finish

:run_python311
echo [OK] Starting FoFo with Python 3.11...
"%LocalAppData%\Programs\Python\Python311\python.exe" server.py
goto finish

:run_python312
echo [OK] Starting FoFo with Python 3.12...
"%LocalAppData%\Programs\Python\Python312\python.exe" server.py
goto finish

:run_python313
echo [OK] Starting FoFo with Python 3.13...
"%LocalAppData%\Programs\Python\Python313\python.exe" server.py
goto finish

:finish
endlocal
pause
