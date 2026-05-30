import base64
import json
import os
import re
import shutil
import secrets
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parent
ENV_FILE = ROOT / ".env"


def load_env_file(path):
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8-sig").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


load_env_file(ENV_FILE)

PUBLIC = ROOT / "public"
DATA_ROOT = Path(os.environ.get("THECHAMP_DATA_ROOT") or ROOT).resolve()
CATALOG_DIR = DATA_ROOT / "katalog"
PORT = int(os.environ.get("THECHAMP_PORT", "4173"))

CATEGORIES_DIR = CATALOG_DIR / "Категории"
CATEGORIES_FILE = CATEGORIES_DIR / "categories.json"
COLORS_DIR = CATALOG_DIR / "Цвета"
COLORS_FILE = COLORS_DIR / "colors.json"
MATERIALS_DIR = CATALOG_DIR / "Материалы"
MATERIALS_FILE = MATERIALS_DIR / "materials.json"
BRANDS_DIR = CATALOG_DIR / "Бренды"
BRANDS_FILE = BRANDS_DIR / "brands.json"
PRODUCTS_FILE = CATALOG_DIR / "products.json"
PRODUCTS_DIR = CATALOG_DIR / "products"
BACKUP_DIR = DATA_ROOT / "BuckUp"
BACKUP_PRODUCT_DIR = BACKUP_DIR / "Product"
BACKUP_FILE_DIR = BACKUP_DIR / "File"
BACKUP_BLOG_DIR = BACKUP_DIR / "Blog"
BACKUP_FREE_DIR = BACKUP_DIR / "Free"
BACKUP_PRODUCTS_FILE = BACKUP_PRODUCT_DIR / "deleted-products.json"
BACKUP_FILES_FILE = BACKUP_FILE_DIR / "deleted-files.json"
BACKUP_BLOGS_FILE = BACKUP_BLOG_DIR / "deleted-blogs.json"
BACKUP_FREE_FILE = BACKUP_FREE_DIR / "deleted-free.json"

DEFAULT_PRODUCTS = []

STATE = {
    "integrations": [
        {"id": "champ-seller", "name": "The Champ Seller", "status": "connected", "mode": "FBO/FBS", "lastSync": "2026-05-27 09:30", "orders": 184, "stockDelta": -12},
        {"id": "champ-store", "name": "The Champ Store", "status": "connected", "mode": "FBO/FBS", "lastSync": "2026-05-27 09:22", "orders": 231, "stockDelta": 34},
        {"id": "yandex", "name": "Яндекс Маркет", "status": "pending", "mode": "DBS", "lastSync": "Ожидает подключения", "orders": 0, "stockDelta": 0},
        {"id": "trendyol", "name": "Trendyol", "status": "draft", "mode": "API", "lastSync": "Требуется настройка", "orders": 0, "stockDelta": 0},
    ],
    "modules": [
        {"id": "warehouse", "name": "Умный склад", "group": "Операции", "progress": 76, "health": "good", "metric": "1 248 SKU", "tags": ["Сборка", "Упаковка", "Адресное хранение", "Видео-контроль"]},
        {"id": "finance-ai", "name": "AI-финансовый директор", "group": "Финансы", "progress": 68, "health": "good", "metric": "18,4% прибыли", "tags": ["ОПиУ", "ДДС", "BI", "ABC-анализ"]},
        {"id": "planner-ai", "name": "AI-планировщик", "group": "Поставки", "progress": 61, "health": "warn", "metric": "14 дней запаса", "tags": ["Снабжение", "Закупки", "Поставщики", "Расходы"]},
        {"id": "pim", "name": "PIM-система", "group": "Товары", "progress": 82, "health": "good", "metric": "934 карточки", "tags": ["Импорт", "Создание", "Редактирование", "Аналитика"]},
        {"id": "marking", "name": "Маркировка", "group": "Соответствие", "progress": 55, "health": "warn", "metric": "2 180 кодов", "tags": ["Получение кодов", "Повторная печать", "УПД", "Маркетплейсы"]},
        {"id": "sales", "name": "Управление продажами", "group": "Торговля", "progress": 73, "health": "good", "metric": "415 заказов", "tags": ["Карточки", "Цены", "Акции", "Возвраты"]},
        {"id": "one-c", "name": "Интеграция с 1С", "group": "Бухгалтерия", "progress": 49, "health": "warn", "metric": "3 очереди", "tags": ["Отчеты", "Автоматизация", "Остатки", "Документы"]},
        {"id": "access", "name": "Центр доступа", "group": "Безопасность", "progress": 91, "health": "good", "metric": "12 пользователей", "tags": ["Роли", "Доступ к магазинам", "Аудит", "2FA"]},
    ],
    "apiEvents": [
        {"time": "09:31", "source": "The Champ", "type": "orders.pull", "status": 200, "detail": "Получено 63 новых заказа"},
        {"time": "09:29", "source": "The Champ", "type": "stock.push", "status": 200, "detail": "Обновлено 214 остатков"},
        {"time": "09:27", "source": "PIM", "type": "products.normalize", "status": 200, "detail": "Обогащено 18 карточек"},
        {"time": "09:24", "source": "Маркировка", "type": "codes.print", "status": 202, "detail": "Добавлено в очередь печати"},
    ],
}


