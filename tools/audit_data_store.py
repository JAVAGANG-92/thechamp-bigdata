import argparse
import json
from pathlib import Path


def read_json(path, default):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return {"__error__": str(exc), "__path__": str(path)}


def as_list(value):
    return value if isinstance(value, list) else []


def audit(root):
    root = Path(root)
    katalog = root / "katalog"
    products = as_list(read_json(katalog / "products.json", []))
    categories = as_list(read_json(katalog / "Категории" / "categories.json", []))
    colors = as_list(read_json(katalog / "Цвета" / "colors.json", []))
    materials = as_list(read_json(katalog / "Материалы" / "materials.json", []))
    brands = as_list(read_json(katalog / "Бренды" / "brands.json", []))

    product_dirs = sorted((katalog / "products").glob("*")) if (katalog / "products").exists() else []
    media_files = []
    product_issues = []
    product_ids = {str(item.get("id")) for item in products if isinstance(item, dict)}

    for product in products:
        if not isinstance(product, dict):
            product_issues.append({"type": "invalid_product_record", "value": product})
            continue
        product_id = str(product.get("id") or "")
        if not product_id:
            product_issues.append({"type": "missing_product_id", "name": product.get("name")})
            continue
        product_dir = katalog / "products" / product_id
        if not product_dir.exists():
            product_issues.append({"type": "missing_product_folder", "id": product_id, "name": product.get("name")})
        if not product.get("name"):
            product_issues.append({"type": "missing_product_name", "id": product_id})
        if not product.get("barcode"):
            product_issues.append({"type": "missing_barcode", "id": product_id, "name": product.get("name")})

    for product_dir in product_dirs:
        if not product_dir.is_dir():
            continue
        if product_dir.name not in product_ids:
            product_issues.append({"type": "orphan_product_folder", "id": product_dir.name})
        for media_dir_name in ("images", "videos"):
            media_dir = product_dir / media_dir_name
            if media_dir.exists():
                for item in media_dir.iterdir():
                    if item.is_file():
                        media_files.append({
                            "productId": product_dir.name,
                            "kind": "image" if media_dir_name == "images" else "video",
                            "path": str(item.relative_to(root)),
                            "bytes": item.stat().st_size,
                        })

    backup_root = root / "BuckUp"
    backups = {
        "products": len(as_list(read_json(backup_root / "Product" / "deleted-products.json", []))),
        "files": len(as_list(read_json(backup_root / "File" / "deleted-files.json", []))),
        "blogs": len(as_list(read_json(backup_root / "Blog" / "deleted-blogs.json", []))),
        "free": len(as_list(read_json(backup_root / "Free" / "deleted-free.json", []))),
    }

    duplicate_category_ids = sorted({
        item.get("id") for item in categories
        if isinstance(item, dict) and sum(1 for other in categories if isinstance(other, dict) and other.get("id") == item.get("id")) > 1
    })

    return {
        "root": str(root),
        "counts": {
            "products": len(products),
            "productFolders": len([item for item in product_dirs if item.is_dir()]),
            "productMediaFiles": len(media_files),
            "categories": len(categories),
            "colors": len(colors),
            "materials": len(materials),
            "brands": len(brands),
            "backups": backups,
        },
        "issues": {
            "products": product_issues,
            "duplicateCategoryIds": duplicate_category_ids,
        },
        "mediaFiles": media_files,
    }


def main():
    parser = argparse.ArgumentParser(description="Audit The Champ JSON/file datastore before database migration.")
    parser.add_argument("--root", default=".", help="Project root to audit.")
    parser.add_argument("--write-report", help="Optional JSON report path.")
    args = parser.parse_args()

    report = audit(args.root)
    text = json.dumps(report, ensure_ascii=False, indent=2)
    print(text)
    if args.write_report:
        output = Path(args.write_report)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(text + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
