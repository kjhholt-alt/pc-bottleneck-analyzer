@echo off
REM build.bat — builds PC-Scanner.exe locally using a controlled Python venv
REM Run from the scanner/ directory or the project root.
REM Output: dist\PC-Scanner.exe

setlocal

REM Find this script's directory (always the scanner/ folder)
set SCANNER_DIR=%~dp0
cd /d "%SCANNER_DIR%"

echo.
echo [1/5] Checking Python...
py -3.12 --version >nul 2>&1
if %errorlevel%==0 (
    set PYTHON=py -3.12
) else (
    py -3.11 --version >nul 2>&1
    if %errorlevel%==0 (
        set PYTHON=py -3.11
    ) else (
        python --version >nul 2>&1
        if %errorlevel%==0 (
            set PYTHON=python
        ) else (
            echo [ERROR] Python not found. Install Python 3.11 or 3.12 from python.org
            exit /b 1
        )
    )
)
echo Found: %PYTHON%

echo.
echo [2/5] Creating virtual environment...
if not exist ".venv" (
    %PYTHON% -m venv .venv
)
call .venv\Scripts\activate.bat

echo.
echo [3/5] Installing dependencies...
python -m pip install --upgrade pip --quiet
pip install setuptools --quiet          REM Fixes distutils for Python 3.12+
pip install -r requirements.txt --quiet
pip install pyinstaller --quiet
python -m pywin32_postinstall -install  >nul 2>&1

echo.
echo [4/5] Building EXE...
if exist "dist" rmdir /s /q dist
if exist "build" rmdir /s /q build

pyinstaller scanner.spec --noconfirm --clean
if %errorlevel% neq 0 (
    echo [ERROR] PyInstaller build failed.
    exit /b 1
)

echo.
echo [5/5] Done!
echo.
echo Output: %SCANNER_DIR%dist\PC-Scanner.exe
echo.
echo Test it:
echo   dist\PC-Scanner.exe
echo   dist\PC-Scanner.exe --output %USERPROFILE%\Desktop\scan.json

call .venv\Scripts\deactivate.bat
endlocal
