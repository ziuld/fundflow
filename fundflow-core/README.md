# fundflow-core — Python Data Pipeline

One-time ETL seeder that reads fund data from CSV files and inserts it into MongoDB. Demonstrates polyglot architecture — Python for data pipelines, Java for the API layer.

---

## Stack

- Python 3.13
- pymongo 4.7.2

---

## What it does

1. Reads one or more CSV files from `data/`
2. Parses and validates each row
3. Creates a unique index on `isin` to prevent duplicates
4. Inserts funds into MongoDB collection `funds`
5. Skips existing funds (idempotent — safe to run multiple times)
6. Exits cleanly with a summary

---

## Project structure

```
fundflow-core/
├── seeder.py           # Main ETL script
├── requirements.txt    # pymongo==4.7.2
├── Dockerfile          # Python 3.13 alpine container
└── data/
    ├── funds.csv                # 30 real market instruments
    └── funds_supplemental.csv   # Additional funds
```

---

## CSV format

```csv
name,category,riskLevel,returnYtd,returnOneYear,returnThreeYear,aum,currency,isin,description
iShares Core MSCI World UCITS ETF,Equity,High,-1.80,14.20,38.50,105452.00,USD,IE00B4L5Y983,...
```

---

## Running locally

```bash
cd fundflow-core
pip install -r requirements.txt

# Against local MongoDB (Docker Compose running)
python seeder.py

# Against MongoDB Atlas
export MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/database"
python seeder.py
```

---

## Running against MongoDB Atlas

```bash
# Windows PowerShell
$env:MONGO_URI="mongodb+srv://USER:PASSWORD@name-cluster.jcnqxq3.mongodb.net/database?appName=name-cluster"
python seeder.py

# Git Bash / Linux
export MONGO_URI="mongodb+srv://USER:PASSWORD@name-cluster.jcnqxq3.mongodb.net/database?appName=name-cluster"
python seeder.py
```

---

## Adding more funds

Add rows to `data/funds_supplemental.csv` following the same CSV format. The seeder will skip any ISIN that already exists in MongoDB.

---

## Key design decisions

**Why Python and not Java?** One-shot ETL scripts are a natural fit for Python — less boilerplate, excellent CSV and MongoDB libraries, and it's the industry standard for data pipelines. This demonstrates polyglot architecture: the right tool for the right job.

**Why idempotent?** The seeder can be run multiple times without duplicating data. The unique index on `isin` guarantees this at the database level. This is critical for CI/CD — the seeder runs on every `docker compose up` and must be safe to re-run.

**Why multiple CSV files?** Separating base data from supplemental data allows adding instruments without modifying the original dataset. The seeder skips missing files gracefully.