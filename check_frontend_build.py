import subprocess
from pathlib import Path

root_dir = Path(__file__).parent
frontend_dir = root_dir / "frontend"

res = subprocess.run("npx tsc --noEmit", cwd=str(frontend_dir), shell=True, capture_output=True, text=True)

out_file = root_dir / "build_error.txt"
with open(out_file, "w", encoding="utf-8") as f:
    f.write(f"EXIT CODE: {res.returncode}\n")
    f.write(f"STDOUT:\n{res.stdout}\n")
    f.write(f"STDERR:\n{res.stderr}\n")

print(f"Done. Exit: {res.returncode}")
