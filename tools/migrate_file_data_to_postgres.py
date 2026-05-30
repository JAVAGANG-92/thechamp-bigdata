import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path


CATALOG_FOLDER = "Категории"
COLORS_FOLDER = "Цвета"
MATERIALS_FOLDER = "Материалы"
BRANDS_FOLDER = "Бренды"


def read_json(path, default):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8-sig"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON in {path}: {exc}") from exc


def as_list(value):
    return value if isinstance(value, list) else []


def stable_id(prefix, value):
    text = str(value or "").strip().lower()
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"[^a-z0-9а-яё_-]+", "-", text, flags=re.IGNORECASE)
    text = text.strip("-_") or "item"
    return f"{prefix}-{text}"[:120]


def parse_dt(value):
    if not value:
        return None
    text = str(value)
    try:
        return datetime.fromisoformat(text)
    except ValueError:
        return None


def to_jsonb(value):
    return json.dumps(value or {}, ensure_ascii=False)


def load_source(root):
    root = Path(root).resolve()
    katalog = root / "katalog"

    categories = as_list(read_json(katalog / CATALOG_FOLDER / "categories.json", []))
    colors = as_list(read_json(katalog / COLORS_FOLDER / "colors.json", []))
    materials = as_list(read_json(katalog / MATERIALS_FOLDER / "materials.json", []))
    brands = as_list(read_json(katalog / BRANDS_FOLDER / "brands.json", []))
    products = as_list(read_json(katalog / "products.json", []))

    backup_root = root / "BuckUp"
    backups = {
        "product": as_list(read_json(backup_root / "Product" / "deleted-products.json", [])),
        "file": as_list(read_json(backup_root / "File" / "deleted-files.json", [])),
        "blog": as_list(read_json(backup_root / "Blog" / "deleted-blogs.json", [])),
        "free": as_list(read_json(backup_root / "Free" / "deleted-free.json", [])),
    }

    return {
        "root": root,
        "katalog": katalog,
        "categories": categories,
        "colors": colors,
        "materials": materials,
        "brands": brands,
        "products": products,
        "backups": backups,
    }


def category_sort_key(category):
    return (
        int(category.get("priorityGroup") or 0),
        int(category.get("depth") or 0),
        int(category.get("sortOrder") or 0),
        str(category.get("path") or category.get("name") or ""),
    )


def build_category_lookup(categories):
    by_name = defaultdict(list)
    by_path = {}
    by_id = {}
    for category in categories:
        if not isinstance(category, dict):
            continue
        category_id = str(category.get("id") or "").strip()
        name = str(category.get("name") or "").strip()
        path = str(category.get("path") or name).strip()
        if category_id:
            by_id[category_id] = category
        if name:
            by_name[name].append(category)
        if path:
            by_path[path] = category
    for items in by_name.values():
        items.sort(key=category_sort_key)
    return by_id, by_name, by_path


def normalize_brands(source):
    by_name = {}
    for item in source["brands"]:
        if isinstance(item, dict):
            name = str(item.get("name") or "").strip()
            if not name:
                continue
            by_name[name.lower()] = {
                "id": str(item.get("id") or stable_id("brand", name)),
                "name": name,
                "source": str(item.get("source") or "manual"),
                "created_at": parse_dt(item.get("createdAt")),
            }

    for product in source["products"]:
        if isinstance(product, dict):
            name = str(product.get("brand") or "").strip()
            if name and name.lower() not in by_name:
                by_name[name.lower()] = {
                    "id": stable_id("brand", name),
                    "name": name,
                    "source": "product",
                    "created_at": parse_dt(product.get("createdAt")),
                }

    return sorted(by_name.values(), key=lambda item: item["name"].lower())


