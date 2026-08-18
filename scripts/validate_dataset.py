"""
AutoWorth AI — Dataset Validator
Generates a data quality report for the vehicle dataset.

Usage:
    python scripts/validate_dataset.py [--input data/generated/vehicles.csv]
"""
import argparse
import sys
from pathlib import Path
import numpy as np
import pandas as pd

CURRENT_YEAR = 2026

EXPECTED_BRANDS = {
    "Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Honda",
    "Toyota", "Kia", "Volkswagen", "Skoda", "Renault",
    "Ford", "MG", "Jeep", "Nissan", "Mercedes-Benz",
    "BMW", "Audi", "Volvo", "Datsun",
}
VALID_FUEL_TYPES = {"Petrol", "Diesel", "CNG", "Electric", "Hybrid", "LPG"}
VALID_TRANSMISSIONS = {"Manual", "Automatic", "AMT", "CVT", "DCT"}


def validate_dataset(df: pd.DataFrame) -> dict:
    report = {}
    n = len(df)

    # ── Basic counts ──────────────────────────────────────────
    report["total_records"] = n
    report["total_features"] = len(df.columns)

    # ── Missing values ────────────────────────────────────────
    missing = df.isnull().sum()
    missing_pct = (missing.sum() / (n * len(df.columns))) * 100
    report["missing_values_pct"] = round(missing_pct, 4)
    report["columns_with_missing"] = missing[missing > 0].to_dict()

    # ── Duplicates ────────────────────────────────────────────
    dup_count = df.duplicated().sum()
    report["duplicates"] = int(dup_count)
    report["duplicates_pct"] = round(dup_count / n * 100, 4)

    # ── Year validation ───────────────────────────────────────
    invalid_years = df[(df["year"] < 1990) | (df["year"] > CURRENT_YEAR)].shape[0]
    report["invalid_years"] = int(invalid_years)

    # ── Mileage / km_driven validation ────────────────────────
    invalid_km = df[df["km_driven"] < 0].shape[0]
    report["negative_km_driven"] = int(invalid_km)

    impossible_km = df[df["km_driven"] > 500_000].shape[0]
    report["extremely_high_km"] = int(impossible_km)

    # ── Engine CC validation ──────────────────────────────────
    invalid_engine = df[(df["engine_cc"] < 0) | (df["engine_cc"] > 15000)].shape[0]
    report["invalid_engine_cc"] = int(invalid_engine)

    # ── Price validation ──────────────────────────────────────
    invalid_price = df[(df["selling_price"] <= 0) | (df["selling_price"] > 50_000_000)].shape[0]
    report["invalid_prices"] = int(invalid_price)

    # ── Categorical checks ────────────────────────────────────
    unknown_brands = df[~df["brand"].isin(EXPECTED_BRANDS)].shape[0]
    report["unknown_brands"] = int(unknown_brands)

    if "fuel_type" in df.columns:
        unknown_fuels = df[~df["fuel_type"].isin(VALID_FUEL_TYPES)].shape[0]
        report["unknown_fuel_types"] = int(unknown_fuels)

    if "transmission" in df.columns:
        unknown_trans = df[~df["transmission"].isin(VALID_TRANSMISSIONS)].shape[0]
        report["unknown_transmissions"] = int(unknown_trans)

    # ── Outliers (IQR method on selling_price) ────────────────
    Q1 = df["selling_price"].quantile(0.25)
    Q3 = df["selling_price"].quantile(0.75)
    IQR = Q3 - Q1
    outliers = df[(df["selling_price"] < Q1 - 1.5 * IQR) | (df["selling_price"] > Q3 + 1.5 * IQR)].shape[0]
    report["price_outliers_iqr"] = int(outliers)
    report["price_outliers_pct"] = round(outliers / n * 100, 2)

    # ── Target statistics ─────────────────────────────────────
    report["target_mean_lakhs"] = round(df["selling_price"].mean() / 100000, 2)
    report["target_median_lakhs"] = round(df["selling_price"].median() / 100000, 2)
    report["target_std_lakhs"] = round(df["selling_price"].std() / 100000, 2)
    report["target_min_lakhs"] = round(df["selling_price"].min() / 100000, 2)
    report["target_max_lakhs"] = round(df["selling_price"].max() / 100000, 2)

    # ── Distribution stats ────────────────────────────────────
    report["brand_distribution"] = df["brand"].value_counts().head(10).to_dict()
    if "fuel_type" in df.columns:
        report["fuel_distribution"] = df["fuel_type"].value_counts().to_dict()
    if "transmission" in df.columns:
        report["transmission_distribution"] = df["transmission"].value_counts().to_dict()

    # ── Correlation insights ──────────────────────────────────
    numeric_cols = ["vehicle_age", "km_driven", "owner_count", "condition_score",
                    "accident_history", "service_history", "engine_cc", "selling_price"]
    available = [c for c in numeric_cols if c in df.columns]
    if len(available) > 1:
        corr = df[available].corr()["selling_price"].drop("selling_price")
        report["feature_correlations_with_target"] = {
            k: round(float(v), 4) for k, v in corr.items()
        }

    # ── Overall quality score ─────────────────────────────────
    issues = (
        missing_pct / 10 +
        report["duplicates_pct"] +
        (invalid_years + invalid_km + invalid_price) / n * 100
    )
    report["quality_score"] = round(max(0, 100 - issues), 1)

    return report


