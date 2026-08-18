"""
AutoWorth AI — Dataset Generator
Generates 100,000+ realistic synthetic vehicle records with meaningful correlations.

Usage:
    python scripts/generate_dataset.py [--records 100000] [--output data/generated/vehicles.csv]

⚠️  SYNTHETIC DATA DISCLAIMER:
    All prices are generated synthetically for demonstration purposes.
    This data does NOT represent actual market prices.
"""
import argparse
import os
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd

# ─── Configuration ────────────────────────────────────────────────────────────

SEED = 42
np.random.seed(SEED)

CURRENT_YEAR = 2026

BRAND_CONFIG = {
    # brand: (base_price_lakhs, model_list, brand_segment)
    "Maruti Suzuki": (5.5, ["Alto", "Swift", "Dzire", "Baleno", "Vitara Brezza", "Ertiga", "WagonR", "Celerio", "Ignis", "S-Cross"], 0),
    "Hyundai":       (7.0, ["i10", "i20", "Verna", "Creta", "Venue", "Tucson", "Elantra", "Santro"], 0),
    "Tata":          (8.0, ["Nexon", "Harrier", "Safari", "Tiago", "Tigor", "Altroz", "Punch"], 0),
    "Mahindra":      (9.5, ["Scorpio", "XUV500", "Thar", "Bolero", "KUV100", "XUV300", "XUV700"], 0),
    "Honda":         (8.5, ["City", "Amaze", "WR-V", "Jazz", "HR-V", "BR-V", "CR-V"], 1),
    "Toyota":        (10.0,["Innova", "Fortuner", "Glanza", "Urban Cruiser", "Camry", "Corolla"], 1),
    "Kia":           (9.0, ["Sonet", "Seltos", "Carnival", "EV6"], 1),
    "Volkswagen":    (9.5, ["Polo", "Vento", "Taigun", "Virtus", "T-Roc", "Tiguan"], 1),
    "Skoda":         (10.5,["Rapid", "Octavia", "Superb", "Karoq", "Kushaq", "Slavia"], 1),
    "Renault":       (6.5, ["Kwid", "Triber", "Duster", "Kiger"], 0),
    "Ford":          (7.5, ["Figo", "Aspire", "EcoSport", "Endeavour", "Freestyle"], 0),
    "MG":            (11.0,["Hector", "Astor", "Gloster", "ZS EV", "Comet EV"], 1),
    "Jeep":          (14.0,["Compass", "Meridian", "Wrangler", "Grand Cherokee"], 2),
    "Nissan":        (7.0, ["Magnite", "Kicks", "Sunny", "Terrano"], 0),
    "Mercedes-Benz": (30.0,["C-Class", "E-Class", "S-Class", "GLC", "GLE", "GLS", "A-Class"], 2),
    "BMW":           (32.0,["3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X7"], 2),
    "Audi":          (28.0,["A4", "A6", "Q3", "Q5", "Q7", "Q8", "A3"], 2),
    "Volvo":         (25.0,["XC40", "XC60", "XC90", "S60", "S90"], 2),
    "Datsun":        (4.5, ["redi-Go", "GO", "GO+"], 0),
}

FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"]
FUEL_WEIGHTS = [0.52, 0.30, 0.08, 0.06, 0.04]

TRANSMISSION_TYPES = ["Manual", "Automatic", "AMT", "CVT", "DCT"]
TRANSMISSION_WEIGHTS = [0.55, 0.25, 0.10, 0.06, 0.04]

STATES_CITIES = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
    "Delhi": ["New Delhi", "Gurgaon", "Faridabad", "Noida", "Ghaziabad"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
    "Telangana": ["Hyderabad", "Warangal", "Karimnagar"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut"],
    "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri"],
    "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
    "Haryana": ["Gurgaon", "Faridabad", "Hisar", "Rohtak"],
}
STATE_WEIGHTS = [0.18, 0.15, 0.10, 0.09, 0.07, 0.08, 0.05, 0.08, 0.06, 0.04, 0.05, 0.05]

SELLER_TYPES = ["Individual", "Dealer", "Certified Pre-Owned"]
SELLER_WEIGHTS = [0.55, 0.35, 0.10]