def normalize_categories(source):
    records = []
    ids = set()
    for item in source["categories"]:
        if not isinstance(item, dict):
            continue
        category_id = str(item.get("id") or "").strip()
        name = str(item.get("name") or "").strip()
        if not category_id or not name:
            continue
        ids.add(category_id)
        records.append({
            "id": category_id,
            "parent_id": str(item.get("parentId") or "").strip() or None,
            "name": name,
            "path": str(item.get("path") or name).strip(),
            "depth": int(item.get("depth") or 1),
            "sort_order": int(item.get("sortOrder") or 0),
            "priority_group": int(item.get("priorityGroup") or 0),
            "active": bool(item.get("active", True)),
            "show_home": bool(item.get("showHome", False)),
            "external_code": str(item.get("oneCId") or item.get("champId") or "").strip() or None,
            "source": str(item.get("source") or "the-champ"),
            "created_at": parse_dt(item.get("createdAt")),
        })

    for record in records:
        if record["parent_id"] not in ids:
            record["parent_id"] = None

    return sorted(records, key=lambda item: (item["depth"], item["sort_order"], item["name"]))


def normalize_colors(source):
    records = []
    seen = set()
    for item in source["colors"]:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name") or "").strip()
        if not name or name.lower() in seen:
            continue
        seen.add(name.lower())
        records.append({
            "id": stable_id("color", name),
            "name": name,
            "hex": str(item.get("hex") or "#f7f7f7").strip() or "#f7f7f7",
        })
    return records


def normalize_materials(source):
    records = []
    seen = set()
    for item in source["materials"]:
        name = str(item.get("name") if isinstance(item, dict) else item or "").strip()
        if not name or name.lower() in seen:
            continue
        seen.add(name.lower())
        records.append({"id": stable_id("material", name), "name": name})
    return records


def product_status(product):
    text = " ".join(str(product.get(key) or "") for key in ("status", "availability", "state", "saleStatus")).lower()
    stock = int(float(product.get("stock") or 0))
    if product.get("archived") or "архив" in text:
        return "archive"
    if product.get("removedFromSale") or product.get("saleStopped") or "снят" in text:
        return "removed"
    if product.get("hasError") or product.get("error") or "ошиб" in text:
        return "errors"
    if product.get("needsWork") or product.get("inReview") or "доработ" in text or "подготов" in text:
        return "review"
    if stock > 0:
        return "sale"
    return "ready"


def product_media_records(source, product):
    product_id = str(product.get("id") or "")
    product_dir = source["katalog"] / "products" / product_id
    rows = []
    order = 0
    for kind, collection_name, folder_name in (
        ("image", "images", "images"),
        ("video", "videos", "videos"),
    ):
        for item in as_list(product.get(collection_name)):
            if not isinstance(item, dict):
                continue
            order += 1
            name = str(item.get("name") or "").strip()
            public_url = str(item.get("url") or "").strip()
            storage_path = str((product_dir / folder_name / name).relative_to(source["root"])) if name else ""
            file_path = source["root"] / storage_path if storage_path else None
            rows.append({
                "product_id": product_id,
                "kind": kind,
                "storage_path": storage_path.replace("\\", "/"),
                "public_url": public_url,
                "mime_type": str(item.get("type") or "").strip() or None,
                "original_name": name or None,
                "sort_order": order,
                "is_main": order == 1 and kind == "image",
                "size_bytes": file_path.stat().st_size if file_path and file_path.exists() else None,
            })
    return rows