def safe_folder_name(value):
    cleaned = re.sub(r'[<>:"/\\|?*]+', "-", str(value).strip())
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" .")
    return cleaned or "item"


def read_json(path, default):
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        write_json(path, default)
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8-sig"))
    except json.JSONDecodeError:
        backup = path.with_suffix(path.suffix + f".broken-{datetime.now().strftime('%Y%m%d%H%M%S')}")
        path.replace(backup)
        write_json(path, default)
        return default


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    temp.replace(path)


def read_saved_categories():
    return read_json(CATEGORIES_FILE, [])


def write_saved_categories(items):
    write_json(CATEGORIES_FILE, items)


def read_catalog_colors():
    COLORS_DIR.mkdir(parents=True, exist_ok=True)
    colors = read_json(COLORS_FILE, [])
    by_name = {str(item.get("name", "")).strip(): item for item in colors if isinstance(item, dict)}

    for item in COLORS_DIR.iterdir():
        if not item.is_dir():
            continue
        color_file = item / "color.json"
        color = read_json(color_file, {"name": item.name, "hex": "#f7f7f7"})
        by_name[color.get("name") or item.name] = color

    merged = sorted(by_name.values(), key=lambda color: str(color.get("name", "")).lower())
    write_json(COLORS_FILE, merged)
    return merged


def normalize_brand_name(value):
    return re.sub(r"\s+", " ", str(value or "").strip())


def read_catalog_brands():
    BRANDS_DIR.mkdir(parents=True, exist_ok=True)
    products = read_products()
    stored = read_json(BRANDS_FILE, [])
    by_name = {}

    for item in stored:
        if isinstance(item, dict):
            name = normalize_brand_name(item.get("name"))
            if name:
                by_name[name.lower()] = {**item, "name": name}
        else:
            name = normalize_brand_name(item)
            if name:
                by_name[name.lower()] = {"id": safe_folder_name(name).lower(), "name": name, "source": "manual"}

    for product in products:
        name = normalize_brand_name(product.get("brand"))
        if not name:
            continue
        key = name.lower()
        if key not in by_name:
            by_name[key] = {
                "id": safe_folder_name(name).lower(),
                "name": name,
                "source": "product",
                "createdAt": product.get("createdAt") or datetime.now().isoformat(timespec="seconds"),
            }

    brands = sorted(by_name.values(), key=lambda item: item["name"].lower())
    for brand in brands:
        brand_dir = BRANDS_DIR / safe_folder_name(brand["name"])
        brand_dir.mkdir(parents=True, exist_ok=True)
        write_json(brand_dir / "brand.json", brand)
    write_json(BRANDS_FILE, brands)
    return brands


