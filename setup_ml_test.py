import sys
import os
from pathlib import Path

log_path = Path(__file__).parent / "test_log.txt"
with open(log_path, "w") as f:
    f.write("Starting setup_ml_test.py\n")

try:
    sys.path.insert(0, str(Path(__file__).parent))
    from scripts.generate_dataset import generate_dataset, validate_and_clean
    from scripts.train_model import train
    
    df = generate_dataset(1000)
    df = validate_and_clean(df)
    
    data_dir = Path(__file__).parent / "data" / "generated"
    data_dir.mkdir(parents=True, exist_ok=True)
    csv_path = data_dir / "vehicles.csv"
    df.to_csv(csv_path, index=False)
    
    models_dir = Path(__file__).parent / "models"
    train(str(csv_path), str(models_dir))
    
    with open(log_path, "a") as f:
        f.write("SUCCESS\n")
except Exception as e:
    import traceback
    with open(log_path, "a") as f:
        f.write(f"ERROR: {e}\n{traceback.format_exc()}\n")
