import subprocess
import sys
from pathlib import Path

root = Path(__file__).parent
frontend_dir = root / "frontend"
out_file = root / "tsc_log.txt"

# Run tsc directly or via cmd
proc = subprocess.run("npx tsc --noEmit", cwd=str(frontend_dir), shell=True, capture_output=True, text=True)

with open(out_file, "w", encoding="utf-8") as f:
    f.write(f"RETURNCODE: {proc.returncode}\n")
    f.write("=== STDOUT ===\n")
    f.write(proc.stdout)
    f.write("\n=== STDERR ===\n")
    f.write(proc.stderr)

print(f"Captured output: exit code {proc.returncode}")
