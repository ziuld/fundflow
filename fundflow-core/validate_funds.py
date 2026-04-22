import csv
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_FILES = [
    BASE_DIR / "data/funds.csv",
    BASE_DIR / "data/funds_supplemental.csv"
]

def validate_file(file_path: Path):
    if not file_path.exists():
        raise FileNotFoundError(f"Missing file: {file_path}")

    with open(file_path, newline='') as f:
        rows = list(csv.DictReader(f))

    if len(rows) == 0:
        raise ValueError(f"{file_path} is empty")

    if "isin" not in rows[0]:
        raise ValueError(f"{file_path} missing 'isin' column")

    print(f"{file_path.name}: OK ({len(rows)} funds)")


def main():
    print("=== Fund validation starting ===")

    for file in DATA_FILES:
        validate_file(file)

    print("=== All validations passed ===")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)