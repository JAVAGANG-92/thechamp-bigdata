# White-label sale guide

This project is prepared as a reusable marketplace admin panel. For each customer, keep the codebase the same and change only runtime configuration, data root, database, logo, and credentials.

## Customer-specific settings

Create a local `.env` file in the deployed app folder:

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

Do not commit `.env`. It belongs only to that customer installation.

## What changes per sale

- `APP_BRAND_NAME`: visible brand name.
- `APP_PRODUCT_NAME`: browser title and login brand.
- `APP_DEFAULT_BRAND`: default product brand when a new product is created.
- `APP_LOGO_URL`: logo path inside `public/assets`.
- `APP_STORAGE_PREFIX`: browser localStorage namespace. Use a unique value per customer.
- `APP_DATA_ROOT`: product photos, videos, catalog files, and backups for that customer.
- `DATABASE_URL`: PostgreSQL database dedicated to that customer.
- `APP_ADMIN_EMAIL` / `APP_ADMIN_PASSWORD`: first admin login.

## Data isolation rule

Never share one `APP_DATA_ROOT` or one PostgreSQL database between customers. Each customer must have:

- own code folder or deployment
- own `.env`
- own data folder
- own PostgreSQL database/user
- own backup folder

## Create a new customer copy

From the source project folder:

```powershell
powershell -ExecutionPolicy Bypass -File tools\create_customer_copy.ps1 `
  -SourcePath C:\Users\Crypt\Documents\TheChamp `
  -TargetPath D:\customer-panel `
  -BrandName "Customer Brand" `
  -ProductName "Customer Brand BigData" `
  -DataRoot D:\customer-data `
  -DatabaseUrl "postgresql://customer_user:strong_password@127.0.0.1:5432/customer_bigdata" `
  -AdminEmail "admin@customer.local" `
  -AdminPassword "change_this_password"
```

After copying, install dependencies if needed, create the customer database, run the migration for that customer's data, and start the server.
