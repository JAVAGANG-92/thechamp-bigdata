# White-label BigData Admin Panel

Marketplace admin panel for catalog, products, references, BuckUp, and future seller/API integrations.

The project is prepared as a white-label product: the same codebase can be copied and sold to different customers by changing `.env` branding, logo, data folder, database, and admin credentials.

## Quick Start

Windows:

```powershell
D:\thechamp\THECHAMP_SERVER_START.bat
```

Manual start from the project folder:

```powershell
node server.js
```

Panel URL:

```text
http://localhost:4173
```

## Environment

Copy:

```text
.env.example -> .env
```

Main customer settings:

```env
APP_BRAND_NAME=Customer Brand
APP_PRODUCT_NAME=Customer Brand BigData
APP_DEFAULT_BRAND=Customer Brand
APP_LOGO_URL=/assets/customer-logo.svg
APP_STORAGE_PREFIX=customerbrand
APP_PORT=4173
APP_DATA_ROOT=D:\customerbrand-data
DATABASE_URL=postgresql://customer_user:strong_password@127.0.0.1:5432/customer_bigdata
PUBLIC_BASE_URL=http://localhost:4173
APP_ADMIN_EMAIL=admin@customer.local
APP_ADMIN_PASSWORD=change_this_password
```

`APP_DATA_ROOT` keeps code separate from customer data: products, photos, videos, and BuckUp.

## White-label Copies

Read the sale/copy guide before creating a customer build:

```text
docs/WHITE_LABEL.md
```

Create a customer copy:

```powershell
powershell -ExecutionPolicy Bypass -File tools\create_customer_copy.ps1 `
  -SourcePath C:\Users\Crypt\Documents\TheChamp `
  -TargetPath D:\customer-panel `
  -BrandName "Customer Brand" `
  -DataRoot D:\customer-data `
  -DatabaseUrl "postgresql://customer_user:strong_password@127.0.0.1:5432/customer_bigdata" `
  -AdminEmail "admin@customer.local" `
  -AdminPassword "change_this_password"
```

## Structure

- `public/` - admin panel interface.
- `katalog/` - local catalog and reference data.
- `BuckUp/` - deleted data prepared for restore.
- `database/` - PostgreSQL schema and migration plan.
- `docs/` - deployment, operations, and white-label guides.
- `tools/` - service scripts.
- `server.js` - local Node.js server.

## Health Check

```powershell
.\scripts\healthcheck.ps1 -BaseUrl http://127.0.0.1:4173
```
