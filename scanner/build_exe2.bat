@echo off
setlocal
set PYTHON=C:\Users\Kruz\AppData\Local\Python\pythoncore-3.14-64\python.exe
set SCANNER_DIR=C:\Users\Kruz\Desktop\Projects\pc-bottleneck-analyzer\scanner
set LOG=%SCANNER_DIR%\build_log2.txt

echo ===== Starting build (no pip upgrade) ===== > %LOG%
date /t >> %LOG%
time /t >> %LOG%

echo --- Installing PyInstaller only --- >> %LOG%
%PYTHON% -m pip install pyinstaller --no-deps >> %LOG% 2>&1
echo pip install pyinstaller exit: %ERRORLEVEL% >> %LOG%

echo --- Check PyInstaller installed --- >> %LOG%
%PYTHON% -c "import PyInstaller; print('PyInstaller version:', PyInstaller.__version__)" >> %LOG% 2>&1

echo --- pywin32 postinstall --- >> %LOG%
%PYTHON% -m pywin32_postinstall -install >> %LOG% 2>&1

echo --- Running PyInstaller build --- >> %LOG%
cd /d %SCANNER_DIR%
%PYTHON% -m PyInstaller scanner.spec --noconfirm --clean >> %LOG% 2>&1
echo pyinstaller exit: %ERRORLEVEL% >> %LOG%

echo --- Checking output --- >> %LOG%
if exist %SCANNER_DIR%\dist\PC-Scanner.exe (
    echo SUCCESS >> %LOG%
    dir %SCANNER_DIR%\dist\PC-Scanner.exe >> %LOG% 2>&1
) else (
    echo FAILED: dist\PC-Scanner.exe not found >> %LOG%
)

echo ===== Done ===== >> %LOG%