CONDITION_CATEGORIES = {
    (85, 100): "Excellent",
    (70, 84): "Good",
    (55, 69): "Fair",
    (40, 54): "Below Average",
    (0, 39):  "Poor",
}

# City-tier price multiplier
CITY_TIER = {
    "Mumbai": 1.08, "New Delhi": 1.07, "Bangalore": 1.06, "Gurgaon": 1.06,
    "Chennai": 1.04, "Hyderabad": 1.04, "Pune": 1.03, "Kolkata": 1.02,
    "Ahmedabad": 1.01, "Noida": 1.02,
}


def sample_variant(brand: str, model_name: str) -> str:
    variants = ["Base", "S", "SV", "SX", "SX+", "Sport", "Luxury", "Premium", "ZXi", "VXi", "LXi", "Alpha", "Delta", "Zeta"]
    return np.random.choice(variants)


def sample_engine_cc(brand: str, fuel: str) -> int:
    segment = BRAND_CONFIG[brand][2]
    if fuel == "Electric":
        return 0
    if segment == 2:  # Premium
        return int(np.random.choice([1998, 2996, 3982, 4395, 1497, 1991], p=[0.3, 0.25, 0.15, 0.1, 0.1, 0.1]))
    elif segment == 1:  # Mid
        return int(np.random.choice([998, 1197, 1497, 1598, 1998, 2199], p=[0.1, 0.2, 0.3, 0.2, 0.15, 0.05]))
    else:  # Budget
        return int(np.random.choice([796, 998, 1197, 1373, 1498], p=[0.2, 0.3, 0.3, 0.15, 0.05]))


def sample_mileage(fuel: str, engine_cc: int) -> float:
    if fuel == "Electric":
        return round(np.random.uniform(200, 500), 1)  # km per charge
    base = {"Petrol": 16, "Diesel": 20, "CNG": 25, "Hybrid": 22}.get(fuel, 16)
    if engine_cc > 2000:
        base *= 0.75
    elif engine_cc < 1000:
        base *= 1.15
    return round(base + np.random.normal(0, 2), 1)


def compute_selling_price(
    brand: str,
    model_name: str,
    year: int,
    km_driven: int,
    fuel: str,
    transmission: str,
    owner_count: int,
    engine_cc: int,
    condition_score: float,
    accident_history: bool,
    service_history: bool,
    city: str,
    seating: int,
) -> tuple[float, float]:
    """
    Compute realistic selling price with meaningful correlations.
    Returns (original_price, selling_price) in rupees.
    """
    base_price_L = BRAND_CONFIG[brand][0]
    segment = BRAND_CONFIG[brand][2]

    # Model price randomization (±20%)
    model_multiplier = np.random.uniform(0.80, 1.20)
    base_price = base_price_L * 100_000 * model_multiplier

    original_price = base_price * np.random.uniform(1.05, 1.30)

    vehicle_age = max(CURRENT_YEAR - year, 0)

    # ── Depreciation ──────────────────────────────────────────
    # Year 1: ~15%, Year 2: ~12%, then ~8% per year, floor at 20% of original
    annual_dep = 0.15 if vehicle_age <= 1 else (0.12 if vehicle_age == 2 else 0.08)
    depreciation_factor = max((1 - annual_dep) ** vehicle_age, 0.20)
    price = original_price * depreciation_factor

    # ── Mileage effect ────────────────────────────────────────
    # Each 10K km above 15K/year reduces value by ~1%
    expected_km = vehicle_age * 15000
    excess_km = max(km_driven - expected_km, 0)
    km_penalty = 1 - (excess_km / 1_000_000)  # normalized
    price *= max(km_penalty, 0.75)

    # ── Fuel type ─────────────────────────────────────────────
    fuel_multiplier = {
        "Diesel": 1.05, "Electric": 1.12, "Hybrid": 1.08,
        "CNG": 0.95, "Petrol": 1.00,
    }.get(fuel, 1.0)
    price *= fuel_multiplier

    # ── Transmission ─────────────────────────────────────────
    if transmission in ("Automatic", "CVT", "DCT"):
        price *= 1.06
    elif transmission == "AMT":
        price *= 1.02

    # ── Owner count ───────────────────────────────────────────
    owner_penalty = {1: 1.0, 2: 0.93, 3: 0.85, 4: 0.75, 5: 0.65}
    price *= owner_penalty.get(owner_count, 0.65)

    # ── Condition ─────────────────────────────────────────────
    # condition_score 0–100 → multiplier 0.75–1.10
    condition_multiplier = 0.75 + (condition_score / 100) * 0.35
    price *= condition_multiplier

    # ── Accident history ──────────────────────────────────────
    if accident_history:
        price *= np.random.uniform(0.80, 0.90)

    # ── Service history ───────────────────────────────────────
    if service_history:
        price *= np.random.uniform(1.03, 1.07)

    # ── Location premium ──────────────────────────────────────
    city_mult = CITY_TIER.get(city, 1.0)
    price *= city_mult

    # ── Seating premium ───────────────────────────────────────
    if seating >= 7:
        price *= 1.04

    # Add realistic market noise (±3%)
    price *= np.random.uniform(0.97, 1.03)

    return round(original_price, 2), round(price, 2)


