import csv
import os
import sys
from datetime import datetime, timezone
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, DuplicateKeyError

# ─────────────────────────────────────────────
# Configuration — read from environment variable
# with a fallback for local development outside Docker
# ─────────────────────────────────────────────
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://fundflow:fundflow123@localhost:27017/fundflowdb?authSource=admin"
)
DATABASE_NAME = "fundflowdb"
COLLECTION_NAME = "funds"
# Replace the single CSV_PATH with a list
CSV_FILES = [
    os.path.join(os.path.dirname(__file__), "data", "funds.csv"),
    os.path.join(os.path.dirname(__file__), "data", "funds_supplemental.csv"),
]

def connect_to_mongodb():
    """Connect to MongoDB and return the collection."""
    print(f"Connecting to MongoDB...")
    try:
        # serverSelectionTimeoutMS avoids hanging forever if MongoDB is down
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # ping to verify connection is actually working
        client.admin.command("ping")
        print("Connected to MongoDB successfully.")
        db = client[DATABASE_NAME]
        return db[COLLECTION_NAME]
    except ConnectionFailure as e:
        print(f"Failed to connect to MongoDB: {e}")
        sys.exit(1)


def parse_csv(filepath):
    """Read the CSV file and return a list of fund documents."""
    funds = []
    print(f"Reading CSV from {filepath}...")

    with open(filepath, newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            fund = {
                "name": row["name"],
                "category": row["category"],
                "riskLevel": row["riskLevel"],
                # Convert string numbers to floats
                # CSV stores everything as strings — we need proper types in MongoDB
                "returnYtd": float(row["returnYtd"]),
                "returnOneYear": float(row["returnOneYear"]),
                "returnThreeYear": float(row["returnThreeYear"]),
                "aum": float(row["aum"]),
                "currency": row["currency"],
                "isin": row["isin"],
                "description": row["description"],
                "createdAt": datetime.now(timezone.utc),
                "updatedAt": datetime.now(timezone.utc),
            }
            funds.append(fund)

    print(f"Parsed {len(funds)} funds from CSV.")
    return funds


def seed(collection, funds):
    """Insert funds into MongoDB, skipping duplicates by ISIN."""
    inserted = 0
    skipped = 0

    # Create a unique index on ISIN to prevent duplicate funds
    # idempotent — safe to run multiple times
    collection.create_index("isin", unique=True)

    for fund in funds:
        try:
            collection.insert_one(fund)
            inserted += 1
            print(f"  Inserted: {fund['name']}")
        except DuplicateKeyError:
            skipped += 1
            print(f"  Skipped (already exists): {fund['name']}")

    return inserted, skipped


def main():
    print("=" * 50)
    print("FundFlow — Python Seeder")
    print("=" * 50)

    collection = connect_to_mongodb()
    
    total_inserted = 0
    total_skipped = 0

    for csv_file in CSV_FILES:
        if not os.path.exists(csv_file):
            print(f"Skipping {csv_file} — file not found")
            continue
        funds = parse_csv(csv_file)
        inserted, skipped = seed(collection, funds)
        total_inserted += inserted
        total_skipped += skipped

    print("=" * 50)
    print(f"Done. Inserted: {total_inserted} | Skipped: {total_skipped}")
    print("=" * 50)


if __name__ == "__main__":
    main()