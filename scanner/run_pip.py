import subprocess, sys
result = subprocess.run(
    [sys.executable, "-m", "pip", "install", "pyinstaller"],
    capture_output=True, text=True
)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)
print("RETURNCODE:", result.returncode)