def normalize_products(source, brands, categories):
    _, by_category_name, _ = build_category_lookup(source["categories"])
    brand_by_name = {item["name"].lower(): item["id"] for item in brands}
    rows = []
    media = []
    issues = []

    for product in source["products"]:
        if not isinstance(product, dict):
            issues.append({"type": "invalid_product", "value": product})
            continue
        product_id = str(product.get("id") or "").strip()
        name = str(product.get("name") or "").strip()
        if not product_id or not name:
            issues.append({"type": "missing_product_identity", "id": product_id, "name": name})
            continue

        brand_name = str(product.get("brand") or "").strip()
        category_name = str(product.get("category") or "").strip()
        category = by_category_name.get(category_name, [None])[0]

        rows.append({
            "id": product_id,
            "brand_id": brand_by_name.get(brand_name.lower()),
            "category_id": category.get("id") if category else None,
            "name": name,
            "assortment": str(product.get("assortment") or name).strip(),
            "article": str(product.get("wb") or product.get("marketplaceSku") or "").strip() or None,
            "seller_article": str(product.get("seller") or "").strip() or None,
            "barcode": str(product.get("barcode") or "").strip() or None,
            "marketplace_sku": str(product.get("marketplaceSku") or "").strip() or None,
            "status": product_status(product),
            "availability": str(product.get("availability") or "").strip() or None,
            "stock": int(float(product.get("stock") or 0)),
            "purchase_price": float(product.get("purchasePrice") or 0),
            "sale_price": float(product.get("salePrice") or 0),
            "manufacturer": str(product.get("manufacturer") or "").strip() or None,
            "season": str(product.get("season") or "").strip() or None,
            "color": str(product.get("color") or "").strip() or None,
            "sizes": str(product.get("sizes") or "").strip() or None,
            "removed_reason": str(product.get("removedReason") or "").strip() or None,
            "raw": product,
            "created_at": parse_dt(product.get("createdAt")),
            "updated_at": parse_dt(product.get("updatedAt")),
        })
        media.extend(product_media_records(source, product))

        if category_name and not category:
            issues.append({"type": "unmatched_product_category", "productId": product_id, "category": category_name})
        if brand_name and brand_name.lower() not in brand_by_name:
            issues.append({"type": "unmatched_product_brand", "productId": product_id, "brand": brand_name})

    return rows, media, issues


def normalize_backup_items(source):
    rows = []
    for backup_type, items in source["backups"].items():
        for item in items:
            if not isinstance(item, dict):
                continue
            backup_id = str(item.get("backupId") or "").strip()
            if not backup_id:
                backup_id = stable_id(f"backup-{backup_type}", item.get("name") or item.get("originalId"))
            rows.append({
                "id": backup_id,
                "backup_type": backup_type,
                "original_id": str(item.get("originalId") or "").strip() or None,
                "title": str(item.get("name") or item.get("title") or "").strip() or None,
                "payload": item,
                "archive_path": str(item.get("archivePath") or "").strip() or None,
                "deleted_at": parse_dt(item.get("deletedAt")),
            })
    return rows


def build_plan(source_root):
    source = load_source(source_root)
    brands = normalize_brands(source)
    categories = normalize_categories(source)
    colors = normalize_colors(source)
    materials = normalize_materials(source)
    products, media, product_issues = normalize_products(source, brands, categories)
    backups = normalize_backup_items(source)

    duplicate_counts = {
        "brandIds": [key for key, count in Counter(item["id"] for item in brands).items() if count > 1],
        "categoryIds": [key for key, count in Counter(item["id"] for item in categories).items() if count > 1],
        "productIds": [key for key, count in Counter(item["id"] for item in products).items() if count > 1],
        "barcodes": [key for key, count in Counter(item["barcode"] for item in products if item["barcode"]).items() if count > 1],
    }

    issues = {
        "products": product_issues,
        "duplicates": {key: value for key, value in duplicate_counts.items() if value},
    }

    return {
        "sourceRoot": str(Path(source_root).resolve()),
        "records": {
            "brands": brands,
            "categories": categories,
            "colors": colors,
            "materials": materials,
            "products": products,
            "productMedia": media,
            "backupItems": backups,
        },
        "counts": {
            "brands": len(brands),
            "categories": len(categories),
            "colors": len(colors),
            "materials": len(materials),
            "products": len(products),
            "productMedia": len(media),
            "backupItems": len(backups),
        },
        "issues": issues,
    }


def import_psycopg():
    try:
        import psycopg  # type: ignore
        return "psycopg", psycopg
    except ImportError:
        pass
    try:
        import psycopg2  # type: ignore
        return "psycopg2", psycopg2
    except ImportError as exc:
        raise RuntimeError(
            "PostgreSQL driver is not installed. Install psycopg or psycopg2 before running --apply."
        ) from exc


def execute_schema(cursor, schema_path):
    sql = Path(schema_path).read_text(encoding="utf-8")
    cursor.execute(sql)


def upsert_many(cursor, sql, rows):
    for row in rows:
        cursor.execute(sql, row)


