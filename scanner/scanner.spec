# -*- mode: python ; coding: utf-8 -*-
#
# PyInstaller spec for PC-Scanner.exe
# Run from the scanner/ directory:
#   pyinstaller scanner.spec

block_cipher = None

a = Analysis(
    ['scanner.py'],
    pathex=['.'],
    binaries=[],
    datas=[],
    # WMI uses COM automation via pywin32 — these must be explicitly included
    hiddenimports=[
        'wmi',
        'pythoncom',
        'pywintypes',
        'win32api',
        'win32con',
        'win32com',
        'win32com.client',
        'win32com.server',
        'win32com.shell',
        'GPUtil',
        'GPUtil.GPUtil',
        'psutil',
        'cpuinfo',
        'pkg_resources',
        'setuptools',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Trim fat — not needed for this CLI tool
        'tkinter',
        'matplotlib',
        'numpy',
        'pandas',
        'scipy',
        'PIL',
        'PyQt5',
        'PyQt6',
        'wx',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='PC-Scanner',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,           # Compress the exe (reduces size ~30%)
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,       # Keep console open — user needs to see scan progress
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,          # Add icon path here if you have one: 'icon.ico'
    version=None,
)
