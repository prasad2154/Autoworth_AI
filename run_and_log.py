import sys
import os

log_file = r"d:\AI COURSE\G_38\AutoWorth AI\python_run.log"
with open(log_file, "w") as f:
    f.write(f"Python executable: {sys.executable}\n")
    f.write(f"Current working dir: {os.getcwd()}\n")