def apply_plan(plan, database_url, schema_path=None):
    driver_name, driver = import_psycopg()
    connection = driver.connect(database_url)
    try:
        with connection:
            with connection.cursor() as cursor:
                if schema_path:
                    execute_schema(cursor, schema_path)

                records = plan["records"]
                upsert_many(cursor, SQL["brands"], records["brands"])
                upsert_many(cursor, SQL["categories"], records["categories"])
                upsert_many(cursor, SQL["colors"], records["colors"])
                upsert_many(cursor, SQL["materials"], records["materials"])
                upsert_many(cursor, SQL["products"], [
                    {**row, "raw": to_jsonb(row["raw"])} for row in records["products"]
                ])
                upsert_many(cursor, SQL["product_media"], records["productMedia"])
                upsert_many(cursor, SQL["backup_items"], [
                    {**row, "payload": to_jsonb(row["payload"])} for row in records["backupItems"]
                ])
    finally:
        connection.close()
    return {"driver": driver_name, "applied": plan["counts"]}


SQL = {
    "brands": """
        INSERT INTO brands (id, name, source, created_at, updated_at)
        VALUES (%(id)s, %(name)s, %(source)s, COALESCE(%(created_at)s, now()), now())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          source = EXCLUDED.source,
          updated_at = now()
    """,
    "categories": """
        INSERT INTO categories (
          id, parent_id, name, path, depth, sort_order, priority_group,
          active, show_home, external_code, source, created_at, updated_at
        )
        VALUES (
          %(id)s, %(parent_id)s, %(name)s, %(path)s, %(depth)s, %(sort_order)s,
          %(priority_group)s, %(active)s, %(show_home)s, %(external_code)s,
          %(source)s, COALESCE(%(created_at)s, now()), now()
        )
        ON CONFLICT (id) DO UPDATE SET
          parent_id = EXCLUDED.parent_id,
          name = EXCLUDED.name,
          path = EXCLUDED.path,
          depth = EXCLUDED.depth,
          sort_order = EXCLUDED.sort_order,
          priority_group = EXCLUDED.priority_group,
          active = EXCLUDED.active,
          show_home = EXCLUDED.show_home,
          external_code = EXCLUDED.external_code,
          source = EXCLUDED.source,
          updated_at = now()
    """,
    "colors": """
        INSERT INTO colors (id, name, hex, created_at, updated_at)
        VALUES (%(id)s, %(name)s, %(hex)s, now(), now())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          hex = EXCLUDED.hex,
          updated_at = now()
    """,
    "materials": """
        INSERT INTO materials (id, name, created_at, updated_at)
        VALUES (%(id)s, %(name)s, now(), now())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          updated_at = now()
    """,
    "products": """
        INSERT INTO products (
          id, brand_id, category_id, name, assortment, article, seller_article,
          barcode, marketplace_sku, status, availability, stock, purchase_price,
          sale_price, manufacturer, season, color, sizes, removed_reason, raw,
          created_at, updated_at
        )
        VALUES (
          %(id)s, %(brand_id)s, %(category_id)s, %(name)s, %(assortment)s,
          %(article)s, %(seller_article)s, %(barcode)s, %(marketplace_sku)s,
          %(status)s, %(availability)s, %(stock)s, %(purchase_price)s,
          %(sale_price)s, %(manufacturer)s, %(season)s, %(color)s, %(sizes)s,
          %(removed_reason)s, %(raw)s::jsonb, COALESCE(%(created_at)s, now()),
          COALESCE(%(updated_at)s, now())
        )
        ON CONFLICT (id) DO UPDATE SET
          brand_id = EXCLUDED.brand_id,
          category_id = EXCLUDED.category_id,
          name = EXCLUDED.name,
          assortment = EXCLUDED.assortment,
          article = EXCLUDED.article,
          seller_article = EXCLUDED.seller_article,
          barcode = EXCLUDED.barcode,
          marketplace_sku = EXCLUDED.marketplace_sku,
          status = EXCLUDED.status,
          availability = EXCLUDED.availability,
          stock = EXCLUDED.stock,
          purchase_price = EXCLUDED.purchase_price,
          sale_price = EXCLUDED.sale_price,
          manufacturer = EXCLUDED.manufacturer,
          season = EXCLUDED.season,
          color = EXCLUDED.color,
          sizes = EXCLUDED.sizes,
          removed_reason = EXCLUDED.removed_reason,
          raw = EXCLUDED.raw,
          updated_at = now()
    """,
    "product_media": """
        INSERT INTO product_media (
          product_id, kind, storage_path, public_url, mime_type, original_name,
          sort_order, is_main, size_bytes, created_at
        )
        VALUES (
          %(product_id)s, %(kind)s, %(storage_path)s, %(public_url)s,
          %(mime_type)s, %(original_name)s, %(sort_order)s, %(is_main)s,
          %(size_bytes)s, now()
        )
        ON CONFLICT (product_id, kind, sort_order) DO UPDATE SET
          storage_path = EXCLUDED.storage_path,
          public_url = EXCLUDED.public_url,
          mime_type = EXCLUDED.mime_type,
          original_name = EXCLUDED.original_name,
          is_main = EXCLUDED.is_main,
          size_bytes = EXCLUDED.size_bytes
    """,
    "backup_items": """
        INSERT INTO backup_items (
          id, backup_type, original_id, title, payload, archive_path, deleted_at
        )
        VALUES (
          %(id)s, %(backup_type)s, %(original_id)s, %(title)s, %(payload)s::jsonb,
          %(archive_path)s, COALESCE(%(deleted_at)s, now())
        )
        ON CONFLICT (id) DO UPDATE SET
          backup_type = EXCLUDED.backup_type,
          original_id = EXCLUDED.original_id,
          title = EXCLUDED.title,
          payload = EXCLUDED.payload,
          archive_path = EXCLUDED.archive_path
    """,
}


