const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const ENV_FILE = path.join(ROOT, '.env');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  });
}

loadEnvFile(ENV_FILE);

const TENANT = {
  brandName: process.env.APP_BRAND_NAME || process.env.THECHAMP_BRAND_NAME || 'The Champ',
  productName: process.env.APP_PRODUCT_NAME || process.env.THECHAMP_PRODUCT_NAME || `${process.env.APP_BRAND_NAME || process.env.THECHAMP_BRAND_NAME || 'The Champ'} BigData`,
  logoUrl: process.env.APP_LOGO_URL || process.env.THECHAMP_LOGO_URL || '/assets/THE_CHAMP_logo_200x200.svg',
  defaultBrand: process.env.APP_DEFAULT_BRAND || process.env.THECHAMP_DEFAULT_BRAND || process.env.APP_BRAND_NAME || process.env.THECHAMP_BRAND_NAME || 'The Champ',
  storagePrefix: process.env.APP_STORAGE_PREFIX || process.env.THECHAMP_STORAGE_PREFIX || 'thechamp',
  adminEmail: process.env.APP_ADMIN_EMAIL || process.env.THECHAMP_ADMIN_EMAIL || 'admin@materio.com',
  adminPassword: process.env.APP_ADMIN_PASSWORD || process.env.THECHAMP_ADMIN_PASSWORD || 'admin'
};

const PORT = Number(process.env.APP_PORT || process.env.THECHAMP_PORT || process.env.PORT || 4173);
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_ROOT = path.resolve(process.env.APP_DATA_ROOT || process.env.THECHAMP_DATA_ROOT || ROOT);
const CATALOG_DIR = path.join(DATA_ROOT, 'katalog');
const CATEGORIES_DIR = path.join(CATALOG_DIR, '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438');
const CATEGORIES_FILE = path.join(CATEGORIES_DIR, 'categories.json');
const COLORS_DIR = path.join(CATALOG_DIR, '\u0426\u0432\u0435\u0442\u0430');
const COLORS_FILE = path.join(COLORS_DIR, 'colors.json');
const MATERIALS_DIR = path.join(CATALOG_DIR, '\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044b');
const MATERIALS_FILE = path.join(MATERIALS_DIR, 'materials.json');
const BRANDS_DIR = path.join(CATALOG_DIR, '\u0411\u0440\u0435\u043d\u0434\u044b');
const BRANDS_FILE = path.join(BRANDS_DIR, 'brands.json');
const PRODUCTS_FILE = path.join(CATALOG_DIR, 'products.json');
const PRODUCTS_DIR = path.join(CATALOG_DIR, 'products');
const BACKUP_DIR = path.join(DATA_ROOT, 'BuckUp');
const BACKUP_PRODUCT_DIR = path.join(BACKUP_DIR, 'Product');
const BACKUP_FILE_DIR = path.join(BACKUP_DIR, 'File');
const BACKUP_BLOG_DIR = path.join(BACKUP_DIR, 'Blog');
const BACKUP_FREE_DIR = path.join(BACKUP_DIR, 'Free');
const BACKUP_PRODUCTS_FILE = path.join(BACKUP_PRODUCT_DIR, 'deleted-products.json');
const BACKUP_FILES_FILE = path.join(BACKUP_FILE_DIR, 'deleted-files.json');
const BACKUP_BLOGS_FILE = path.join(BACKUP_BLOG_DIR, 'deleted-blogs.json');
const BACKUP_FREE_FILE = path.join(BACKUP_FREE_DIR, 'deleted-free.json');

function publicTenantConfig() {
  return {
    brandName: TENANT.brandName,
    productName: TENANT.productName,
    logoUrl: TENANT.logoUrl,
    defaultBrand: TENANT.defaultBrand,
    storagePrefix: TENANT.storagePrefix,
    adminEmail: TENANT.adminEmail,
    dataRoot: DATA_ROOT,
    port: PORT
  };
}

const defaultProducts = [];

