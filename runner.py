import subprocess
import os
import sys

print("Python runner executing...")
log_file = r"d:\AI COURSE\G_38\AutoWorth AI\docker_run.log"

try:
    res = subprocess.run(["docker", "compose", "up", "--build", "-d"], capture_output=True, text=True, cwd=r"d:\AI COURSE\G_38\AutoWorth AI")
    output = f"EXIT: {res.returncode}\nSTDOUT:\n{res.stdout}\nSTDERR:\n{res.stderr}"
except Exception as e:
    output = f"EXCEPTION: {e}"

print(output)
with open(log_file, "w") as f:
    f.write(output)
