import argparse
import json
from pathlib import Path


def category_priority(item):
    text = " / ".join(
        str(item.get(key, ""))
        for key in ("path", "parent", "name")
        if item.get(key)
    ).lower()
    if "женщинам" in text or "женская" in text or "для женщин" in text:
        return 1
    if "мужчинам" in text or "мужская" in text or "для мужчин" in text:
        return 2
    if "девочкам" in text or "девочки" in text or "для девочек" in text:
        return 3
    if "мальчикам" in text or "мальчики" in text or "для мальчиков" in text:
        return 4
    return 50


def category_key(item):
    priority = category_priority(item)
    path = str(item.get("path") or f"{item.get('parent', '')} / {item.get('name', '')}").lower()
    old_sort = int(item.get("sortOrder") or 0)
    return priority, old_sort, path


def update_root(root):
    categories_file = Path(root) / "katalog" / "Категории" / "categories.json"
    items = json.loads(categories_file.read_text(encoding="utf-8-sig"))
    items.sort(key=category_key)
    for index, item in enumerate(items, 1):
        item["sortOrder"] = index
        item["priorityGroup"] = category_priority(item)
    categories_file.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    return categories_file, len(items)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", action="append", required=True)
    args = parser.parse_args()
    for root in args.root:
        path, count = update_root(root)
        print(f"{path}: {count}")


if __name__ == "__main__":
    main()
