@echo off
setlocal
set PYTHON=C:\Users\Kruz\AppData\Local\Python\pythoncore-3.14-64\python.exe
set SCANNER_DIR=C:\Users\Kruz\Desktop\Projects\pc-bottleneck-analyzer\scanner
set LOG=%SCANNER_DIR%\build_log.txt

echo ===== Starting build ===== > %LOG%
echo Python: %PYTHON% >> %LOG%

echo --- Installing pip upgrade --- >> %LOG%
%PYTHON% -m pip install --upgrade pip setuptools >> %LOG% 2>&1

echo --- Installing requirements --- >> %LOG%
%PYTHON% -m pip install -r %SCANNER_DIR%\requirements.txt >> %LOG% 2>&1

echo --- Installing PyInstaller --- >> %LOG%
%PYTHON% -m pip install pyinstaller >> %LOG% 2>&1

echo --- pywin32 postinstall --- >> %LOG%
%PYTHON% -m pywin32_postinstall -install >> %LOG% 2>&1

echo --- Running PyInstaller --- >> %LOG%
cd /d %SCANNER_DIR%
%PYTHON% -m PyInstaller scanner.spec --noconfirm --clean >> %LOG% 2>&1

echo --- Checking output --- >> %LOG%
if exist %SCANNER_DIR%\dist\PC-Scanner.exe (
    echo SUCCESS: dist\PC-Scanner.exe exists >> %LOG%
    dir %SCANNER_DIR%\dist\PC-Scanner.exe >> %LOG% 2>&1
) else (
    echo FAILED: dist\PC-Scanner.exe not found >> %LOG%
)

echo ===== Build complete ===== >> %LOG%