def save_catalog_brand(name):
    name = normalize_brand_name(name)
    if not name:
        return None, read_catalog_brands()

    brands = read_catalog_brands()
    existing = {item["name"].lower(): item for item in brands}
    if name.lower() not in existing:
        brand = {
            "id": secrets.token_hex(8),
            "name": name,
            "source": "manual",
            "createdAt": datetime.now().isoformat(timespec="seconds"),
        }
        brands.append(brand)
        brands = sorted(brands, key=lambda item: item["name"].lower())
        write_json(BRANDS_FILE, brands)
        brand_dir = BRANDS_DIR / safe_folder_name(name)
        brand_dir.mkdir(parents=True, exist_ok=True)
        write_json(brand_dir / "brand.json", brand)
        return brand, brands

    return existing[name.lower()], brands


def read_catalog():
    CATALOG_DIR.mkdir(parents=True, exist_ok=True)
    categories_file = CATALOG_DIR / "categories.json"
    sections = [
        {"name": item.name, "icon": "/assets/icon-folder.svg"}
        for item in CATALOG_DIR.iterdir()
        if item.is_dir() and item.name != "imports"
    ]
    return {
        "products": read_products(),
        "categories": read_json(categories_file, []),
        "sections": sorted(sections, key=lambda item: item["name"]),
    }


def normalize_product(body, existing_id=None):
    now = datetime.now().isoformat(timespec="seconds")
    product_id = existing_id or str(body.get("id") or secrets.token_hex(8))
    marketplace_article = str(body.get("wb") or f"{int(datetime.now().timestamp() * 1000)}{secrets.randbelow(100000):05d}")[:20]
    return {
        "id": product_id,
        "image": str(body.get("image") or "/assets/icon-folder.svg"),
        "name": str(body.get("name") or "Новый товар").strip(),
        "assortment": str(body.get("assortment") or body.get("name") or "Название товара").strip(),
        "category": str(body.get("category") or "Без категории").strip(),
        "stock": int(float(body.get("stock") or 0)),
        "purchasePrice": float(body.get("purchasePrice") or 0),
        "salePrice": float(body.get("salePrice") or 0),
        "brand": str(body.get("brand") or "The Champ").strip(),
        "manufacturer": str(body.get("manufacturer") or "The Champ").strip(),
        "season": str(body.get("season") or "Всесезонный").strip(),
        "availability": str(body.get("availability") or "Доступны к продаже").strip(),
        "barcode": str(body.get("barcode") or "").strip(),
        "wb": marketplace_article,
        "seller": str(body.get("seller") or f"TC-{product_id[:6].upper()}").strip(),
        "color": str(body.get("color") or "—").strip(),
        "sizes": str(body.get("sizes") or "—").strip(),
        "marketplaceSku": str(body.get("marketplaceSku") or marketplace_article).strip(),
        "createdAt": str(body.get("createdAt") or now),
        "updatedAt": now,
    }


def extension_for_media(name, mime_type):
    suffix = Path(str(name or "")).suffix.lower()
    if suffix and re.fullmatch(r"\.[a-z0-9]{1,8}", suffix):
        return suffix
    if str(mime_type).startswith("video/"):
        return ".mp4"
    if mime_type == "image/png":
        return ".png"
    if mime_type == "image/webp":
        return ".webp"
    return ".jpg"


def save_product_files(product, media_items):
    product_dir = PRODUCTS_DIR / safe_folder_name(product["id"])
    images_dir = product_dir / "images"
    videos_dir = product_dir / "videos"
    images_dir.mkdir(parents=True, exist_ok=True)
    videos_dir.mkdir(parents=True, exist_ok=True)

    images = []
    videos = []
    for index, media in enumerate(media_items or [], start=1):
        data_url = str(media.get("data", ""))
        if not data_url.startswith("data:") or "," not in data_url:
            continue
        header, encoded = data_url.split(",", 1)
        mime_type = header[5:].split(";")[0]
        kind = "video" if mime_type.startswith("video/") else "image"
        ext = extension_for_media(media.get("name"), mime_type)
        target_dir = videos_dir if kind == "video" else images_dir
        filename = f"{index:03d}-{safe_folder_name(media.get('name') or kind)}"
        if not filename.lower().endswith(ext):
            filename += ext
        target = target_dir / filename
        target.write_bytes(base64.b64decode(encoded))
        url = f"/api/catalog/product-media/{product['id']}/{kind}s/{filename}"
        if kind == "video":
            videos.append({"name": filename, "url": url, "type": mime_type})
        else:
            images.append({"name": filename, "url": url, "type": mime_type})

    product["images"] = images
    product["videos"] = videos
    if images:
        product["image"] = images[0]["url"]
    write_json(product_dir / "product.json", product)
    return product