const state = {
  integrations: [
    { id: 'seller-main', name: `${TENANT.brandName} Seller`, status: 'connected', mode: 'FBO/FBS', lastSync: '2026-05-27 09:30', orders: 184, stockDelta: -12 },
    { id: 'store-main', name: `${TENANT.brandName} Store`, status: 'connected', mode: 'FBO/FBS', lastSync: '2026-05-27 09:22', orders: 231, stockDelta: 34 },
    { id: 'yandex', name: 'Яндекс Маркет', status: 'pending', mode: 'DBS', lastSync: 'Ожидает подключения', orders: 0, stockDelta: 0 },
    { id: 'trendyol', name: 'Trendyol', status: 'draft', mode: 'API', lastSync: 'Требуется настройка', orders: 0, stockDelta: 0 }
  ],
  modules: [
    { id: 'warehouse', name: 'Умный склад', group: 'Операции', progress: 76, health: 'good', metric: '1 248 SKU', tags: ['Сборка', 'Упаковка', 'Адресное хранение', 'Видео-контроль'] },
    { id: 'finance-ai', name: 'AI-финансовый директор', group: 'Финансы', progress: 68, health: 'good', metric: '18,4% прибыли', tags: ['ОПиУ', 'ДДС', 'BI', 'ABC-анализ'] },
    { id: 'planner-ai', name: 'AI-планировщик', group: 'Поставки', progress: 61, health: 'warn', metric: '14 дней запаса', tags: ['Снабжение', 'Закупки', 'Поставщики', 'Расходы'] },
    { id: 'pim', name: 'PIM-система', group: 'Товары', progress: 82, health: 'good', metric: '934 карточки', tags: ['Импорт', 'Создание', 'Редактирование', 'Аналитика'] }
  ],
  apiEvents: [
    { time: '09:31', source: TENANT.brandName, type: 'orders.pull', status: 200, detail: 'Получено 63 новых заказа' },
    { time: '09:29', source: TENANT.brandName, type: 'stock.push', status: 200, detail: 'Обновлено 214 остатков' },
    { time: '09:27', source: 'PIM', type: 'products.normalize', status: 200, detail: 'Обогащено 18 карточек' }
  ]
};