def generate_dataset(n_records: int = 100_000) -> pd.DataFrame:
    print(f"🔄 Generating {n_records:,} vehicle records...")
    t0 = time.time()

    brands = list(BRAND_CONFIG.keys())
    brand_weights = [1/len(brands)] * len(brands)
    # Boost popular brands
    popular = {"Maruti Suzuki": 3, "Hyundai": 2.5, "Tata": 2, "Mahindra": 1.8, "Honda": 1.5}
    raw_weights = [popular.get(b, 1) for b in brands]
    total_w = sum(raw_weights)
    brand_weights = [w / total_w for w in raw_weights]

    records = []
    chunk = n_records // 10

    for i in range(n_records):
        if i % chunk == 0 and i > 0:
            elapsed = time.time() - t0
            pct = i / n_records * 100
            print(f"   {pct:.0f}% — {i:,}/{n_records:,} records ({elapsed:.1f}s elapsed)")

        brand = np.random.choice(brands, p=brand_weights)
        models_list = BRAND_CONFIG[brand][1]
        model_name = np.random.choice(models_list)
        variant = sample_variant(brand, model_name)

        year = int(np.random.choice(
            range(2010, CURRENT_YEAR + 1),
            p=_year_probs(2010, CURRENT_YEAR),
        ))
        vehicle_age = CURRENT_YEAR - year

        fuel = np.random.choice(FUEL_TYPES, p=FUEL_WEIGHTS)
        transmission = np.random.choice(TRANSMISSION_TYPES, p=TRANSMISSION_WEIGHTS)

        # Older vehicles less likely to be automatic
        if vehicle_age > 8 and transmission in ("Automatic", "CVT", "DCT"):
            if np.random.random() < 0.5:
                transmission = "Manual"

        engine_cc = sample_engine_cc(brand, fuel)
        mileage_kmpl = sample_mileage(fuel, engine_cc)
        seating = int(np.random.choice([4, 5, 6, 7, 8], p=[0.05, 0.65, 0.05, 0.20, 0.05]))

        # Km driven correlates with age
        avg_km_per_year = np.random.normal(14000, 4000)
        km_driven = max(int(avg_km_per_year * vehicle_age + np.random.normal(0, 5000)), 0)
        km_driven = min(km_driven, 350_000)

        owner_count = int(np.random.choice([1, 2, 3, 4, 5], p=[0.50, 0.30, 0.12, 0.06, 0.02]))
        # Older cars more likely to have multiple owners
        if vehicle_age > 7 and owner_count == 1:
            if np.random.random() < 0.4:
                owner_count = np.random.choice([2, 3], p=[0.7, 0.3])

        condition_score = float(np.clip(np.random.normal(72, 15), 20, 100))
        # Older cars tend to have lower condition
        condition_score = float(np.clip(condition_score - vehicle_age * 1.5 + np.random.normal(0, 3), 20, 100))

        accident_history = bool(np.random.random() < 0.12)
        service_history = bool(np.random.random() < 0.72)
        insurance_valid = bool(np.random.random() < 0.85)

        state = np.random.choice(list(STATES_CITIES.keys()), p=STATE_WEIGHTS)
        city = np.random.choice(STATES_CITIES[state])

        seller_type = np.random.choice(SELLER_TYPES, p=SELLER_WEIGHTS)

        original_price, selling_price = compute_selling_price(
            brand, model_name, year, km_driven, fuel, transmission,
            owner_count, engine_cc, condition_score,
            accident_history, service_history, city, seating,
        )
        market_price = round(selling_price * np.random.uniform(0.98, 1.05), 2)

        records.append({
            "brand": brand,
            "model": model_name,
            "variant": variant,
            "year": year,
            "vehicle_age": vehicle_age,
            "km_driven": km_driven,
            "fuel_type": fuel,
            "transmission": transmission,
            "owner_count": owner_count,
            "engine_cc": engine_cc,
            "mileage": mileage_kmpl,
            "seating_capacity": seating,
            "city": city,
            "state": state,
            "condition_score": round(condition_score, 1),
            "accident_history": int(accident_history),
            "service_history": int(service_history),
            "insurance_valid": int(insurance_valid),
            "seller_type": seller_type,
            "original_price": original_price,
            "market_price": market_price,
            "selling_price": selling_price,
        })

    df = pd.DataFrame(records)
    elapsed = time.time() - t0
    print(f"✅ Generated {len(df):,} records in {elapsed:.1f}s")
    return df