def read_products():
    items = read_json(PRODUCTS_FILE, DEFAULT_PRODUCTS)
    return [
        item for item in items
        if isinstance(item, dict) and item.get("id") not in {"tc-001", "tc-002", "tc-003"}
    ]


def write_products(items):
    write_json(PRODUCTS_FILE, items)


def ensure_backup_dirs():
    for item in [BACKUP_PRODUCT_DIR, BACKUP_FILE_DIR, BACKUP_BLOG_DIR, BACKUP_FREE_DIR]:
        item.mkdir(parents=True, exist_ok=True)


def read_backup_items(path):
    ensure_backup_dirs()
    return read_json(path, [])


def write_backup_items(path, items):
    ensure_backup_dirs()
    write_json(path, items)


def backup_deleted_product(product):
    ensure_backup_dirs()
    backup_id = f"product-{datetime.now().strftime('%Y%m%d%H%M%S')}-{secrets.token_hex(4)}"
    product_id = str(product.get("id", ""))
    source_dir = PRODUCTS_DIR / safe_folder_name(product_id)
    archive_dir = BACKUP_PRODUCT_DIR / "items" / backup_id
    archived_files = False
    if source_dir.exists():
        archive_dir.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(source_dir, archive_dir, dirs_exist_ok=True)
        archived_files = True

    item = {
        "backupId": backup_id,
        "type": "product",
        "deletedAt": datetime.now().isoformat(timespec="seconds"),
        "originalId": product_id,
        "name": product.get("name") or "Новый товар",
        "article": product.get("seller") or product.get("marketplaceSku") or product_id,
        "category": product.get("category") or "Без категории",
        "payload": product,
        "archivedFiles": archived_files,
    }
    items = read_backup_items(BACKUP_PRODUCTS_FILE)
    items.insert(0, item)
    write_backup_items(BACKUP_PRODUCTS_FILE, items)
    free_items = read_backup_items(BACKUP_FREE_FILE)
    free_items.insert(0, item)
    write_backup_items(BACKUP_FREE_FILE, free_items)
    return item


def restore_deleted_products(backup_ids):
    backup_ids = {str(item) for item in backup_ids}
    items = read_backup_items(BACKUP_PRODUCTS_FILE)
    restore_items = [item for item in items if str(item.get("backupId")) in backup_ids]
    if not restore_items:
        return []

    products = read_products()
    by_id = {str(item.get("id")): item for item in products}
    for backup_item in reversed(restore_items):
        product = dict(backup_item.get("payload") or {})
        if not product.get("id"):
            product["id"] = backup_item.get("originalId") or secrets.token_hex(8)
        product["updatedAt"] = datetime.now().isoformat(timespec="seconds")
        by_id[str(product["id"])] = product

        archive_dir = BACKUP_PRODUCT_DIR / "items" / str(backup_item.get("backupId"))
        target_dir = PRODUCTS_DIR / safe_folder_name(product["id"])
        if archive_dir.exists():
            if target_dir.exists():
                shutil.rmtree(target_dir)
            shutil.copytree(archive_dir, target_dir, dirs_exist_ok=True)
            write_json(target_dir / "product.json", product)
        else:
            target_dir.mkdir(parents=True, exist_ok=True)
            write_json(target_dir / "product.json", product)

    restored_ids = {str(item.get("backupId")) for item in restore_items}
    write_products(list(by_id.values()))
    write_backup_items(BACKUP_PRODUCTS_FILE, [item for item in items if str(item.get("backupId")) not in restored_ids])
    free_items = read_backup_items(BACKUP_FREE_FILE)
    write_backup_items(BACKUP_FREE_FILE, [item for item in free_items if str(item.get("backupId")) not in restored_ids])
    return restore_items


