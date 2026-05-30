import argparse
import hashlib
import json
import re
import urllib.request
from datetime import datetime
from pathlib import Path


WB_MENU_URL = "https://static-basket-01.wbbasket.ru/vol0/data/main-menu-ru-ru-v2.json"


def safe_folder_name(value):
    cleaned = re.sub(r'[<>:"/\\|?*]+', "-", value.strip())
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" .")
    return cleaned[:90] or "category"


def wb_id(raw_id, path):
    base = str(raw_id or "/".join(path))
    return "wb-" + hashlib.sha1(base.encode("utf-8")).hexdigest()[:16]


def walk_categories(items, parent_name="Без категории", parent_id="", depth=0, path=None):
    path = path or []
    rows = []

    for index, item in enumerate(items):
        name = str(item.get("name", "")).strip()
        if not name:
            continue

        next_path = [*path, name]
        item_id = wb_id(item.get("id"), next_path)
        url = str(item.get("url", "")).strip()
        category = {
            "id": item_id,
            "name": name,
            "url": f"https://www.the-champ.ru{url}" if url.startswith("/") else url,
            "parent": parent_name,
            "parentId": parent_id,
            "oneCId": str(item.get("id", "0") or "0"),
            "sortOrder": depth * 100000 + index + 1,
            "active": True,
            "showHome": depth == 0,
            "mainImageName": "",
            "iconName": "",
            "source": "the-champ",
            "wbId": item.get("id"),
            "wbShard": item.get("shard"),
            "wbQuery": item.get("query"),
            "path": " / ".join(next_path),
            "createdAt": datetime.now().isoformat(timespec="seconds"),
        }
        rows.append(category)
        children = item.get("childs") or item.get("children") or []
        if children:
            rows.extend(walk_categories(children, name, item_id, depth + 1, next_path))

    return rows


def load_existing(path):
    if not path.exists():
        return []
    try:
        return json.loads(path.read_text(encoding="utf-8-sig"))
    except json.JSONDecodeError:
        return []


def write_categories(root, categories):
    categories_dir = root / "katalog" / "Категории"
    categories_dir.mkdir(parents=True, exist_ok=True)
    categories_file = categories_dir / "categories.json"
    existing = load_existing(categories_file)
    manual = [item for item in existing if item.get("source") != "the-champ"]
    merged = manual + categories
    categories_file.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")

    wb_dir = categories_dir / "The Champ"
    wb_dir.mkdir(parents=True, exist_ok=True)
    for category in categories:
        folder = wb_dir / safe_folder_name(f"{category['wbId'] or category['id']} {category['name']}")
        folder.mkdir(parents=True, exist_ok=True)
        (folder / "category.json").write_text(json.dumps(category, ensure_ascii=False, indent=2), encoding="utf-8")

    return len(manual), len(categories), categories_file


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", action="append", required=True)
    args = parser.parse_args()

    request = urllib.request.Request(WB_MENU_URL, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
    with urllib.request.urlopen(request, timeout=45) as response:
        menu = json.loads(response.read().decode("utf-8-sig"))

    categories = walk_categories(menu)
    for root_value in args.root:
        manual_count, wb_count, categories_file = write_categories(Path(root_value), categories)
        print(f"{categories_file}: manual={manual_count} the-champ={wb_count}")


if __name__ == "__main__":
    main()