function safeFolderName(value) {
  return String(value || 'item')
    .trim()
    .replace(/[<>:"/\\|?*]+/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[ .]+$/g, '') || 'item';
}

function readJson(filePath, fallback) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (!fs.existsSync(filePath)) {
    writeJson(filePath, fallback);
    return fallback;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
  } catch {
    const backup = `${filePath}.broken-${Date.now()}`;
    fs.renameSync(filePath, backup);
    writeJson(filePath, fallback);
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, filePath);
}

function readCatalogColors() {
  fs.mkdirSync(COLORS_DIR, { recursive: true });
  const colors = readJson(COLORS_FILE, []);
  const byName = new Map();
  colors.forEach(color => {
    if (color?.name) byName.set(color.name, color);
  });

  fs.readdirSync(COLORS_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .forEach(entry => {
      const colorFile = path.join(COLORS_DIR, entry.name, 'color.json');
      const color = readJson(colorFile, { name: entry.name, hex: '#f7f7f7' });
      byName.set(color.name || entry.name, color);
    });

  const merged = Array.from(byName.values()).sort((a, b) => String(a.name).localeCompare(String(b.name), 'ru'));
  writeJson(COLORS_FILE, merged);
  return merged;
}

function normalizeBrandName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function readCatalogBrands() {
  fs.mkdirSync(BRANDS_DIR, { recursive: true });
  const products = readProducts();
  const stored = readJson(BRANDS_FILE, []);
  const byName = new Map();

  stored.forEach(item => {
    if (item && typeof item === 'object') {
      const name = normalizeBrandName(item.name);
      if (name) byName.set(name.toLowerCase(), { ...item, name });
    } else {
      const name = normalizeBrandName(item);
      if (name) byName.set(name.toLowerCase(), { id: safeFolderName(name).toLowerCase(), name, source: 'manual' });
    }
  });

  products.forEach(product => {
    const name = normalizeBrandName(product.brand);
    if (!name || byName.has(name.toLowerCase())) return;
    byName.set(name.toLowerCase(), {
      id: safeFolderName(name).toLowerCase(),
      name,
      source: 'product',
      createdAt: product.createdAt || new Date().toISOString().slice(0, 19)
    });
  });

  const brands = Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  brands.forEach(brand => {
    const brandDir = path.join(BRANDS_DIR, safeFolderName(brand.name));
    fs.mkdirSync(brandDir, { recursive: true });
    writeJson(path.join(brandDir, 'brand.json'), brand);
  });
  writeJson(BRANDS_FILE, brands);
  return brands;
}

function saveCatalogBrand(value) {
  const name = normalizeBrandName(value);
  if (!name) return { brand: null, brands: readCatalogBrands() };
  const brands = readCatalogBrands();
  const existing = brands.find(item => item.name.toLowerCase() === name.toLowerCase());
  if (existing) return { brand: existing, brands };

  const brand = {
    id: crypto.randomBytes(8).toString('hex'),
    name,
    source: 'manual',
    createdAt: new Date().toISOString().slice(0, 19)
  };
  const next = [...brands, brand].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  writeJson(BRANDS_FILE, next);
  const brandDir = path.join(BRANDS_DIR, safeFolderName(name));
  fs.mkdirSync(brandDir, { recursive: true });
  writeJson(path.join(brandDir, 'brand.json'), brand);
  return { brand, brands: next };
}

function readCatalog() {
  fs.mkdirSync(CATALOG_DIR, { recursive: true });
  const sections = fs.readdirSync(CATALOG_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name !== 'imports')
    .map(entry => ({ name: entry.name, icon: '/assets/icon-folder.svg' }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  return {
    products: readProducts(),
    categories: readJson(path.join(CATALOG_DIR, 'categories.json'), []),
    sections
  };
}

function normalizeProduct(body, existingId) {
  const now = new Date().toISOString().slice(0, 19);
  const id = existingId || String(body.id || crypto.randomBytes(8).toString('hex'));
  const marketplaceArticle = String(body.wb || `${Date.now()}${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`).slice(0, 20);
  return {
    id,
    image: String(body.image || '/assets/icon-folder.svg'),
    name: String(body.name || 'Новый товар').trim(),
    assortment: String(body.assortment || body.name || 'Название товара').trim(),
    category: String(body.category || 'Без категории').trim(),
    stock: Number(body.stock || 0),
    purchasePrice: Number(body.purchasePrice || 0),
    salePrice: Number(body.salePrice || 0),
    brand: String(body.brand || TENANT.defaultBrand).trim(),
    manufacturer: String(body.manufacturer || TENANT.defaultBrand).trim(),
    season: String(body.season || 'Всесезонный').trim(),
    availability: String(body.availability || 'Доступны к продаже').trim(),
    barcode: String(body.barcode || '').trim(),
    wb: marketplaceArticle,
    seller: String(body.seller || `TC-${id.slice(0, 6).toUpperCase()}`).trim(),
    color: String(body.color || '—').trim(),
    sizes: String(body.sizes || '—').trim(),
    marketplaceSku: String(body.marketplaceSku || marketplaceArticle).trim(),
    createdAt: String(body.createdAt || now),
    updatedAt: now
  };
}

function extensionForMedia(name, type) {
  const ext = path.extname(String(name || '')).toLowerCase();
  if (/^\.[a-z0-9]{1,8}$/.test(ext)) return ext;
  if (String(type).startsWith('video/')) return '.mp4';
  if (type === 'image/png') return '.png';
  if (type === 'image/webp') return '.webp';
  return '.jpg';
}

function saveProductFiles(product, mediaItems = []) {
  const productDir = path.join(PRODUCTS_DIR, safeFolderName(product.id));
  const imagesDir = path.join(productDir, 'images');
  const videosDir = path.join(productDir, 'videos');
  fs.mkdirSync(imagesDir, { recursive: true });
  fs.mkdirSync(videosDir, { recursive: true });
  product.images = [];
  product.videos = [];

  mediaItems.forEach((media, index) => {
    const data = String(media.data || '');
    if (!data.startsWith('data:') || !data.includes(',')) return;
    const [header, encoded] = data.split(',', 2);
    const type = header.slice(5).split(';')[0];
    const kind = type.startsWith('video/') ? 'video' : 'image';
    const ext = extensionForMedia(media.name, type);
    let filename = `${String(index + 1).padStart(3, '0')}-${safeFolderName(media.name || kind)}`;
    if (!filename.toLowerCase().endsWith(ext)) filename += ext;
    const targetDir = kind === 'video' ? videosDir : imagesDir;
    fs.writeFileSync(path.join(targetDir, filename), Buffer.from(encoded, 'base64'));
    const item = { name: filename, url: `/api/catalog/product-media/${product.id}/${kind}s/${filename}`, type };
    if (kind === 'video') product.videos.push(item);
    else product.images.push(item);
  });

  if (product.images.length) product.image = product.images[0].url;
  writeJson(path.join(productDir, 'product.json'), product);
  return product;
}

function readProducts() {
  return readJson(PRODUCTS_FILE, defaultProducts)
    .filter(item => item && !['tc-001', 'tc-002', 'tc-003'].includes(item.id));
}

function writeProducts(products) {
  writeJson(PRODUCTS_FILE, products);
}

function ensureBackupDirs() {
  [BACKUP_PRODUCT_DIR, BACKUP_FILE_DIR, BACKUP_BLOG_DIR, BACKUP_FREE_DIR].forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
  });
}

function readBackupItems(filePath) {
  ensureBackupDirs();
  return readJson(filePath, []);
}

function writeBackupItems(filePath, items) {
  ensureBackupDirs();
  writeJson(filePath, items);
}

function backupDeletedProduct(product) {
  ensureBackupDirs();
  const backupId = `product-${new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)}-${crypto.randomBytes(4).toString('hex')}`;
  const productId = String(product.id || '');
  const sourceDir = path.join(PRODUCTS_DIR, safeFolderName(productId));
  const archiveDir = path.join(BACKUP_PRODUCT_DIR, 'items', backupId);
  let archivedFiles = false;

  if (fs.existsSync(sourceDir)) {
    fs.mkdirSync(path.dirname(archiveDir), { recursive: true });
    fs.cpSync(sourceDir, archiveDir, { recursive: true });
    archivedFiles = true;
  }

  const backupItem = {
    backupId,
    type: 'product',
    deletedAt: new Date().toISOString().slice(0, 19),
    originalId: productId,
    name: product.name || '\u041d\u043e\u0432\u044b\u0439 \u0442\u043e\u0432\u0430\u0440',
    article: product.seller || product.marketplaceSku || productId,
    category: product.category || '\u0411\u0435\u0437 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438',
    payload: product,
    archivedFiles
  };

  const products = readBackupItems(BACKUP_PRODUCTS_FILE);
  products.unshift(backupItem);
  writeBackupItems(BACKUP_PRODUCTS_FILE, products);

  const free = readBackupItems(BACKUP_FREE_FILE);
  free.unshift(backupItem);
  writeBackupItems(BACKUP_FREE_FILE, free);
  return backupItem;
}

function restoreDeletedProducts(backupIds) {
  const ids = new Set((backupIds || []).map(String));
  const backupItems = readBackupItems(BACKUP_PRODUCTS_FILE);
  const restoreItems = backupItems.filter(item => ids.has(String(item.backupId)));
  if (!restoreItems.length) return [];

  const productsById = new Map(readProducts().map(product => [String(product.id), product]));
  restoreItems.slice().reverse().forEach(backupItem => {
    const product = { ...(backupItem.payload || {}) };
    product.id = String(product.id || backupItem.originalId || crypto.randomBytes(8).toString('hex'));
    product.updatedAt = new Date().toISOString().slice(0, 19);
    productsById.set(String(product.id), product);

    const archiveDir = path.join(BACKUP_PRODUCT_DIR, 'items', String(backupItem.backupId));
    const targetDir = path.join(PRODUCTS_DIR, safeFolderName(product.id));
    if (fs.existsSync(targetDir)) fs.rmSync(targetDir, { recursive: true, force: true });
    if (fs.existsSync(archiveDir)) {
      fs.cpSync(archiveDir, targetDir, { recursive: true });
    } else {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    writeJson(path.join(targetDir, 'product.json'), product);
  });

  writeProducts(Array.from(productsById.values()));
  writeBackupItems(BACKUP_PRODUCTS_FILE, backupItems.filter(item => !ids.has(String(item.backupId))));
  writeBackupItems(BACKUP_FREE_FILE, readBackupItems(BACKUP_FREE_FILE).filter(item => !ids.has(String(item.backupId))));
  return restoreItems;
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function readRequestJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function serveStatic(req, res, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requested));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { ok: false, message: 'Forbidden' });
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendJson(res, 404, { ok: false, message: 'File not found' });
    return;
  }

  const ext = path.extname(filePath);
  const type = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml'
  }[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  fs.createReadStream(filePath).pipe(res);
}

