# The Champ deployment plan

This document describes the target path from the current local file database to an online production server.

## 1. Code repository

Keep source code in Git:

- `public/`
- `py_server.py`
- `server.js`
- `database/`
- `tools/`
- `docs/`
- `.env.example`

Do not commit private runtime files:

- `.env`
- `katalog/products.json`
- `katalog/products/`
- `BuckUp/**/*.json`
- `storage/`

## 2. Production server layout

Recommended Linux layout:

```text
/opt/thechamp/app        # code
/var/lib/thechamp        # data root
/var/lib/thechamp/katalog
/var/lib/thechamp/BuckUp
/var/lib/thechamp/storage
```

Recommended Windows layout:

```text
D:\thechamp              # code
D:\thechamp-data         # data root
D:\thechamp-data\katalog
D:\thechamp-data\BuckUp
D:\thechamp-data\storage
```

Set this in `.env`:

```text
THECHAMP_DATA_ROOT=/var/lib/thechamp
```

or on Windows:

```text
THECHAMP_DATA_ROOT=D:\thechamp-data
```

## 3. First server start

Copy `.env.example` to `.env`, then edit values.

Local Python start:

```powershell
python py_server.py
```

Node fallback:

```powershell
npm start
```

Health check:

```powershell
.\scripts\healthcheck.ps1 -BaseUrl http://127.0.0.1:4173
```

## 4. Database migration target

The PostgreSQL schema is in:

```text
database/schema.sql
```

Current migration source must be the live data folder:

```text
D:\thechamp
```

Audit command:

```powershell
python tools\audit_data_store.py --root D:\thechamp --write-report database\audit-report-live.json
```

## 5. Next implementation step

Create and run:

```text
tools/migrate_file_data_to_postgres.py
```

It should import:

- categories
- products
- product media metadata
- colors
- materials
- brands
- BuckUp records

Heavy media files must stay in filesystem or object storage; PostgreSQL stores metadata only.