class Handler(SimpleHTTPRequestHandler):
    server_version = "TheChampServer/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC), **kwargs)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, status, data):
        body = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json_body(self):
        length = int(self.headers.get("content-length", "0"))
        if length == 0:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def send_file_response(self, file_path):
        content_type = "application/octet-stream"
        suffix = file_path.suffix.lower()
        if suffix in {".jpg", ".jpeg"}:
            content_type = "image/jpeg"
        elif suffix == ".png":
            content_type = "image/png"
        elif suffix == ".webp":
            content_type = "image/webp"
        elif suffix == ".mp4":
            content_type = "video/mp4"
        data = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = urlparse(self.path).path
        if path.startswith("/api/catalog/product-media/"):
            relative = unquote(path.replace("/api/catalog/product-media/", "", 1))
            file_path = (PRODUCTS_DIR / relative).resolve()
            if PRODUCTS_DIR.resolve() in file_path.parents and file_path.exists() and file_path.is_file():
                self.send_file_response(file_path)
            else:
                self.send_json(404, {"ok": False, "message": "Файл не найден."})
            return

        if path == "/api/health":
            self.send_json(200, {
                "ok": True,
                "service": "The Champ",
                "time": datetime.now().isoformat(timespec="seconds"),
                "categories": len(read_saved_categories()),
            })
            return

        if path == "/api/dashboard":
            orders = sum(item["orders"] for item in STATE["integrations"])
            active = len([item for item in STATE["modules"] if item["health"] == "good"])
            self.send_json(200, {
                "stats": {"revenue": 284750, "orders": orders, "margin": 18.4, "activeModules": active, "syncHealth": 96},
                **STATE,
            })
            return

        if path == "/api/catalog":
            self.send_json(200, read_catalog())
            return

        if path == "/api/catalog/categories":
            self.send_json(200, {"categories": read_saved_categories()})
            return

        if path == "/api/catalog/colors":
            self.send_json(200, {"colors": read_catalog_colors()})
            return

        if path == "/api/catalog/materials":
            self.send_json(200, {"materials": read_json(MATERIALS_FILE, [])})
            return

        if path == "/api/catalog/brands":
            self.send_json(200, {"brands": read_catalog_brands()})
            return

        if path == "/api/catalog/products":
            self.send_json(200, {"products": read_products()})
            return

        if path == "/api/backup":
            self.send_json(200, {
                "products": read_backup_items(BACKUP_PRODUCTS_FILE),
                "files": read_backup_items(BACKUP_FILES_FILE),
                "blogs": read_backup_items(BACKUP_BLOGS_FILE),
                "free": read_backup_items(BACKUP_FREE_FILE),
            })
            return

        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            body = self.read_json_body()
        except json.JSONDecodeError:
            self.send_json(400, {"ok": False, "message": "Некорректный JSON."})
            return

        if path == "/api/login":
            if body.get("email") != "admin@materio.com" or body.get("password") != "admin":
                self.send_json(401, {"ok": False, "message": "Неверный email или пароль."})
                return
            self.send_json(200, {"ok": True, "token": secrets.token_hex(18), "user": {"name": "Администратор The Champ", "email": body["email"], "role": "Владелец"}})
            return

        if path == "/api/integrations/test":
            provider = body.get("provider", "custom")
            api_key = str(body.get("apiKey", ""))
            masked = f"{api_key[:4]}...{api_key[-3:]}" if api_key else "пусто"
            self.send_json(200, {"ok": True, "provider": provider, "maskedKey": masked, "message": f"Подключение API {provider} проверено. Боевые ключи нужно хранить в переменных окружения сервера."})
            return

        if path == "/api/sync":
            source = body.get("source", "Marketplace")
            STATE["apiEvents"].insert(0, {"time": datetime.now().strftime("%H:%M"), "source": source, "type": body.get("type", "manual.sync"), "status": 200, "detail": "Ручная синхронизация запущена"})
            self.send_json(202, {"ok": True, "message": f"Синхронизация для {source} запущена."})
            return

        if path == "/api/catalog/categories":
            name = str(body.get("name", "")).strip()
            if not name:
                self.send_json(400, {"ok": False, "message": "Укажите название категории."})
                return

            items = read_saved_categories()
            category = {
                "id": secrets.token_hex(8),
                "name": name,
                "url": str(body.get("url", "")).strip(),
                "parent": str(body.get("parent", "Без категории")).strip() or "Без категории",
                "oneCId": str(body.get("oneCId", "0")).strip() or "0",
                "sortOrder": int(body.get("sortOrder", 1) or 1),
                "active": bool(body.get("active", False)),
                "showHome": bool(body.get("showHome", False)),
                "mainImageName": str(body.get("mainImageName", "")).strip(),
                "iconName": str(body.get("iconName", "")).strip(),
                "source": "the-champ",
                "createdAt": datetime.now().isoformat(timespec="seconds"),
            }
            items.append(category)
            write_saved_categories(items)

            category_dir = CATEGORIES_DIR / safe_folder_name(name)
            category_dir.mkdir(parents=True, exist_ok=True)
            write_json(category_dir / "category.json", category)
            self.send_json(201, {"ok": True, "category": category})
            return

        if path == "/api/catalog/materials":
            name = str(body.get("name", "")).strip()
            if not name:
                self.send_json(400, {"ok": False, "message": "Укажите материал."})
                return
            materials = read_json(MATERIALS_FILE, [])
            if name not in materials:
                materials.append(name)
                materials = sorted(materials, key=lambda item: item.lower())
                write_json(MATERIALS_FILE, materials)
                material_dir = MATERIALS_DIR / safe_folder_name(name)
                material_dir.mkdir(parents=True, exist_ok=True)
                write_json(material_dir / "material.json", {"name": name})
            self.send_json(201, {"ok": True, "materials": materials})
            return

        if path == "/api/catalog/brands":
            brand, brands = save_catalog_brand(body.get("name", ""))
            if not brand:
                self.send_json(400, {"ok": False, "message": "Укажите название бренда."})
                return
            self.send_json(201, {"ok": True, "brand": brand, "brands": brands})
            return

        if path == "/api/catalog/products":
            product = normalize_product(body)
            product = save_product_files(product, body.get("media", []))
            save_catalog_brand(product.get("brand"))
            products = read_products()
            products = [item for item in products if item.get("id") != product["id"]]
            products.insert(0, product)
            write_products(products)
            self.send_json(201, {"ok": True, "product": product, "products": products})
            return

        if path == "/api/catalog/products/delete":
            ids = {str(item) for item in body.get("ids", [])}
            if not ids:
                self.send_json(400, {"ok": False, "message": "Выберите товары для удаления."})
                return
            current_products = read_products()
            for product in current_products:
                if str(product.get("id")) in ids:
                    backup_deleted_product(product)
            products = [item for item in current_products if str(item.get("id")) not in ids]
            for product_id in ids:
                product_dir = PRODUCTS_DIR / safe_folder_name(product_id)
                if product_dir.exists():
                    shutil.rmtree(product_dir)
            write_products(products)
            self.send_json(200, {"ok": True, "products": products, "deleted": len(ids)})
            return

        if path == "/api/backup/products/restore":
            restored = restore_deleted_products(body.get("ids", []))
            self.send_json(200, {
                "ok": True,
                "restored": len(restored),
                "products": read_products(),
                "backup": read_backup_items(BACKUP_PRODUCTS_FILE),
                "free": read_backup_items(BACKUP_FREE_FILE),
            })
            return
        self.send_json(404, {"ok": False, "message": "API endpoint не найден."})


if __name__ == "__main__":
    print(f"The Champ server running on http://localhost:{PORT}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