def public_report(plan):
    return {
        "sourceRoot": plan["sourceRoot"],
        "counts": plan["counts"],
        "issues": plan["issues"],
        "samples": {
            "brands": plan["records"]["brands"][:3],
            "categories": plan["records"]["categories"][:3],
            "products": [
                {
                    "id": item["id"],
                    "name": item["name"],
                    "brand_id": item["brand_id"],
                    "category_id": item["category_id"],
                    "barcode": item["barcode"],
                    "status": item["status"],
                }
                for item in plan["records"]["products"][:3]
            ],
            "productMedia": plan["records"]["productMedia"][:3],
        },
    }


def main():
    parser = argparse.ArgumentParser(description="Migrate The Champ file data into PostgreSQL.")
    parser.add_argument("--source", default="D:\\thechamp", help="Project/data root to read. Default: D:\\thechamp")
    parser.add_argument("--database-url", help="PostgreSQL connection string. Required with --apply.")
    parser.add_argument("--schema", default="database/schema.sql", help="Schema SQL path used with --create-schema.")
    parser.add_argument("--create-schema", action="store_true", help="Run schema.sql before importing.")
    parser.add_argument("--apply", action="store_true", help="Write to PostgreSQL. Without this, the script is dry-run only.")
    parser.add_argument("--write-report", help="Optional JSON report path.")
    args = parser.parse_args()

    plan = build_plan(args.source)
    report = public_report(plan)
    report["mode"] = "apply" if args.apply else "dry-run"

    has_issues = any(plan["issues"].get(key) for key in plan["issues"])
    if args.apply:
        if has_issues:
            report["applied"] = False
            report["error"] = "Migration issues exist. Fix them or run dry-run to inspect the report first."
        elif not args.database_url:
            report["applied"] = False
            report["error"] = "--database-url is required with --apply."
        else:
            report["postgres"] = apply_plan(
                plan,
                args.database_url,
                schema_path=args.schema if args.create_schema else None,
            )
            report["applied"] = True

    text = json.dumps(report, ensure_ascii=False, indent=2, default=str)
    print(text)

    if args.write_report:
        output = Path(args.write_report)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(text + "\n", encoding="utf-8")

    if args.apply and (report.get("error") or not report.get("applied")):
        sys.exit(1)
    if has_issues:
        sys.exit(2)


if __name__ == "__main__":
    main()