def print_report(report: dict) -> None:
    print("\n" + "=" * 65)
    print("  📋 DATA QUALITY REPORT — AutoWorth AI (Synthetic Dataset)")
    print("=" * 65)
    print(f"  Records:           {report['total_records']:,}")
    print(f"  Features:          {report['total_features']}")
    print(f"  Missing values:    {report['missing_values_pct']}%")
    print(f"  Duplicates:        {report['duplicates']:,} ({report['duplicates_pct']}%)")
    print(f"  Invalid years:     {report['invalid_years']}")
    print(f"  Negative KM:       {report['negative_km_driven']}")
    print(f"  Invalid prices:    {report['invalid_prices']}")
    print(f"  Price outliers:    {report['price_outliers_iqr']:,} ({report['price_outliers_pct']}%)")
    print()
    print(f"  Target mean:       ₹{report['target_mean_lakhs']}L")
    print(f"  Target median:     ₹{report['target_median_lakhs']}L")
    print(f"  Target std:        ₹{report['target_std_lakhs']}L")
    print(f"  Target range:      ₹{report['target_min_lakhs']}L – ₹{report['target_max_lakhs']}L")
    print()
    print(f"  Quality Score:     {report['quality_score']}/100")
    print()

    if "feature_correlations_with_target" in report:
        print("  Correlations with selling_price:")
        for feat, corr in sorted(report["feature_correlations_with_target"].items(), key=lambda x: abs(x[1]), reverse=True):
            bar = "+" * int(abs(corr) * 20) if corr > 0 else "-" * int(abs(corr) * 20)
            print(f"    {feat:<25} {corr:>7.4f}  {bar}")

    print("\n  Brand distribution (top 10):")
    for brand, cnt in list(report.get("brand_distribution", {}).items())[:10]:
        print(f"    {brand:<25} {cnt:>7,}")

    print("=" * 65)
    print("  ⚠️  SYNTHETIC DATA — Not for real financial decisions")
    print("=" * 65 + "\n")


def main():
    parser = argparse.ArgumentParser(description="AutoWorth AI Dataset Validator")
    parser.add_argument("--input", type=str, default="data/generated/vehicles.csv")
    args = parser.parse_args()

    path = Path(args.input)
    if not path.exists():
        print(f"❌ Dataset not found: {path}")
        print("   Run: python scripts/generate_dataset.py first")
        sys.exit(1)

    print(f"📂 Loading dataset from: {path}")
    df = pd.read_csv(path)
    report = validate_dataset(df)
    print_report(report)

    return report


if __name__ == "__main__":
    main()