function serveProductMedia(res, pathname) {
  const relative = decodeURIComponent(pathname.replace('/api/catalog/product-media/', ''));
  const filePath = path.normalize(path.join(PRODUCTS_DIR, relative));
  if (!filePath.startsWith(PRODUCTS_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendJson(res, 404, { ok: false, message: 'Файл не найден.' });
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const type = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4'
  }[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === 'GET' && pathname.startsWith('/api/catalog/product-media/')) {
      serveProductMedia(res, pathname);
      return;
    }
    if (req.method === 'GET' && pathname === '/api/config') {
      sendJson(res, 200, publicTenantConfig());
      return;
    }
    if (req.method === 'GET' && pathname === '/api/health') {
      sendJson(res, 200, { ok: true, service: TENANT.productName, categories: readJson(CATEGORIES_FILE, []).length });
      return;
    }
    if (req.method === 'GET' && pathname === '/api/dashboard') {
      const orders = state.integrations.reduce((sum, item) => sum + item.orders, 0);
      const active = state.modules.filter(item => item.health === 'good').length;
      sendJson(res, 200, { stats: { revenue: 284750, orders, margin: 18.4, activeModules: active, syncHealth: 96 }, ...state });
      return;
    }
    if (req.method === 'GET' && pathname === '/api/catalog') {
      sendJson(res, 200, readCatalog());
      return;
    }
    if (req.method === 'GET' && pathname === '/api/catalog/categories') {
      sendJson(res, 200, { categories: readJson(CATEGORIES_FILE, []) });
      return;
    }
    if (req.method === 'GET' && pathname === '/api/catalog/colors') {
      sendJson(res, 200, { colors: readCatalogColors() });
      return;
    }
    if (req.method === 'GET' && pathname === '/api/catalog/materials') {
      sendJson(res, 200, { materials: readJson(MATERIALS_FILE, []) });
      return;
    }
    if (req.method === 'GET' && pathname === '/api/catalog/brands') {
      sendJson(res, 200, { brands: readCatalogBrands() });
      return;
    }
    if (req.method === 'GET' && pathname === '/api/catalog/products') {
      sendJson(res, 200, { products: readProducts() });
      return;
    }
    if (req.method === 'GET' && pathname === '/api/backup') {
      sendJson(res, 200, {
        products: readBackupItems(BACKUP_PRODUCTS_FILE),
        files: readBackupItems(BACKUP_FILES_FILE),
        blogs: readBackupItems(BACKUP_BLOGS_FILE),
        free: readBackupItems(BACKUP_FREE_FILE)
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/login') {
      const body = await readRequestJson(req);
      if (body.email !== TENANT.adminEmail || body.password !== TENANT.adminPassword) {
        sendJson(res, 401, { ok: false, message: 'Неверный email или пароль.' });
        return;
      }
      sendJson(res, 200, { ok: true, token: crypto.randomBytes(18).toString('hex'), user: { name: `Администратор ${TENANT.brandName}`, email: body.email, role: 'Владелец' } });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/catalog/materials') {
      const body = await readRequestJson(req);
      const name = String(body.name || '').trim();
      if (!name) {
        sendJson(res, 400, { ok: false, message: 'Укажите материал.' });
        return;
      }
      let materials = readJson(MATERIALS_FILE, []);
      if (!materials.includes(name)) {
        materials = [...materials, name].sort((a, b) => a.localeCompare(b, 'ru'));
        writeJson(MATERIALS_FILE, materials);
        const folder = path.join(MATERIALS_DIR, safeFolderName(name));
        fs.mkdirSync(folder, { recursive: true });
        writeJson(path.join(folder, 'material.json'), { name });
      }
      sendJson(res, 201, { ok: true, materials });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/catalog/brands') {
      const body = await readRequestJson(req);
      const { brand, brands } = saveCatalogBrand(body.name);
      if (!brand) {
        sendJson(res, 400, { ok: false, message: 'Укажите название бренда.' });
        return;
      }
      sendJson(res, 201, { ok: true, brand, brands });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/catalog/products') {
      const body = await readRequestJson(req);
      const product = saveProductFiles(normalizeProduct(body), body.media || []);
      saveCatalogBrand(product.brand);
      const products = readProducts().filter(item => item.id !== product.id);
      products.unshift(product);
      writeProducts(products);
      sendJson(res, 201, { ok: true, product, products });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/catalog/products/delete') {
      const body = await readRequestJson(req);
      const ids = new Set((body.ids || []).map(String));
      if (!ids.size) {
        sendJson(res, 400, { ok: false, message: 'Выберите товары для удаления.' });
        return;
      }
      const currentProducts = readProducts();
      currentProducts.forEach(product => {
        if (ids.has(String(product.id))) backupDeletedProduct(product);
      });
      const products = currentProducts.filter(item => !ids.has(String(item.id)));
      ids.forEach(id => {
        const folder = path.join(PRODUCTS_DIR, safeFolderName(id));
        if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true });
      });
      writeProducts(products);
      sendJson(res, 200, { ok: true, products, deleted: ids.size });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/backup/products/restore') {
      const body = await readRequestJson(req);
      const restored = restoreDeletedProducts(body.ids || []);
      sendJson(res, 200, {
        ok: true,
        restored: restored.length,
        products: readProducts(),
        backup: readBackupItems(BACKUP_PRODUCTS_FILE),
        free: readBackupItems(BACKUP_FREE_FILE)
      });
      return;
    }

    serveStatic(req, res, pathname);
  } catch (error) {
    sendJson(res, 500, { ok: false, message: 'Внутренняя ошибка сервера.' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`${TENANT.productName} server running on http://localhost:${PORT}`);
});
