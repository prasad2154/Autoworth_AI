import subprocess
from pathlib import Path

out_file = Path(r"d:\AI COURSE\G_38\AutoWorth AI\docker_status.txt")

def run_cmd(cmd_str):
    paths = ["docker", r"C:\Program Files\Docker\Docker\resources\bin\docker.exe", "wsl docker"]
    for d in paths:
        try:
            full_cmd = cmd_str.replace("docker", d, 1)
            res = subprocess.run(full_cmd, capture_output=True, text=True, cwd=str(Path(__file__).parent), shell=True)
            if res.returncode == 0 or res.stdout or res.stderr:
                return f"=== Command ({d}): {full_cmd} ===\nEXIT: {res.returncode}\nSTDOUT:\n{res.stdout}\nSTDERR:\n{res.stderr}\n\n"
        except Exception as e:
            continue
    return f"=== Command Failed ({cmd_str}) ===\nCould not execute docker binary\n\n"

output = ""
output += run_cmd("docker compose ps")
output += run_cmd("docker compose logs --tail=30 backend")
output += run_cmd("docker compose logs --tail=30 frontend")
output += run_cmd("docker compose logs --tail=30 streamlit")

with open(out_file, "w", encoding="utf-8") as f:
    f.write(output)

print(f"Status written to {out_file}")
