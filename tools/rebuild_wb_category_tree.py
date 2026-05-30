import argparse
import json
import re
import shutil
from pathlib import Path


def safe_folder_name(value):
    cleaned = re.sub(r'[<>:"/\\|?*]+', "-", str(value).strip())
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" .")
    return cleaned or "category"


def unique_folder(parent, name, wb_id):
    folder_name = safe_folder_name(name)
    candidate = parent / folder_name
    if not candidate.exists():
        return candidate
    marker = parent / folder_name / "category.json"
    if marker.exists():
        try:
            existing = json.loads(marker.read_text(encoding="utf-8-sig"))
            if str(existing.get("id")) == str(wb_id):
                return candidate
        except json.JSONDecodeError:
            pass
    return parent / safe_folder_name(f"{folder_name} {wb_id}")


def load_wb_categories(categories_file):
    items = json.loads(categories_file.read_text(encoding="utf-8-sig"))
    return [item for item in items if item.get("source") == "the-champ"]


def clear_category_dirs(categories_dir):
    for item in categories_dir.iterdir():
        if item.is_dir():
            shutil.rmtree(item)


def build_tree(categories_dir, categories):
    by_parent = {}
    by_id = {str(item.get("id")): item for item in categories}
    for item in categories:
        parent = str(item.get("parentId") or "")
        by_parent.setdefault(parent, []).append(item)

    for group in by_parent.values():
        group.sort(key=lambda item: (int(item.get("sortOrder") or 0), str(item.get("name", "")).lower()))

    created = 0

    def walk(parent_id, parent_folder, visited):
        nonlocal created
        for item in by_parent.get(parent_id, []):
            item_id = str(item.get("id"))
            if item_id in visited:
                continue
            folder = unique_folder(parent_folder, item.get("name", "category"), item_id)
            folder.mkdir(parents=True, exist_ok=True)
            item = {**item, "folderPath": str(folder)}
            (folder / "category.json").write_text(json.dumps(item, ensure_ascii=False, indent=2), encoding="utf-8")
            created += 1
            walk(item_id, folder, visited | {item_id})

    root_ids = {"", "Без категории"}
    known_ids = set(by_id)
    orphan_roots = [item for item in categories if str(item.get("parentId") or "") not in known_ids]
    for item in orphan_roots:
        by_parent.setdefault("", [])
        if item not in by_parent[""]:
            by_parent[""].append(item)

    walk("", categories_dir, set())
    walk("Без категории", categories_dir, set())
    return created


def rebuild(root):
    categories_dir = Path(root) / "katalog" / "Категории"
    categories_file = categories_dir / "categories.json"
    categories_dir.mkdir(parents=True, exist_ok=True)
    categories = load_wb_categories(categories_file)
    clear_category_dirs(categories_dir)
    categories_file.write_text(json.dumps(categories, ensure_ascii=False, indent=2), encoding="utf-8")
    created = build_tree(categories_dir, categories)
    return categories_file, len(categories), created


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", action="append", required=True)
    args = parser.parse_args()

    for root in args.root:
        categories_file, total, created = rebuild(root)
        print(f"{categories_file}: the-champ={total} folders={created}")


if __name__ == "__main__":
    main()
