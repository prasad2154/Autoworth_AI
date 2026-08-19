import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from scripts.generate_dataset import generate_dataset, validate_and_clean
from scripts.train_model import train

print("🚀 Generating synthetic dataset for ML model...")
df = generate_dataset(1000)
df = validate_and_clean(df)

data_dir = Path("data/generated")
data_dir.mkdir(parents=True, exist_ok=True)
csv_path = data_dir / "vehicles.csv"
df.to_csv(csv_path, index=False)
print(f"💾 Saved dataset to {csv_path}")

print("🤖 Training ML candidate models...")
models_dir = Path("models")
metadata = train(str(csv_path), str(models_dir))
print("✅ ML Model pipeline successfully built!")