def _year_probs(start: int, end: int):
    """Skew distribution toward recent years."""
    years = list(range(start, end + 1))
    weights = [(y - start + 1) ** 1.8 for y in years]
    total = sum(weights)
    return [w / total for w in weights]


def validate_and_clean(df: pd.DataFrame) -> pd.DataFrame:
    """Remove invalid records."""
    initial = len(df)
    df = df.dropna(subset=["selling_price", "brand", "model", "year", "km_driven"])
    df = df[df["selling_price"] > 50_000]
    df = df[df["selling_price"] < 20_000_000]
    df = df[df["km_driven"] >= 0]
    df = df[df["year"] >= 2010]
    df = df[df["engine_cc"] >= 0]
    df = df.drop_duplicates()
    removed = initial - len(df)
    print(f"🧹 Removed {removed:,} invalid/duplicate records. Final: {len(df):,}")
    return df


def print_summary(df: pd.DataFrame) -> None:
    print("\n" + "=" * 60)
    print("  📊 DATASET SUMMARY (Synthetic Data)")
    print("=" * 60)
    print(f"  Records:        {len(df):,}")
    print(f"  Features:       {len(df.columns)}")
    print(f"  Missing values: {df.isnull().sum().sum() / (len(df) * len(df.columns)) * 100:.2f}%")
    print(f"  Duplicates:     {df.duplicated().sum():,}")
    print(f"  Year range:     {df['year'].min()}–{df['year'].max()}")
    print(f"  Brand count:    {df['brand'].nunique()}")
    print(f"  Target mean:    ₹{df['selling_price'].mean()/100000:.2f}L")
    print(f"  Target median:  ₹{df['selling_price'].median()/100000:.2f}L")
    print(f"  Target std:     ₹{df['selling_price'].std()/100000:.2f}L")
    print(f"  Target min:     ₹{df['selling_price'].min()/100000:.2f}L")
    print(f"  Target max:     ₹{df['selling_price'].max()/100000:.2f}L")
    print("=" * 60 + "\n")


def main():
    parser = argparse.ArgumentParser(description="AutoWorth AI Dataset Generator")
    parser.add_argument("--records", type=int, default=100_000, help="Number of records to generate")
    parser.add_argument("--output", type=str, default="data/generated/vehicles.csv")
    args = parser.parse_args()

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    df = generate_dataset(args.records)
    df = validate_and_clean(df)
    print_summary(df)

    df.to_csv(output_path, index=False)
    print(f"💾 Dataset saved to: {output_path}")
    print("\n⚠️  DISCLAIMER: This is synthetic data for demonstration only.")
    print("   Not for real financial decisions.\n")


if __name__ == "__main__":
    main()
