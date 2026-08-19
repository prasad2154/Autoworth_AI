import subprocess
from pathlib import Path

root = Path(__file__).parent
log_file = root / "frontend_build_log.txt"

# Run docker compose build frontend
proc = subprocess.run(
    r'"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose build frontend',
    cwd=str(root),
    shell=True,
    capture_output=True,
    text=True
)

with open(log_file, "w", encoding="utf-8") as f:
    f.write(f"EXIT CODE: {proc.returncode}\n")
    f.write("=== STDOUT ===\n")
    f.write(proc.stdout)
    f.write("\n=== STDERR ===\n")
    f.write(proc.stderr)

print(f"Build finished with code {proc.returncode}")
