# The Champ data migration plan

## Main source

Use the live local project as the migration source:

`D:\thechamp`

The workspace copy at `C:\Users\Crypt\Documents\TheChamp` is the code/work area. At the time of audit it had no products, while `D:\thechamp` had the current product and uploaded media. For migration we must read from `D:\thechamp` first.

## Current file database

| Current path | Meaning | Target table |
| --- | --- | --- |
| `katalog\Категории\categories.json` | Full category tree index | `categories` |
| `katalog\Категории\**\category.json` | Category folder records | `categories` audit/source backup |
| `katalog\Цвета\colors.json` | Color dictionary | `colors` |
| `katalog\Цвета\*\color.json` | Color folder records | `colors` audit/source backup |
| `katalog\Материалы\materials.json` | Material dictionary | `materials` |
| `katalog\Бренды\brands.json` | Brand dictionary | `brands` |
| `katalog\Бренды\*\brand.json` | Brand folder records | `brands` audit/source backup |
| `katalog\products.json` | Product list | `products` |
| `katalog\products\<product_id>\product.json` | Full product card | `products.raw` and normalized columns |
| `katalog\products\<product_id>\images\*` | Product photos | `product_media` |
| `katalog\products\<product_id>\videos\*` | Product videos | `product_media` |
| `BuckUp\Product\deleted-products.json` | Deleted products | `backup_items` with `backup_type='product'` |
| `BuckUp\File\deleted-files.json` | Deleted files | `backup_items` with `backup_type='file'` |
| `BuckUp\Blog\deleted-blogs.json` | Deleted block/blog data | `backup_items` with `backup_type='blog'` |
| `BuckUp\Free\deleted-free.json` | Full deleted records | `backup_items` with `backup_type='free'` |

## Migration order

1. Create PostgreSQL database and run `database/schema.sql`.
2. Import dictionaries: brands, colors, materials.
3. Import categories preserving `id`, `parentId`, `path`, `depth`, and `sortOrder`.
4. Import products from `katalog\products.json`.
5. For each product, read `katalog\products\<id>\product.json` and keep the full original JSON in `products.raw`.
6. Import media files as records in `product_media`; files stay on disk or object storage, DB stores path, URL, order, type, and main flag.
7. Import BuckUp JSON files into `backup_items`.
8. Switch API reads from JSON files to PostgreSQL.
9. Keep JSON files read-only for one release as emergency rollback.

## Storage rule

Do not store heavy images/videos inside PostgreSQL. Store media files in:

`storage/products/<product_id>/images`

and

`storage/products/<product_id>/videos`

The DB stores only metadata and URLs. Later this same structure can move to S3-compatible storage without changing product logic.

## Important audit note

Russian category names are valid UTF-8 in the files. Some PowerShell output displays them as mojibake, but Python UTF-8 reading confirms the stored text is correct.

## Recommended next implementation step

After PostgreSQL is available, create a migration command:

`python tools/migrate_file_data_to_postgres.py --source D:\thechamp --database-url %DATABASE_URL%`

This should insert data transactionally and print counts for products, media, categories, brands, colors, materials, and backups.
