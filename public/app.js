const app = document.querySelector('#app');

let appConfig = {
  brandName: 'The Champ',
  productName: 'The Champ BigData',
  logoUrl: '/assets/THE_CHAMP_logo_200x200.svg',
  defaultBrand: 'The Champ',
  storagePrefix: 'thechamp',
  adminEmail: 'admin@materio.com'
};

function appBrand() {
  return appConfig.brandName || 'The Champ';
}

function appProductName() {
  return appConfig.productName || `${appBrand()} BigData`;
}

function appLogo() {
  return appConfig.logoUrl || '/assets/THE_CHAMP_logo_200x200.svg';
}

function appStorageKey(name) {
  return `${appConfig.storagePrefix || 'thechamp'}_${name}`;
}

const icons = {
  dashboard: '/assets/icon-home.svg',
  modules: 'M',
  catalog: '/assets/icon-catalog.svg',
  integrations: 'I',
  api: '{}',
  users: 'U'
};

const navItems = [
  { id: 'modules', labelKey: 'navModules', icon: icons.modules },
  { id: 'backup', labelKey: 'navBackup', icon: 'B' },
  { id: 'integrations', labelKey: 'navIntegrations', icon: icons.integrations },
  { id: 'api', labelKey: 'navApiLogs', icon: icons.api },
  { id: 'users', labelKey: 'navAccess', icon: icons.users }
];

const catalogSections = [
  'РљР°С‚РµРіРѕСЂРёРё',
  'РљРѕРјРёСЃСЃРёСЏ РєР°С‚РµРіРѕСЂРёР№',
  'РўРѕРІР°СЂС‹',
  'Р‘СЂРµРЅРґС‹',
  'Р¦РІРµС‚Р°',
  'РњР°С‚РµСЂРёР°Р»С‹',
  'РњР°С‚РµСЂРёР°Р»С‹ (РґР»СЏ С„РёР»СЊС‚СЂРѕРІ)',
  'РЎРµР·РѕРЅС‹',
  'РўРёРїС‹ С‚РѕРІР°СЂРѕРІ',
  'РЎС‚СЂР°РЅР°',
  'РўРµРіРё',
  'Р Р°Р·РјРµСЂС‹',
  'РћС‚Р·С‹РІС‹ С‚РѕРІР°СЂРѕРІ',
  'РџСЂРѕРјРѕРєРѕРґС‹',
  'РҐР°СЂР°РєС‚РµСЂРёСЃС‚РёРєРё'
];

let currentView = localStorage.getItem('thechamp_current_view') || 'dashboard';
let dashboardData = null;
let catalogData = null;
let backupData = null;
let savedCategories = null;
let catalogColors = null;
let catalogMaterials = null;
let catalogBrands = null;
let catalogProducts = null;
let selectedCatalogSection = localStorage.getItem('thechamp_catalog_section') || 'РљР°С‚РµРіРѕСЂРёРё';
let catalogOpen = localStorage.getItem('thechamp_catalog_open') !== 'false';
let pendingCategoryParent = 'Р‘РµР· РєР°С‚РµРіРѕСЂРёРё';
let productEditorOpen = false;
let productDraftName = '';
let productDraftCategory = '';
let productManualCategoryOpen = false;
let productManualCategoryQuery = '';
let productCategoryModalSelection = '';
let productCategoryModalSelectionId = '';
const productCategoryExpanded = new Set();
let productDraftMedia = [];
let productGeneratedArticle = '';
let categoryDrillPath = JSON.parse(localStorage.getItem('thechamp_category_drill_path') || '[]');
let appLanguage = localStorage.getItem('thechamp_language') || 'ru';
let selectedSettingsSection = localStorage.getItem('thechamp_settings_section') || 'account';
let selectedBackupSection = localStorage.getItem('thechamp_backup_section') || 'products';
let activeProductStatus = localStorage.getItem('thechamp_product_status') || 'all';

const languageNames = {
  ru: 'Р СѓСЃСЃРєРёР№',
  en: 'English',
  tr: 'TГјrkГ§e'
};

const settingsSections = [
  { id: 'account', labelKey: 'settingsAccount' },
  { id: 'employees', labelKey: 'settingsEmployees' },
  { id: 'apiIntegrations', labelKey: 'settingsApiIntegrations' },
  { id: 'sellerApi', labelKey: 'settingsSellerApi' },
  { id: 'privateApps', labelKey: 'settingsPrivateApps' },
  { id: 'notifications', labelKey: 'settingsNotifications' },
  { id: 'companyInfo', labelKey: 'settingsCompanyInfo' },
  { id: 'contracts', labelKey: 'settingsContracts' },
  { id: 'brandRepresentation', labelKey: 'settingsBrandRepresentation' }
];

const catalogSectionLabels = {
  ru: {
    'РљР°С‚РµРіРѕСЂРёРё': 'РљР°С‚РµРіРѕСЂРёРё',
    'РљРѕРјРёСЃСЃРёСЏ РєР°С‚РµРіРѕСЂРёР№': 'РљРѕРјРёСЃСЃРёСЏ РєР°С‚РµРіРѕСЂРёР№',
    'РўРѕРІР°СЂС‹': 'РўРѕРІР°СЂС‹',
    'Р‘СЂРµРЅРґС‹': 'Р‘СЂРµРЅРґС‹',
    'Р¦РІРµС‚Р°': 'Р¦РІРµС‚Р°',
    'РњР°С‚РµСЂРёР°Р»С‹': 'РњР°С‚РµСЂРёР°Р»С‹',
    'РњР°С‚РµСЂРёР°Р»С‹ ( РґР»СЏ С„РёР»СЊС‚СЂРѕРІ)': 'РњР°С‚РµСЂРёР°Р»С‹ ( РґР»СЏ С„РёР»СЊС‚СЂРѕРІ)',
    'РЎРµР·РѕРЅС‹': 'РЎРµР·РѕРЅС‹',
    'РўРёРїС‹ С‚РѕРІР°СЂРѕРІ': 'РўРёРїС‹ С‚РѕРІР°СЂРѕРІ',
    'РЎС‚СЂР°РЅР°': 'РЎС‚СЂР°РЅР°',
    'РўРµРіРё': 'РўРµРіРё',
    'Р Р°Р·РјРµСЂС‹': 'Р Р°Р·РјРµСЂС‹',
    'РћС‚Р·С‹РІС‹ С‚РѕРІР°СЂРѕРІ': 'РћС‚Р·С‹РІС‹ С‚РѕРІР°СЂРѕРІ',
    'РџСЂРѕРјРѕРєРѕРґС‹': 'РџСЂРѕРјРѕРєРѕРґС‹',
    'РҐР°СЂР°РєС‚РµСЂРёСЃС‚РёРєРё': 'РҐР°СЂР°РєС‚РµСЂРёСЃС‚РёРєРё'
  },
  en: {
    'РљР°С‚РµРіРѕСЂРёРё': 'Categories',
    'РљРѕРјРёСЃСЃРёСЏ РєР°С‚РµРіРѕСЂРёР№': 'Category commission',
    'РўРѕРІР°СЂС‹': 'Products',
    'Р‘СЂРµРЅРґС‹': 'Brands',
    'Р¦РІРµС‚Р°': 'Colors',
    'РњР°С‚РµСЂРёР°Р»С‹': 'Materials',
    'РњР°С‚РµСЂРёР°Р»С‹ ( РґР»СЏ С„РёР»СЊС‚СЂРѕРІ)': 'Materials (filters)',
    'РЎРµР·РѕРЅС‹': 'Seasons',
    'РўРёРїС‹ С‚РѕРІР°СЂРѕРІ': 'Product types',
    'РЎС‚СЂР°РЅР°': 'Country',
    'РўРµРіРё': 'Tags',
    'Р Р°Р·РјРµСЂС‹': 'Sizes',
    'РћС‚Р·С‹РІС‹ С‚РѕРІР°СЂРѕРІ': 'Product reviews',
    'РџСЂРѕРјРѕРєРѕРґС‹': 'Promo codes',
    'РҐР°СЂР°РєС‚РµСЂРёСЃС‚РёРєРё': 'Attributes'
  },
  tr: {
    'РљР°С‚РµРіРѕСЂРёРё': 'Kategoriler',
    'РљРѕРјРёСЃСЃРёСЏ РєР°С‚РµРіРѕСЂРёР№': 'Kategori komisyonu',
    'РўРѕРІР°СЂС‹': 'ГњrГјnler',
    'Р‘СЂРµРЅРґС‹': 'Markalar',
    'Р¦РІРµС‚Р°': 'Renkler',
    'РњР°С‚РµСЂРёР°Р»С‹': 'Materyaller',
    'РњР°С‚РµСЂРёР°Р»С‹ ( РґР»СЏ С„РёР»СЊС‚СЂРѕРІ)': 'Materyaller (filtreler)',
    'РЎРµР·РѕРЅС‹': 'Sezonlar',
    'РўРёРїС‹ С‚РѕРІР°СЂРѕРІ': 'ГњrГјn tipleri',
    'РЎС‚СЂР°РЅР°': 'Гњlke',
    'РўРµРіРё': 'Etiketler',
    'Р Р°Р·РјРµСЂС‹': 'Bedenler',
    'РћС‚Р·С‹РІС‹ С‚РѕРІР°СЂРѕРІ': 'ГњrГјn yorumlarД±',
    'РџСЂРѕРјРѕРєРѕРґС‹': 'Promokodlar',
    'РҐР°СЂР°РєС‚РµСЂРёСЃС‚РёРєРё': 'Г–zellikler'
  }
};

const translations = {
  ru: {
    navHome: 'Р“Р»Р°РІРЅР°СЏ',
    navCatalog: 'РљР°С‚Р°Р»РѕРі',
    navModules: 'РњРѕРґСѓР»Рё',
    navBackup: 'BuckUp',
    navIntegrations: 'API РјР°СЂРєРµС‚РїР»РµР№СЃРѕРІ',
    navApiLogs: 'Р›РѕРіРё API',
    navAccess: 'РџСЂР°РІР° РґРѕСЃС‚СѓРїР°',
    searchPlaceholder: 'РџРѕРёСЃРє Р·Р°РєР°Р·Р°, SKU, Р±СЂРµРЅРґР° РёР»Рё СЃРѕР±С‹С‚РёСЏ API',
    companyTitle: 'РРЅС„РѕСЂРјР°С†РёСЏ Рѕ С„РёСЂРјРµ',
    companyPerson: 'Р‘Р°СЂРєРѕРІР° Р•РІРґРѕРєРёСЏ',
    companyRole: 'РЈРїСЂР°РІР»СЏСЋС‰РёР№ +1',
    settings: 'РќР°СЃС‚СЂРѕР№РєРё',
    premium: 'Premium',
    language: 'РЇР·С‹Рє',
    logout: 'Р’С‹С…РѕРґ',
    aiAssistant: 'AI РїРѕРјРѕС‰РЅРёРє',
    chats: 'Р§Р°С‚С‹',
    support: 'РџРѕРґРґРµСЂР¶РєР°',
    notifications: 'РЈРІРµРґРѕРјР»РµРЅРёСЏ',
    settingsTitle: 'РќР°СЃС‚СЂРѕР№РєРё',
    settingsSubtitle: 'РЈРїСЂР°РІР»СЏР№С‚Рµ РїСЂРѕС„РёР»РµРј, СЃРѕС‚СЂСѓРґРЅРёРєР°РјРё, API, СѓРІРµРґРѕРјР»РµРЅРёСЏРјРё Рё СЋСЂРёРґРёС‡РµСЃРєРёРјРё СЂР°Р·РґРµР»Р°РјРё РєРѕРјРїР°РЅРёРё.',
    settingsAccount: 'РЈС‡С‘С‚РЅР°СЏ Р·Р°РїРёСЃСЊ',
    settingsEmployees: 'РЎРѕС‚СЂСѓРґРЅРёРєРё',
    settingsApiIntegrations: 'API РёРЅС‚РµРіСЂР°С†РёРё',
    settingsSellerApi: 'Seller API',
    settingsPrivateApps: 'РЈРїСЂР°РІР»РµРЅРёРµ С‡Р°СЃС‚РЅС‹РјРё РїСЂРёР»РѕР¶РµРЅРёСЏРјРё',
    settingsNotifications: 'РЈРІРµРґРѕРјР»РµРЅРёСЏ',
    settingsCompanyInfo: 'РРЅС„РѕСЂРјР°С†РёСЏ Рѕ РєРѕРјРїР°РЅРёРё',
    settingsContracts: 'Р”РѕРіРѕРІРѕСЂС‹',
    settingsBrandRepresentation: 'РџСЂРµРґСЃС‚Р°РІРёС‚РµР»СЊСЃС‚РІРѕ Р±СЂРµРЅРґРѕРІ',
    accountTitle: 'Р”Р°РЅРЅС‹Рµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ',
    accountSubtitle: 'РР·РјРµРЅРµРЅРёСЏ СЃРѕС…СЂР°РЅСЏСЋС‚СЃСЏ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё РЅР° СЌС‚РѕРј РєРѕРјРїСЊСЋС‚РµСЂРµ.',
    userLabel: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ',
    loginLabel: 'Р›РѕРіРёРЅ',
    passwordLabel: 'РџР°СЂРѕР»СЊ',
    phoneLabel: 'РўРµР»РµС„РѕРЅ',
    savedLabel: 'РЎРѕС…СЂР°РЅРµРЅРѕ',
    languageTitle: 'РЇР·С‹Рє РёРЅС‚РµСЂС„РµР№СЃР°',
    languageSubtitle: 'Р’С‹Р±РµСЂРёС‚Рµ СЏР·С‹Рє РґР»СЏ РїР°РЅРµР»Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР° The Champ.',
    currentLanguage: 'РўРµРєСѓС‰РёР№ СЏР·С‹Рє',
    chooseLanguage: 'Р’С‹Р±СЂР°С‚СЊ СЏР·С‹Рє',
    sectionSoon: 'Р Р°Р·РґРµР» РїРѕРґРіРѕС‚РѕРІР»РµРЅ. РЎР»РµРґСѓСЋС‰РёРј С€Р°РіРѕРј СЃСЋРґР° РјРѕР¶РЅРѕ РґРѕР±Р°РІРёС‚СЊ СЂР°Р±РѕС‡РёРµ С„РѕСЂРјС‹ Рё РїСЂР°РІР° РґРѕСЃС‚СѓРїР°.',
    openSettings: 'РћС‚РєСЂС‹С‚СЊ РЅР°СЃС‚СЂРѕР№РєРё',
    openLanguage: 'РћС‚РєСЂС‹С‚СЊ СЏР·С‹РєРё'
  },
  en: {
    navHome: 'Home',
    navCatalog: 'Catalog',
    navModules: 'Modules',
    navBackup: 'BuckUp',
    navIntegrations: 'Marketplace API',
    navApiLogs: 'API logs',
    navAccess: 'Access rights',
    searchPlaceholder: 'Search order, SKU, brand or API event',
    companyTitle: 'Company information',
    companyPerson: 'Evdokia Barkova',
    companyRole: 'Manager +1',
    settings: 'Settings',
    premium: 'Premium',
    language: 'Language',
    logout: 'Log out',
    aiAssistant: 'AI assistant',
    chats: 'Chats',
    support: 'Support',
    notifications: 'Notifications',
    settingsTitle: 'Settings',
    settingsSubtitle: 'Manage profile, employees, API, notifications and company legal sections.',
    settingsAccount: 'Account',
    settingsEmployees: 'Employees',
    settingsApiIntegrations: 'API integrations',
    settingsSellerApi: 'Seller API',
    settingsPrivateApps: 'Private app management',
    settingsNotifications: 'Notifications',
    settingsCompanyInfo: 'Company information',
    settingsContracts: 'Contracts',
    settingsBrandRepresentation: 'Brand representation',
    accountTitle: 'User details',
    accountSubtitle: 'Changes are saved automatically on this computer.',
    userLabel: 'User',
    loginLabel: 'Login',
    passwordLabel: 'Password',
    phoneLabel: 'Phone',
    savedLabel: 'Saved',
    languageTitle: 'Interface language',
    languageSubtitle: 'Choose the language for The Champ admin panel.',
    currentLanguage: 'Current language',
    chooseLanguage: 'Choose language',
    sectionSoon: 'The section is prepared. Working forms and access rights can be added here next.',
    openSettings: 'Open settings',
    openLanguage: 'Open languages'
  },
  tr: {
    navHome: 'Ana sayfa',
    navCatalog: 'Katalog',
    navModules: 'ModГјller',
    navBackup: 'BuckUp',
    navIntegrations: 'Marketplace API',
    navApiLogs: 'API kayД±tlarД±',
    navAccess: 'EriЕџim haklarД±',
    searchPlaceholder: 'SipariЕџ, SKU, marka veya API olayД± ara',
    companyTitle: 'Firma bilgileri',
    companyPerson: 'Evdokia Barkova',
    companyRole: 'YГ¶netici +1',
    settings: 'Ayarlar',
    premium: 'Premium',
    language: 'Dil',
    logout: 'Г‡Д±kД±Еџ',
    aiAssistant: 'AI asistan',
    chats: 'Sohbetler',
    support: 'Destek',
    notifications: 'Bildirimler',
    settingsTitle: 'Ayarlar',
    settingsSubtitle: 'Profil, Г§alД±Еџanlar, API, bildirimler ve Еџirket bГ¶lГјmlerini yГ¶netin.',
    settingsAccount: 'Hesap',
    settingsEmployees: 'Г‡alД±Еџanlar',
    settingsApiIntegrations: 'API entegrasyonlarД±',
    settingsSellerApi: 'Seller API',
    settingsPrivateApps: 'Г–zel uygulama yГ¶netimi',
    settingsNotifications: 'Bildirimler',
    settingsCompanyInfo: 'Ећirket bilgileri',
    settingsContracts: 'SГ¶zleЕџmeler',
    settingsBrandRepresentation: 'Marka temsilciliДџi',
    accountTitle: 'KullanД±cД± bilgileri',
    accountSubtitle: 'DeДџiЕџiklikler bu bilgisayarda otomatik saklanД±r.',
    userLabel: 'KullanД±cД±',
    loginLabel: 'GiriЕџ',
    passwordLabel: 'Ећifre',
    phoneLabel: 'Telefon',
    savedLabel: 'Kaydedildi',
    languageTitle: 'ArayГјz dili',
    languageSubtitle: 'The Champ admin paneli iГ§in dili seГ§in.',
    currentLanguage: 'GeГ§erli dil',
    chooseLanguage: 'Dil seГ§',
    sectionSoon: 'BГ¶lГјm hazД±rlandД±. Sonraki adД±mda buraya Г§alД±Еџma formlarД± ve eriЕџim haklarД± eklenebilir.',
    openSettings: 'AyarlarД± aГ§',
    openLanguage: 'Dilleri aГ§'
  }
};

function t(key) {
  return translations[appLanguage]?.[key] || translations.ru[key] || key;
}

function catalogLabel(section) {
  return catalogSectionLabels[appLanguage]?.[section] || section;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function getAccountProfile() {
  const fallback = {
    user: 'Р‘Р°СЂРєРѕРІР° Р•РІРґРѕРєРёСЏ',
    login: appConfig.adminEmail || 'admin@thechamp.local',
    password: 'admin',
    phone: '+7'
  };
  return {
    ...fallback,
    ...JSON.parse(localStorage.getItem('thechamp_account_profile') || '{}')
  };
}

function saveNavigationState() {
  localStorage.setItem('thechamp_current_view', currentView);
  localStorage.setItem('thechamp_catalog_section', selectedCatalogSection);
  localStorage.setItem('thechamp_catalog_open', String(catalogOpen));
  localStorage.setItem('thechamp_settings_section', selectedSettingsSection);
  localStorage.setItem('thechamp_backup_section', selectedBackupSection);
}

function formatMoney(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(value);
}

function categoryPriority(category) {
  const text = [
    category.path,
    category.parent,
    category.name
  ].filter(Boolean).join(' / ').toLowerCase();

  if (text.includes('Р¶РµРЅС‰РёРЅР°Рј') || text.includes('Р¶РµРЅСЃРєР°СЏ') || text.includes('РґР»СЏ Р¶РµРЅС‰РёРЅ')) return 1;
  if (text.includes('РјСѓР¶С‡РёРЅР°Рј') || text.includes('РјСѓР¶СЃРєР°СЏ') || text.includes('РґР»СЏ РјСѓР¶С‡РёРЅ')) return 2;
  if (text.includes('РґРµРІРѕС‡РєР°Рј') || text.includes('РґРµРІРѕС‡РєРё') || text.includes('РґР»СЏ РґРµРІРѕС‡РµРє')) return 3;
  if (text.includes('РјР°Р»СЊС‡РёРєР°Рј') || text.includes('РјР°Р»СЊС‡РёРєРё') || text.includes('РґР»СЏ РјР°Р»СЊС‡РёРєРѕРІ')) return 4;
  return 50;
}

function compareCategories(a, b) {
  const priorityA = categoryPriority(a);
  const priorityB = categoryPriority(b);
  if (priorityA !== priorityB) return priorityA - priorityB;

  const sortA = Number(a.sortOrder || 0);
  const sortB = Number(b.sortOrder || 0);
  if (sortA !== sortB) return sortA - sortB;

  const pathA = String(a.path || `${a.parent || ''} / ${a.name || ''}`);
  const pathB = String(b.path || `${b.parent || ''} / ${b.name || ''}`);
  return pathA.localeCompare(pathB, 'ru');
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Р—Р°РїСЂРѕСЃ РЅРµ РІС‹РїРѕР»РЅРµРЅ');
  return data;
}

function requireAuth() {
  return Boolean(localStorage.getItem('thechamp_token'));
}

async function loadAppConfig() {
  try {
    appConfig = { ...appConfig, ...await api('/api/config') };
    document.title = appProductName();
  } catch {
    document.title = appProductName();
  }
}

function renderLogin() {
  const demoEmail = appConfig.adminEmail || 'admin@materio.com';
  app.innerHTML = `
    <section class="login-shell">
      <div class="login-art">
        <div class="brand"><img class="brand-logo" src="${escapeHtml(appLogo())}" alt="${escapeHtml(appBrand())} logo">${escapeHtml(appProductName())}</div>
        <div class="login-preview">
          <p class="eyebrow">Р¦РµРЅС‚СЂ СѓРїСЂР°РІР»РµРЅРёСЏ РјР°СЂРєРµС‚РїР»РµР№СЃР°РјРё</p>
          <h1>Р—Р°РєР°Р·С‹, РѕСЃС‚Р°С‚РєРё, С„РёРЅР°РЅСЃС‹ Рё РєР°СЂС‚РѕС‡РєРё С‚РѕРІР°СЂРѕРІ РІ РѕРґРЅРѕРј РєР°Р±РёРЅРµС‚Рµ.</h1>
          <p class="muted">Панель подготовлена как white-label система: бренд, логотип, данные и доступы меняются в настройках окружения.</p>
          <div class="preview-grid">
            <div class="mini-card"><h3>РЈРјРЅС‹Р№ СЃРєР»Р°Рґ</h3><p class="muted">РЎР±РѕСЂРєР°, СѓРїР°РєРѕРІРєР° Рё Р°РґСЂРµСЃРЅРѕРµ С…СЂР°РЅРµРЅРёРµ.</p></div>
            <div class="mini-card"><h3>PIM-СЃРёСЃС‚РµРјР°</h3><p class="muted">РЎРѕР·РґР°РЅРёРµ Рё РјР°СЃСЃРѕРІРѕРµ СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РєР°СЂС‚РѕС‡РµРє.</p></div>
            <div class="mini-card"><h3>AI-С„РёРЅР°РЅСЃС‹</h3><p class="muted">РџСЂРёР±С‹Р»СЊ, РґРµРЅРµР¶РЅС‹Р№ РїРѕС‚РѕРє Рё РїР»Р°РЅ-С„Р°РєС‚.</p></div>
          </div>
        </div>
      </div>
      <aside class="login-side">
        <form class="login-card" id="loginForm">
          <p class="eyebrow">Р’С…РѕРґ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°</p>
          <h2>Р”РѕР±СЂРѕ РїРѕР¶Р°Р»РѕРІР°С‚СЊ РІ РїР°РЅРµР»СЊ</h2>
          <p class="muted">Демо-аккаунт: ${escapeHtml(demoEmail)} / admin</p>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" value="${escapeHtml(demoEmail)}" autocomplete="email">
          </div>
          <div class="field">
            <label for="password">РџР°СЂРѕР»СЊ</label>
            <input id="password" type="password" value="admin" autocomplete="current-password">
          </div>
          <p class="error" id="loginError"></p>
          <button class="btn primary full" type="submit">Р’РѕР№С‚Рё</button>
        </form>
      </aside>
    </section>
  `;

  document.querySelector('#loginForm').addEventListener('submit', async event => {
    event.preventDefault();
    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value;
    const error = document.querySelector('#loginError');
    error.textContent = '';

    try {
      const result = await api('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('thechamp_token', result.token);
      localStorage.setItem('thechamp_user', JSON.stringify(result.user));
      await renderApp();
    } catch (err) {
      error.textContent = err.message;
    }
  });
}

function layout(content) {
  const user = JSON.parse(localStorage.getItem('thechamp_user') || '{}');
  const profile = getAccountProfile();
  app.innerHTML = `
    <section class="layout">
      <aside class="sidebar">
        <div class="brand"><img class="brand-logo" src="${escapeHtml(appLogo())}" alt="${escapeHtml(appBrand())} logo">${escapeHtml(appBrand())}</div>
        <button class="seller-connect" type="button" disabled title="РњРѕРґСѓР»СЊ Seller Р±СѓРґРµС‚ РїРѕРґРєР»СЋС‡РµРЅ РїРѕР·Р¶Рµ">
          <span>Seller</span>
          <strong>РџРѕРґРєР»СЋС‡РёС‚СЊ Seller</strong>
        </button>
        <nav class="nav">
          <button type="button" data-view="dashboard" class="${currentView === 'dashboard' ? 'active' : ''}">
            <span><img class="nav-icon" src="${icons.dashboard}" alt=""></span>${t('navHome')}
          </button>
          <button type="button" data-toggle-catalog class="catalog-toggle ${currentView === 'catalog' ? 'active' : ''}">
            <span><img class="nav-icon" src="${icons.catalog}" alt=""></span>
            <span class="nav-label">${t('navCatalog')}</span>
            <span class="chevron ${catalogOpen ? 'open' : ''}">вЊ„</span>
          </button>
          <div class="submenu ${catalogOpen ? '' : 'hidden'}">
            ${catalogSections.map(section => `
              <button type="button" data-catalog-section="${section}" class="submenu-item ${currentView === 'catalog' && selectedCatalogSection === section ? 'selected' : ''}">
                <span class="dot"></span>${catalogLabel(section)}
              </button>
            `).join('')}
          </div>
          ${navItems.map(item => `
            <button data-view="${item.id}" class="${item.id === currentView ? 'active' : ''}">
              <span>${item.iconImage ? `<img class="nav-icon" src="${item.icon}" alt="">` : item.icon}</span>${t(item.labelKey)}
            </button>
          `).join('')}
        </nav>
      </aside>
      <section class="main">
        <header class="topbar">
          <input class="search" placeholder="${t('searchPlaceholder')}">
          <div class="topbar-tools">
            <button class="tool-button" type="button" title="${t('chats')}" aria-label="${t('chats')}"><span class="tool-icon chat-icon"><i></i></span></button>
            <button class="tool-button" type="button" title="${t('support')}" aria-label="${t('support')}"><span class="tool-icon support-icon"><i></i></span></button>
            <button class="tool-button" type="button" title="${t('notifications')}" aria-label="${t('notifications')}"><span class="tool-icon bell-icon"><i></i></span></button>
            <div class="company-menu-wrap">
              <button class="tool-button crown" type="button" title="${t('companyTitle')}" aria-label="${t('companyTitle')}" data-company-menu-toggle><span class="tool-icon crown-icon"><i></i></span></button>
              <div class="company-menu hidden" data-company-menu>
                <div class="company-menu-head">
                  <strong>${escapeHtml(profile.user)}</strong>
                  <span>${escapeHtml(profile.login || user.email || 'admin@thechamp.local')}</span>
                  <small>${t('companyRole')}</small>
                </div>
                <button type="button" class="company-menu-item" data-company-view="settings"><span class="menu-gear"></span>${t('settings')}</button>
                <button type="button" class="company-menu-item" data-company-view="premium"><span class="menu-premium"></span>${t('premium')}</button>
                <button type="button" class="company-menu-item" data-company-view="language"><span class="menu-language"></span>${t('language')}<b>вЂє</b></button>
                <button type="button" class="company-menu-item" id="logoutButton"><span class="menu-exit"></span>${t('logout')}</button>
              </div>
            </div>
            <button class="ai-button" type="button" title="${t('aiAssistant')}" aria-label="${t('aiAssistant')}"><span class="ai-icon"><i></i></span></button>
          </div>
        </header>
        ${content}
      </section>
    </section>
  `;

  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => {
      currentView = button.dataset.view;
      saveNavigationState();
      renderApp();
    });
  });

  document.querySelector('[data-toggle-catalog]').addEventListener('click', () => {
    catalogOpen = !catalogOpen;
    currentView = 'catalog';
    saveNavigationState();
    renderApp();
  });

  document.querySelectorAll('[data-catalog-section]').forEach(button => {
    button.addEventListener('click', () => {
      selectedCatalogSection = button.dataset.catalogSection;
      currentView = 'catalog';
      catalogOpen = true;
      saveNavigationState();
      renderApp();
    });
  });

  document.querySelectorAll('[data-company-view]').forEach(button => {
    button.addEventListener('click', () => {
      currentView = button.dataset.companyView;
      if (currentView === 'settings') selectedSettingsSection = selectedSettingsSection || 'account';
      saveNavigationState();
      renderApp();
    });
  });

  const companyMenuToggle = document.querySelector('[data-company-menu-toggle]');
  const companyMenu = document.querySelector('[data-company-menu]');
  if (companyMenuToggle && companyMenu) {
    companyMenuToggle.addEventListener('click', event => {
      event.stopPropagation();
      companyMenu.classList.toggle('hidden');
    });
    companyMenu.addEventListener('click', event => event.stopPropagation());
    document.addEventListener('click', () => companyMenu.classList.add('hidden'));
  }

  document.querySelector('#logoutButton').addEventListener('click', () => {
    localStorage.removeItem('thechamp_token');
    localStorage.removeItem('thechamp_current_view');
    localStorage.removeItem('thechamp_catalog_section');
    localStorage.removeItem('thechamp_catalog_open');
    renderLogin();
  });

}

function renderDashboard() {
  layout(`<div class="dashboard-empty"></div>`);
}

function moduleCard(item) {
  return `
    <article class="card">
      <div class="module-head">
        <div class="module-icon">${item.name.slice(0, 2).toUpperCase()}</div>
        <span class="status ${item.health}">${item.health === 'good' ? 'РђРєС‚РёРІРµРЅ' : 'Р’РЅРёРјР°РЅРёРµ'}</span>
      </div>
      <h3 style="margin-top:14px">${item.name}</h3>
      <p class="muted">${item.group} В· ${item.metric}</p>
      <div class="progress"><span style="width:${item.progress}%"></span></div>
      <div class="chip-list">${item.tags.map(tag => `<span class="chip">${tag}</span>`).join('')}</div>
    </article>
  `;
}

function integrationsTable(integrations) {
  return `
    <table>
      <thead><tr><th>РџР»Р°С‚С„РѕСЂРјР°</th><th>Р РµР¶РёРј</th><th>РЎС‚Р°С‚СѓСЃ</th><th>РџРѕСЃР»РµРґРЅСЏСЏ СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёСЏ</th><th>Р—Р°РєР°Р·С‹</th><th>Р Р°Р·РЅРёС†Р° РѕСЃС‚Р°С‚РєРѕРІ</th></tr></thead>
      <tbody>
        ${integrations.map(item => `
          <tr>
            <td><strong>${item.name}</strong></td>
            <td>${item.mode}</td>
            <td><span class="status ${item.status}">${statusLabel(item.status)}</span></td>
            <td>${item.lastSync}</td>
            <td>${item.orders}</td>
            <td>${item.stockDelta}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function eventCard(event) {
  return `
    <div class="event">
      <div class="row"><strong>${event.source}</strong><span class="status connected">${event.status}</span></div>
      <p class="muted" style="margin:8px 0 0">${event.time} В· ${event.type}</p>
      <p style="margin:8px 0 0">${event.detail}</p>
    </div>
  `;
}

function statusLabel(status) {
  return {
    connected: 'РџРѕРґРєР»СЋС‡РµРЅРѕ',
    pending: 'РћР¶РёРґР°РµС‚',
    draft: 'Р§РµСЂРЅРѕРІРёРє'
  }[status] || status;
}

function renderModules() {
  layout(`
    <p class="eyebrow">Карта модулей ${escapeHtml(appBrand())}</p>
    <h1>РћРїРµСЂР°С†РёРѕРЅРЅС‹Рµ РјРѕРґСѓР»Рё</h1>
    <p class="muted">РљР°Р¶РґС‹Р№ РјРѕРґСѓР»СЊ РјРѕР¶РЅРѕ СЂР°СЃС€РёСЂРёС‚СЊ СЃРѕР±СЃС‚РІРµРЅРЅС‹РјРё endpoint-Р°РјРё РјР°СЂРєРµС‚РїР»РµР№СЃРѕРІ, РѕС‡РµСЂРµРґСЏРјРё Рё РѕС‚С‡РµС‚Р°РјРё.</p>
    <section class="grid modules">
      ${dashboardData.modules.map(moduleCard).join('')}
    </section>
  `);
}

function renderIntegrations() {
  layout(`
    <p class="eyebrow">Р¦РµРЅС‚СЂ API-РёРЅС‚РµРіСЂР°С†РёР№</p>
    <h1>РџРѕРґРєР»СЋС‡РµРЅРёСЏ РјР°СЂРєРµС‚РїР»РµР№СЃРѕРІ</h1>
    <section class="grid two-col">
      <div class="panel">
        <h2>РџСЂРѕРІРµСЂРёС‚СЊ РїРѕРґРєР»СЋС‡РµРЅРёРµ</h2>
        <form id="integrationForm" class="form-grid">
          <div class="field">
            <label for="provider">РџР»Р°С‚С„РѕСЂРјР°</label>
            <select id="provider">
              <option>${escapeHtml(appBrand())}</option>
              <option>${escapeHtml(appProductName())}</option>
              <option>Yandex Market</option>
              <option>Trendyol</option>
              <option>РЎРѕР±СЃС‚РІРµРЅРЅС‹Р№ РјР°СЂРєРµС‚РїР»РµР№СЃ</option>
            </select>
          </div>
          <div class="field">
            <label for="mode">Р РµР¶РёРј СЂР°Р±РѕС‚С‹</label>
            <select id="mode">
              <option>FBO</option>
              <option>FBS</option>
              <option>DBS / RealFBS</option>
              <option>РЎРѕР±СЃС‚РІРµРЅРЅС‹Р№ API</option>
            </select>
          </div>
          <div class="field">
            <label for="baseUrl">Base URL</label>
            <input id="baseUrl" value="https://api.marketplace.example/v1">
          </div>
          <div class="field">
            <label for="apiKey">API key</label>
            <input id="apiKey" value="demo_12345_secret">
          </div>
          <button class="btn primary" type="submit">РџСЂРѕРІРµСЂРёС‚СЊ РїРѕРґРєР»СЋС‡РµРЅРёРµ</button>
        </form>
        <div id="integrationResult" class="result hidden"></div>
      </div>
      <div class="panel">
        <h2>Р“РѕС‚РѕРІР°СЏ СЃС‚СЂСѓРєС‚СѓСЂР° endpoint-РѕРІ</h2>
        <div class="event-list">
          <div class="event"><strong>GET /api/dashboard</strong><p class="muted">РњРµС‚СЂРёРєРё РїР°РЅРµР»Рё, РјРѕРґСѓР»Рё Рё РёРЅС‚РµРіСЂР°С†РёРё.</p></div>
          <div class="event"><strong>POST /api/integrations/test</strong><p class="muted">РџСЂРѕРІРµСЂРєР° РєР»СЋС‡Р° РјР°СЂРєРµС‚РїР»РµР№СЃР° Рё URL.</p></div>
          <div class="event"><strong>POST /api/sync</strong><p class="muted">Р—Р°РїСѓСЃРєР°РµС‚ СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёСЋ Р·Р°РєР°Р·РѕРІ, РѕСЃС‚Р°С‚РєРѕРІ Рё РєР°СЂС‚РѕС‡РµРє С‚РѕРІР°СЂРѕРІ.</p></div>
        </div>
      </div>
    </section>
    <section class="panel" style="margin-top:18px">
      <h2>РџР»Р°С‚С„РѕСЂРјС‹</h2>
      ${integrationsTable(dashboardData.integrations)}
    </section>
  `);

  document.querySelector('#integrationForm').addEventListener('submit', async event => {
    event.preventDefault();
    const resultBox = document.querySelector('#integrationResult');
    const result = await api('/api/integrations/test', {
      method: 'POST',
      body: JSON.stringify({
        provider: document.querySelector('#provider').value,
        mode: document.querySelector('#mode').value,
        baseUrl: document.querySelector('#baseUrl').value,
        apiKey: document.querySelector('#apiKey').value
      })
    });
    resultBox.classList.remove('hidden');
    resultBox.textContent = result.message;
  });
}

async function renderCatalog() {
  if (!catalogData) {
    catalogData = await api('/api/catalog');
  }
  if (selectedCatalogSection === 'РљР°С‚РµРіРѕСЂРёРё' && !savedCategories) {
    savedCategories = (await api('/api/catalog/categories')).categories;
  }
  if (selectedCatalogSection === 'РўРѕРІР°СЂС‹') {
    if (!savedCategories) savedCategories = (await api('/api/catalog/categories')).categories;
    if (!catalogColors) catalogColors = (await api('/api/catalog/colors')).colors;
    if (!catalogMaterials) catalogMaterials = (await api('/api/catalog/materials')).materials;
    if (!catalogBrands) catalogBrands = (await api('/api/catalog/brands')).brands;
    if (!catalogProducts) catalogProducts = (await api('/api/catalog/products')).products;
  }
  if (selectedCatalogSection === 'Р‘СЂРµРЅРґС‹') {
    if (!catalogProducts) catalogProducts = (await api('/api/catalog/products')).products;
    catalogBrands = (await api('/api/catalog/brands')).brands;
  }
  if (selectedCatalogSection === 'Р¦РІРµС‚Р°' && !catalogColors) {
    catalogColors = (await api('/api/catalog/colors')).colors;
  }
  const categories = savedCategories || [];
  const productsForStats = selectedCatalogSection === 'РўРѕРІР°СЂС‹' ? (catalogProducts || []) : [];
  const catalogStats = {
    products: productsForStats.length,
    categories: categories.length,
    stock: productsForStats.reduce((sum, product) => sum + Number(product.stock || 0), 0),
    averagePrice: productsForStats.length
      ? productsForStats.reduce((sum, product) => sum + Number(product.salePrice || 0), 0) / productsForStats.length
      : 0,
    importStatus: 'Р“РѕС‚РѕРІР°'
  };
  const categoryButtons = selectedCatalogSection === 'РљР°С‚РµРіРѕСЂРёРё' ? buildCategoryPathRows(categories) : '';
  let sectionPanel = `
    <section class="panel" style="margin-top:18px">
      <div class="empty-state">
        <img class="empty-icon" src="/assets/icon-folder.svg" alt="">
        <div>
          <h3>${catalogLabel(selectedCatalogSection)}</h3>
          <p class="muted">Р—РґРµСЃСЊ Р±СѓРґСѓС‚ СЂР°Р·РјРµС‰РµРЅС‹ РјРѕРґСѓР»Рё СЌС‚РѕРіРѕ СЂР°Р·РґРµР»Р° РєР°С‚Р°Р»РѕРіР°.</p>
        </div>
      </div>
    </section>
  `;

  if (selectedCatalogSection === 'РљР°С‚РµРіРѕСЂРёРё') {
    sectionPanel = `
      <section class="panel" style="margin-top:18px">
        <div class="section-head">
          <div>
            <h2>РљР°С‚РµРіРѕСЂРёРё</h2>
            <p class="muted">РЎРѕР·РґР°РІР°Р№С‚Рµ Рё С…СЂР°РЅРёС‚Рµ РєР°С‚РµРіРѕСЂРёРё РєР°С‚Р°Р»РѕРіР°.</p>
          </div>
          <button class="btn primary" type="button" id="addCategoryButton" data-parent="Р‘РµР· РєР°С‚РµРіРѕСЂРёРё">Р”РѕР±Р°РІРёС‚СЊ РєР°С‚РµРіРѕСЂРёСЋ</button>
        </div>
        <div class="category-board ${categoryButtons ? '' : 'hidden'}">
          ${categoryButtons}
        </div>
        <div class="empty-state ${categoryButtons ? 'hidden' : ''}">
          <img class="empty-icon" src="/assets/icon-folder.svg" alt="">
          <div>
            <h3>РљР°С‚РµРіРѕСЂРёР№ РїРѕРєР° РЅРµС‚</h3>
            <p class="muted">РќР°Р¶РјРёС‚Рµ В«Р”РѕР±Р°РІРёС‚СЊ РєР°С‚РµРіРѕСЂРёСЋВ», С‡С‚РѕР±С‹ СЃРѕР·РґР°С‚СЊ РїРµСЂРІСѓСЋ РєР°С‚РµРіРѕСЂРёСЋ.</p>
          </div>
        </div>
      </section>
      ${categoryModal()}
    `;
  }

  if (selectedCatalogSection === 'РўРѕРІР°СЂС‹') {
    sectionPanel = productEditorOpen ? productEditorPanel() : productModulesPanel();
  }

  if (selectedCatalogSection === 'Р¦РІРµС‚Р°') {
    sectionPanel = colorsPanel();
  }
  if (selectedCatalogSection === 'Р‘СЂРµРЅРґС‹') {
    sectionPanel = brandsPanel();
  }

  layout(`
    <div class="top-actions catalog-page-head ${selectedCatalogSection === 'РўРѕРІР°СЂС‹' ? 'product-catalog-head' : ''}">
      <div>
        <h1>${catalogLabel(selectedCatalogSection)}</h1>
      </div>
    </div>
    ${sectionPanel}
  `);

  if (selectedCatalogSection === 'РљР°С‚РµРіРѕСЂРёРё') {
    bindCategoryForm();
  }

  if (selectedCatalogSection === 'РўРѕРІР°СЂС‹') {
    productEditorOpen ? bindProductEditor() : bindProductModules();
  }
  if (selectedCatalogSection === 'Р‘СЂРµРЅРґС‹') {
    bindBrandsPanel();
  }
}

const defaultProductImages = [
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=140&q=80',
  'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?auto=format&fit=crop&w=140&q=80',
  'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=140&q=80'
];

function defaultProducts() {
  return [];
}

function getStoredProducts() {
  return catalogProducts || [];
}

function saveStoredProducts(products) {
  catalogProducts = products;
}

function createProductFromDraft() {
  const value = id => document.querySelector(id)?.value.trim() || '';
  const name = productDraftName.trim() || productDraftCategory || 'РќРѕРІС‹Р№ С‚РѕРІР°СЂ';
  const category = productDraftCategory || 'Р‘РµР· РєР°С‚РµРіРѕСЂРёРё';
  const marketplaceArticle = value('#newProductArticle') || productGeneratedArticle || generateMarketplaceArticle();
  return {
    id: `tc-${Date.now()}`,
    image: productDraftMedia.find(file => file.kind === 'image')?.preview || defaultProductImages[Math.floor(Math.random() * defaultProductImages.length)],
    name,
    assortment: value('#newProductAssortment') || name,
    category,
    stock: Number(value('#newProductStock') || 0),
    purchasePrice: Number(value('#newProductPurchasePrice') || 0),
    salePrice: Number(value('#newProductSalePrice') || 0),
    brand: value('#newProductBrand') || appConfig.defaultBrand || appBrand(),
    manufacturer: value('#newProductManufacturer') || appConfig.defaultBrand || appBrand(),
    season: value('#newProductSeason') || 'Р’СЃРµСЃРµР·РѕРЅРЅС‹Р№',
    availability: value('#newProductAvailability') || 'Р”РѕСЃС‚СѓРїРЅС‹ Рє РїСЂРѕРґР°Р¶Рµ',
    barcode: value('#newProductBarcode'),
    wb: marketplaceArticle,
    seller: value('#newProductSellerArticle') || `TC-${Date.now().toString().slice(-6)}`,
    color: 'вЂ”',
    sizes: 'вЂ”',
    marketplaceSku: marketplaceArticle,
    media: productDraftMedia
  };
}

function generateMarketplaceArticle() {
  const time = String(Date.now());
  const random = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
  return `${time}${random}`.slice(0, 18);
}

function fileToMediaPayload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      name: file.name,
      type: file.type || 'application/octet-stream',
      kind: file.type.startsWith('video/') ? 'video' : 'image',
      size: file.size,
      data: reader.result,
      preview: reader.result
    });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const productStatusTabs = [
  { id: 'all', label: 'Р’СЃРµ' },
  { id: 'sale', label: 'Р’ РїСЂРѕРґР°Р¶Рµ' },
  { id: 'ready', label: 'Р“РѕС‚РѕРІС‹ Рє РїСЂРѕРґР°Р¶Рµ' },
  { id: 'errors', label: 'РћС€РёР±РєРё' },
  { id: 'review', label: 'РќР° РґРѕСЂР°Р±РѕС‚РєСѓ' },
  { id: 'removed', label: 'РЎРЅСЏС‚С‹ СЃ РїСЂРѕРґР°Р¶Рё' },
  { id: 'archive', label: 'РђСЂС…РёРІ' }
];

function productStatusText(product) {
  return [
    product.status,
    product.availability,
    product.state,
    product.moderationStatus,
    product.saleStatus
  ].filter(Boolean).join(' ').toLowerCase();
}

function getProductListStatus(product) {
  const text = productStatusText(product);
  const stock = Number(product.stock || 0);
  const hasName = String(product.name || '').trim();
  const hasCategory = String(product.category || '').trim();

  if (product.archived || text.includes('Р°СЂС…РёРІ')) return 'archive';
  if (product.removedFromSale || product.saleStopped || text.includes('СЃРЅСЏС‚')) return 'removed';
  if (product.hasError || product.error || text.includes('РѕС€РёР±')) return 'errors';
  if (!hasName || !hasCategory) return 'errors';
  if (product.needsWork || product.inReview || text.includes('РґРѕСЂР°Р±РѕС‚') || text.includes('С‡РµСЂРЅРѕРІ') || text.includes('РїРѕРґРіРѕС‚РѕРІ')) return 'review';
  if (stock > 0) return 'sale';
  return 'ready';
}

function getProductStatusCounts(products) {
  return productStatusTabs.reduce((counts, tab) => {
    counts[tab.id] = tab.id === 'all'
      ? products.length
      : products.filter(product => getProductListStatus(product) === tab.id).length;
    return counts;
  }, {});
}

function brandsPanel() {
  const products = catalogProducts || [];
  const byName = new Map();

  (catalogBrands || []).forEach(brand => {
    const name = String(brand.name || brand || '').trim();
    if (!name) return;
    byName.set(name.toLowerCase(), { ...(typeof brand === 'object' ? brand : {}), name, products: [] });
  });

  products.forEach(product => {
    const name = String(product.brand || '').trim() || 'Р‘СЂРµРЅРґ РЅРµ СѓРєР°Р·Р°РЅ';
    const key = name.toLowerCase();
    const item = byName.get(key) || { id: key, name, source: 'product', products: [] };
    item.products.push(product);
    byName.set(key, item);
  });

  const brands = Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  const totalProducts = brands.reduce((sum, brand) => sum + brand.products.length, 0);

  return `
    <section class="brand-page">
      <div class="brand-summary">
        <div>
          <span>РЎРїСЂР°РІРѕС‡РЅРёРє Р±СЂРµРЅРґРѕРІ</span>
          <strong>${brands.length}</strong>
        </div>
        <div>
          <span>РўРѕРІР°СЂРѕРІ СЃ Р±СЂРµРЅРґРѕРј</span>
          <strong>${totalProducts}</strong>
        </div>
        <div>
          <span>РџРѕСЃР»РµРґРЅСЏСЏ СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёСЏ</span>
          <strong>Р“РѕС‚РѕРІРѕ</strong>
        </div>
      </div>

      <section class="panel brand-panel">
        <div class="section-head">
          <div>
            <h2>Р‘СЂРµРЅРґС‹</h2>
            <p class="muted">Все бренды собираются из товаров и сохраняются в каталоге ${escapeHtml(appBrand())}.</p>
          </div>
          <form class="brand-form" id="brandForm">
            <input id="brandNameInput" placeholder="РќР°Р·РІР°РЅРёРµ Р±СЂРµРЅРґР°" autocomplete="off">
            <button class="btn primary" type="submit">Р”РѕР±Р°РІРёС‚СЊ Р±СЂРµРЅРґ</button>
          </form>
        </div>
        <p class="result hidden" id="brandResult"></p>
        <div class="brand-grid ${brands.length ? '' : 'hidden'}">
          ${brands.map(brand => `
            <article class="brand-card">
              <div class="brand-mark">${escapeHtml(brand.name.slice(0, 2).toUpperCase())}</div>
              <div>
                <strong>${escapeHtml(brand.name)}</strong>
                <span>${brand.products.length} С‚РѕРІР°СЂРѕРІ</span>
              </div>
              <small>${brand.source === 'manual' ? 'Р”РѕР±Р°РІР»РµРЅ РІСЂСѓС‡РЅСѓСЋ' : 'РР· С‚РѕРІР°СЂРѕРІ'}</small>
            </article>
          `).join('')}
        </div>
        <div class="empty-state ${brands.length ? 'hidden' : ''}">
          <img class="empty-icon" src="/assets/icon-folder.svg" alt="">
          <div>
            <h3>Р‘СЂРµРЅРґРѕРІ РїРѕРєР° РЅРµС‚</h3>
            <p class="muted">Р”РѕР±Р°РІСЊС‚Рµ РїРµСЂРІС‹Р№ Р±СЂРµРЅРґ РёР»Рё СЃРѕР·РґР°Р№С‚Рµ С‚РѕРІР°СЂ СЃ РЅРѕРІС‹Рј Р±СЂРµРЅРґРѕРј.</p>
          </div>
        </div>
      </section>
    </section>
  `;
}

function bindBrandsPanel() {
  const form = document.querySelector('#brandForm');
  const input = document.querySelector('#brandNameInput');
  const result = document.querySelector('#brandResult');
  if (!form || !input) return;

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const name = input.value.trim();
    if (!name) {
      result.textContent = 'РЈРєР°Р¶РёС‚Рµ РЅР°Р·РІР°РЅРёРµ Р±СЂРµРЅРґР°.';
      result.classList.remove('hidden');
      return;
    }
    const response = await api('/api/catalog/brands', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
    catalogBrands = response.brands;
    input.value = '';
    result.textContent = `Р‘СЂРµРЅРґ "${name}" СЃРѕС…СЂР°РЅРµРЅ.`;
    result.classList.remove('hidden');
    renderCatalog();
  });
}

function colorsPanel() {
  const colors = catalogColors || [];
  return `
    <section class="panel" style="margin-top:18px">
      <div class="section-head">
        <div>
          <h2>Р¦РІРµС‚Р°</h2>
          <p class="muted">Р¦РІРµС‚Р° СЃРёРЅС…СЂРѕРЅРёР·РёСЂСѓСЋС‚СЃСЏ РёР· РїР°РїРєРё D:\\thechamp\\katalog\\Р¦РІРµС‚Р°.</p>
        </div>
        <img class="section-icon" src="/assets/icon-color.svg" alt="">
      </div>
      <div class="color-grid">
        ${colors.map(color => `
          <button class="color-choice" type="button">
            <span style="background:${color.hex || '#f7f7f7'}"></span>${color.name}
          </button>
        `).join('')}
      </div>
      <div class="empty-state ${colors.length ? 'hidden' : ''}">
        <img class="empty-icon" src="/assets/icon-color.svg" alt="">
        <div>
          <h3>Р¦РІРµС‚РѕРІ РїРѕРєР° РЅРµС‚</h3>
          <p class="muted">Р”РѕР±Р°РІСЊС‚Рµ РїР°РїРєСѓ С†РІРµС‚Р° РІ D:\\thechamp\\katalog\\Р¦РІРµС‚Р°, Рё РѕРЅР° РїРѕСЏРІРёС‚СЃСЏ Р·РґРµСЃСЊ.</p>
        </div>
      </div>
    </section>
  `;
}

function productModulesPanel() {
  const products = catalogProducts || [];
  const productRows = products.map(product => productRow(product)).join('');
  const statusCounts = getProductStatusCounts(products);
  if (!productStatusTabs.some(tab => tab.id === activeProductStatus)) activeProductStatus = 'all';

  return `
    <section class="product-list-page">
      <div class="product-list-top">
        <div>
          <div class="product-breadcrumb">
            <span>в†ђ</span>
            <span>РўРѕРІР°СЂС‹</span>
            <span>вЂє</span>
            <strong>Р Р°Р±РѕС‚Р° СЃ С‚РѕРІР°СЂР°РјРё</strong>
          </div>
          <h1>РЎРїРёСЃРѕРє С‚РѕРІР°СЂРѕРІ</h1>
        </div>
        <div class="product-list-actions">
          <button class="btn soft" type="button">РЎРєР°С‡Р°С‚СЊ С€Р°Р±Р»РѕРЅС‹</button>
          <button class="btn primary" id="addProductButton" type="button">Р”РѕР±Р°РІРёС‚СЊ С‚РѕРІР°СЂС‹</button>
        </div>
      </div>

      <div class="product-status-tabs">
        ${productStatusTabs.map(tab => `
          <button class="${activeProductStatus === tab.id ? 'active' : ''}" type="button" data-product-status-tab="${tab.id}">
            ${tab.label} <span>${statusCounts[tab.id] || 0}</span>
          </button>
        `).join('')}
      </div>

      <div class="product-list-toolbar">
        <label class="product-list-search">
          <img src="/assets/icon-search.svg" alt="">
          <input id="productSearchInput" placeholder="РќР°Р·РІР°РЅРёРµ, Р°СЂС‚РёРєСѓР», SKU, С€С‚СЂРёС…РєРѕРґ">
        </label>
        <button class="btn soft" id="applyProductFilters" type="button">Р¤РёР»СЊС‚СЂС‹вЊ„</button>
        <button class="btn danger-outline" id="deleteSelectedProducts" type="button">РЈРґР°Р»РёС‚СЊ РІС‹Р±СЂР°РЅРЅС‹Рµ</button>
        <button class="btn soft" id="resetProductFilters" type="button">РЎР±СЂРѕСЃРёС‚СЊ</button>
      </div>

      <p class="result hidden" id="productModuleResult"></p>

      <div class="product-table-shell">
        <div class="product-table" id="productTable">
          <div class="product-table-head product-table-head-modern">
            <label class="product-check"><input id="selectAllProducts" type="checkbox"></label>
            <span>РўРѕРІР°СЂ</span>
            <span>РђСЂС‚РёРєСѓР» / SKU</span>
            <span>РЎС‚Р°С‚СѓСЃ</span>
            <span>Р¦РµРЅР°</span>
            <span>РћСЃС‚Р°С‚РєРё</span>
            <span>РЁС‚СЂРёС…РєРѕРґ</span>
            <span>РљР°С‡РµСЃС‚РІРѕ</span>
            <span>Р”Р°С‚Р° / РѕР±СЉРµРј</span>
            <span></span>
          </div>          ${productRows}
        </div>
        <div class="empty-state ${products.length ? 'hidden' : ''}">
          <img class="empty-icon" src="/assets/icon-folder.svg" alt="">
          <div>
            <h3>РўРѕРІР°СЂРѕРІ РїРѕРєР° РЅРµС‚</h3>
            <p class="muted">РќР°Р¶РјРёС‚Рµ В«Р”РѕР±Р°РІРёС‚СЊ С‚РѕРІР°СЂС‹В», Р·Р°РїРѕР»РЅРёС‚Рµ РґР°РЅРЅС‹Рµ, Рё С‚РѕРІР°СЂ РїРѕСЏРІРёС‚СЃСЏ РІ СЌС‚РѕР№ С‚Р°Р±Р»РёС†Рµ.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function productRow(product) {
  const productName = product.name || 'Р‘РµР· РЅР°Р·РІР°РЅРёСЏ';
  const article = product.seller || product.marketplaceSku || product.wb || product.id || 'вЂ”';
  const sku = product.marketplaceSku || product.wb || product.barcode || article;
  const stock = Number(product.stock || 0);
  const price = Number(product.salePrice || product.price || 0);
  const barcode = product.barcode || product.marketplaceSku || `TCP${String(product.id || '').replace(/\D/g, '').slice(0, 10)}`;
  const volume = product.volume || '1,20';
  const rating = product.rating || '0';
  const contentRating = product.contentRating || '86,5';
  const created = product.createdAt ? String(product.createdAt).slice(0, 10) : 'вЂ”';
  const status = product.availability || (stock > 0 ? 'РџСЂРѕРґР°РµС‚СЃСЏ' : 'РќРµС‚ РІ РЅР°Р»РёС‡РёРё');
  const listStatus = getProductListStatus(product);
  const removedReason = product.removedReason || product.saleStopReason || product.deactivationReason || 'РџСЂРёС‡РёРЅР° РЅРµ СѓРєР°Р·Р°РЅР°';
  const search = [
    productName,
    article,
    sku,
    product.category,
    product.brand,
    product.manufacturer,
    product.season,
    status,
    barcode
  ].join(' ').toLowerCase();

  return `
    <article class="product-row product-row-modern" data-product-search="${escapeHtml(search)}"
      data-assortment="${escapeHtml(product.assortment || productName)}"
      data-stock="${escapeHtml(stock)}"
      data-category="${escapeHtml(product.category || '')}"
      data-purchaseprice="${escapeHtml(product.purchasePrice || '')}"
      data-saleprice="${escapeHtml(price)}"
      data-brand="${escapeHtml(product.brand || '')}"
      data-manufacturer="${escapeHtml(product.manufacturer || '')}"
      data-season="${escapeHtml(product.season || '')}"
      data-availability="${escapeHtml(status)}"
      data-product-status="${escapeHtml(listStatus)}">
      <label class="product-check"><input type="checkbox" data-product-select="${escapeHtml(product.id)}"></label>
      <div class="product-main-cell">
        <img class="product-thumb" src="${product.image || '/assets/icon-folder.svg'}" alt="">
        <div class="product-title-cell">
          <a href="#">${escapeHtml(productName)}</a>
          <span>${escapeHtml(product.category || 'Р‘РµР· РєР°С‚РµРіРѕСЂРёРё')}</span>
          <small>${escapeHtml(product.brand || 'Р‘СЂРµРЅРґ РЅРµ СѓРєР°Р·Р°РЅ')}</small>
        </div>
      </div>
      <div class="product-article-cell">
        <strong>${escapeHtml(article)}</strong>
        <span>SKU ${escapeHtml(sku)}</span>
        <small>РћР±СЉРµРґРёРЅРµРЅ</small>
      </div>
      <div class="product-status-cell">
        <span class="product-status-pill">${escapeHtml(status)}</span>
        ${listStatus === 'removed' ? `<small class="removed-reason">${escapeHtml(removedReason)}</small>` : ''}
        <button class="product-add-label" type="button">Р”РѕР±Р°РІРёС‚СЊ РјРµС‚РєСѓ</button>
      </div>
      <div class="product-price-cell">
        <strong>${formatMoney(price)}</strong>
        <span>Р’Р°С€Р° С†РµРЅР°</span>
      </div>
      <div class="product-stock-cell">
        <strong>${escapeHtml(stock)}</strong>
        <span>${escapeHtml(appBrand())}</span>
        <small>${escapeHtml(product.myStock || 1)} РЅР° СЃРєР»Р°РґРµ</small>
      </div>
      <a class="product-link-cell" href="#">${escapeHtml(barcode)}</a>
      <div class="product-quality-cell">
        <span>РћС‚Р·С‹РІС‹: <strong>0</strong></span>
        <span>Р РµР№С‚РёРЅРі: <strong>${escapeHtml(rating)}</strong></span>
        <span>РљРѕРЅС‚РµРЅС‚: <strong>${escapeHtml(contentRating)}</strong></span>
      </div>
      <div class="product-date-cell">
        <strong>${escapeHtml(created)}</strong>
        <span>${escapeHtml(volume)} Р»</span>
      </div>
      <div class="row-actions">
        <button type="button" title="РђРЅР°Р»РёС‚РёРєР°">в–Ґ</button>
        <button type="button" title="Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ">вњЋ</button>
        <button type="button" data-delete-product="${escapeHtml(product.id)}" title="РЈРґР°Р»РёС‚СЊ">в‹®</button>
      </div>
    </article>
  `;
}
function categoryModal() {
  const parentOptions = buildCategoryParentOptions(savedCategories || []);
  return `
    <div class="modal-backdrop hidden" id="categoryModal">
      <form class="modal category-form" id="categoryForm">
        <div class="section-head">
          <h2>Р”РѕР±Р°РІР»РµРЅРёРµ РєР°С‚РµРіРѕСЂРёРё</h2>
          <button class="btn" type="button" id="closeCategoryModal">Р—Р°РєСЂС‹С‚СЊ</button>
        </div>
        <div class="form-stack">
          <input id="categoryName" name="name" placeholder="РќР°Р·РІР°РЅРёРµ" required>
          <input id="categoryUrl" name="url" placeholder="URL">
          <label class="field compact">
            <span>Р РѕРґРёС‚РµР»СЊСЃРєР°СЏ РєР°С‚РµРіРѕСЂРёСЏ</span>
            <select id="categoryParent" name="parent">
              <option>Р‘РµР· РєР°С‚РµРіРѕСЂРёРё</option>
              ${parentOptions}
            </select>
          </label>
          <label class="field compact">
            <span>ID РєР°С‚РµРіРѕСЂРёРё РІ СЃРёСЃС‚РµРјРµ 1C</span>
            <input id="categoryOneCId" name="oneCId" value="0">
          </label>
          <label class="field compact">
            <span>РџРѕСЂСЏРґРѕРє СЃРѕСЂС‚РёСЂРѕРІРєРё</span>
            <input id="categorySortOrder" name="sortOrder" type="number" value="1" min="1">
          </label>
          <p class="muted">( РћС‚ РјРµРЅСЊС€РµРіРѕ Рє Р±РѕР»СЊС€РµРјСѓ )</p>
          <label class="switch-row">
            <input id="categoryActive" name="active" type="checkbox">
            <span class="switch"></span>
            РђРєС‚РёРІРЅРѕСЃС‚СЊ РєР°С‚РµРіРѕСЂРёРё
          </label>
          <label class="switch-row">
            <input id="categoryShowHome" name="showHome" type="checkbox">
            <span class="switch"></span>
            РџРѕРєР°Р·С‹РІР°С‚СЊ РЅР° РіР»Р°РІРЅРѕР№
          </label>
          <label class="field compact">
            <span>РР·РѕР±СЂР°Р¶РµРЅРёРµ РєР°С‚РµРіРѕСЂРёРё (РіР»Р°РІРЅР°СЏ)</span>
            <input id="categoryMainImage" name="mainImage" type="file" accept="image/*">
          </label>
          <div>
            <p class="muted"><strong>РРєРѕРЅРєР° (48x48px)</strong></p>
            <label class="dropzone" for="categoryIcon">
              <input id="categoryIcon" name="icon" type="file" accept="image/*">
              <strong>РџРµСЂРµС‚Р°С‰РёС‚Рµ РёР·РѕР±СЂР°Р¶РµРЅРёРµ СЃСЋРґР°</strong>
              <span>РёР»Рё</span>
              <span class="upload-link">РќР°Р¶РјРёС‚Рµ, С‡С‚РѕР±С‹ Р·Р°РіСЂСѓР·РёС‚СЊ</span>
            </label>
          </div>
          <p class="error" id="categoryFormError"></p>
          <div class="row end">
            <button class="btn" type="button" id="cancelCategoryButton">РћС‚РјРµРЅР°</button>
            <button class="btn primary" type="submit">РЎРѕС…СЂР°РЅРёС‚СЊ РєР°С‚РµРіРѕСЂРёСЋ</button>
          </div>
        </div>
      </form>
    </div>
  `;
}

function bindProductModules() {
  const result = document.querySelector('#productModuleResult');
  const searchInput = document.querySelector('#productSearchInput');
  const showResult = message => {
    result.textContent = message;
    result.classList.remove('hidden');
  };

  const filterProducts = () => {
    const query = searchInput.value.trim().toLowerCase();
    document.querySelectorAll('[data-product-search]').forEach(row => {
      const matchesSearch = !query || row.dataset.productSearch.includes(query);
      const matchesStatus = activeProductStatus === 'all' || row.dataset.productStatus === activeProductStatus;
      row.classList.toggle('hidden', !matchesSearch || !matchesStatus);
    });
  };

  searchInput.addEventListener('input', filterProducts);
  document.querySelectorAll('[data-product-status-tab]').forEach(button => {
    button.addEventListener('click', () => {
      activeProductStatus = button.dataset.productStatusTab;
      localStorage.setItem('thechamp_product_status', activeProductStatus);
      document.querySelectorAll('[data-product-status-tab]').forEach(tab => {
        tab.classList.toggle('active', tab === button);
      });
      document.querySelector('#selectAllProducts').checked = false;
      document.querySelectorAll('[data-product-select]').forEach(input => {
        input.checked = false;
      });
      filterProducts();
    });
  });
  document.querySelector('#applyProductFilters')?.addEventListener('click', filterProducts);
  document.querySelector('#resetProductFilters')?.addEventListener('click', () => {
    searchInput.value = '';
    activeProductStatus = 'all';
    localStorage.setItem('thechamp_product_status', activeProductStatus);
    document.querySelectorAll('[data-product-status-tab]').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.productStatusTab === activeProductStatus);
    });
    filterProducts();
  });
  filterProducts();

  document.querySelector('#selectAllProducts')?.addEventListener('change', event => {
    document.querySelectorAll('[data-product-select]').forEach(input => {
      const row = input.closest('.product-row');
      if (!row.classList.contains('hidden')) input.checked = event.target.checked;
    });
  });

  const deleteProducts = async ids => {
    if (!ids.length) {
      showResult('Р’С‹Р±РµСЂРёС‚Рµ С‚РѕРІР°СЂС‹ РґР»СЏ СѓРґР°Р»РµРЅРёСЏ.');
      return;
    }
    const response = await api('/api/catalog/products/delete', {
      method: 'POST',
      body: JSON.stringify({ ids })
    });
    catalogProducts = response.products;
    showResult(`РЈРґР°Р»РµРЅРѕ С‚РѕРІР°СЂРѕРІ: ${ids.length}.`);
    renderCatalog();
  };

  document.querySelector('#deleteSelectedProducts')?.addEventListener('click', () => {
    const ids = Array.from(document.querySelectorAll('[data-product-select]:checked')).map(input => input.dataset.productSelect);
    deleteProducts(ids);
  });

  document.querySelectorAll('[data-delete-product]').forEach(button => {
    button.addEventListener('click', () => deleteProducts([button.dataset.deleteProduct]));
  });

  document.querySelector('#addProductButton').addEventListener('click', () => {
    productEditorOpen = true;
    productDraftName = '';
    productDraftCategory = '';
    productManualCategoryOpen = false;
    productManualCategoryQuery = '';
    productDraftMedia = [];
    productGeneratedArticle = generateMarketplaceArticle();
    renderCatalog();
  });
}

const backupSections = [
  { id: 'products', title: 'Buck up Product', subtitle: 'РЈРґР°Р»РµРЅРЅС‹Рµ С‚РѕРІР°СЂС‹' },
  { id: 'files', title: 'Buck up file', subtitle: 'РЈРґР°Р»РµРЅРЅС‹Рµ С„Р°Р№Р»С‹' },
  { id: 'blogs', title: 'Buck up blog', subtitle: 'РЈРґР°Р»РµРЅРЅС‹Рµ Р±Р»РѕРєРё' },
  { id: 'free', title: 'Buck up free', subtitle: 'Р’СЃРµ СѓРґР°Р»РµРЅРЅС‹Рµ РґР°РЅРЅС‹Рµ' }
];

function backupItemsForSection() {
  if (!backupData) return [];
  return backupData[selectedBackupSection] || [];
}

function backupProductRow(item) {
  const product = item.payload || {};
  return `
    <article class="backup-row" data-backup-search="${escapeHtml([item.name, item.article, item.category, item.deletedAt].join(' ').toLowerCase())}">
      <label class="product-check"><input type="checkbox" data-backup-select="${escapeHtml(item.backupId)}" data-backup-type="${escapeHtml(item.type || selectedBackupSection)}"></label>
      <div class="backup-main">
        <strong>${escapeHtml(item.name || product.name || 'РЈРґР°Р»РµРЅРЅС‹Р№ СЌР»РµРјРµРЅС‚')}</strong>
        <span>${escapeHtml(item.category || product.category || 'Р‘РµР· РєР°С‚РµРіРѕСЂРёРё')}</span>
      </div>
      <div class="backup-meta">
        <strong>${escapeHtml(item.article || product.seller || product.marketplaceSku || 'вЂ”')}</strong>
        <span>${escapeHtml(product.barcode || product.wb || '')}</span>
      </div>
      <div class="backup-meta">
        <strong>${escapeHtml(item.deletedAt || 'вЂ”')}</strong>
        <span>${item.archivedFiles ? 'Р¤Р°Р№Р»С‹ СЃРѕС…СЂР°РЅРµРЅС‹' : 'РўРѕР»СЊРєРѕ РґР°РЅРЅС‹Рµ'}</span>
      </div>
      <span class="backup-pill">${item.type === 'product' ? 'Product' : 'Data'}</span>
    </article>
  `;
}

function backupPlaceholderRows(items) {
  if (items.length) return items.map(backupProductRow).join('');
  const active = backupSections.find(section => section.id === selectedBackupSection);
  return `
    <div class="backup-empty">
      <img class="empty-icon" src="/assets/icon-folder.svg" alt="">
      <div>
        <h3>${active?.title || 'BuckUp'}</h3>
        <p class="muted">РџРѕРєР° Р·РґРµСЃСЊ РЅРµС‚ СѓРґР°Р»РµРЅРЅС‹С… РґР°РЅРЅС‹С…. РџРѕСЃР»Рµ СѓРґР°Р»РµРЅРёСЏ СЌР»РµРјРµРЅС‚С‹ Р±СѓРґСѓС‚ СЃРѕС…СЂР°РЅСЏС‚СЊСЃСЏ РІ СЌС‚РѕРј СЂР°Р·РґРµР»Рµ.</p>
      </div>
    </div>
  `;
}

async function renderBackup() {
  backupData = await api('/api/backup');
  const items = backupItemsForSection();
  const counts = {
    products: backupData.products?.length || 0,
    files: backupData.files?.length || 0,
    blogs: backupData.blogs?.length || 0,
    free: backupData.free?.length || 0
  };

  layout(`
    <section class="backup-page">
      <div class="section-head">
        <div>
          <p class="eyebrow">${escapeHtml(appBrand()).toUpperCase()} BACKUP</p>
          <h1>BuckUp</h1>
          <p class="muted">Р’СЃРµ СѓРґР°Р»РµРЅРЅС‹Рµ РґР°РЅРЅС‹Рµ СЃРѕС…СЂР°РЅСЏСЋС‚СЃСЏ Р·РґРµСЃСЊ, С‡С‚РѕР±С‹ РёС… РјРѕР¶РЅРѕ Р±С‹Р»Рѕ РІС‹Р±СЂР°С‚СЊ Рё РІРµСЂРЅСѓС‚СЊ РѕР±СЂР°С‚РЅРѕ.</p>
        </div>
      </div>
      <div class="backup-tabs">
        ${backupSections.map(section => `
          <button type="button" data-backup-section="${section.id}" class="${selectedBackupSection === section.id ? 'active' : ''}">
            <strong>${section.title}</strong>
            <span>${section.subtitle}</span>
            <b>${counts[section.id] || 0}</b>
          </button>
        `).join('')}
      </div>
      <section class="panel backup-panel">
        <div class="backup-toolbar">
          <label class="product-list-search">
            <img src="/assets/icon-search.svg" alt="">
            <input id="backupSearchInput" placeholder="РџРѕРёСЃРє РїРѕ РЅР°Р·РІР°РЅРёСЋ, Р°СЂС‚РёРєСѓР»Сѓ РёР»Рё РґР°С‚Рµ СѓРґР°Р»РµРЅРёСЏ">
          </label>
          <button class="btn soft" id="selectAllBackup" type="button">Р’С‹Р±СЂР°С‚СЊ РІСЃРµ</button>
          <button class="btn primary" id="restoreBackupButton" type="button">Р’РѕСЃСЃС‚Р°РЅРѕРІРёС‚СЊ РІС‹Р±СЂР°РЅРЅРѕРµ</button>
        </div>
        <p class="result hidden" id="backupResult"></p>
        <div class="backup-list">
          ${backupPlaceholderRows(items)}
        </div>
      </section>
    </section>
  `);

  bindBackupPage();
}

function bindBackupPage() {
  document.querySelectorAll('[data-backup-section]').forEach(button => {
    button.addEventListener('click', () => {
      selectedBackupSection = button.dataset.backupSection;
      saveNavigationState();
      renderBackup();
    });
  });

  document.querySelector('#backupSearchInput')?.addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase();
    document.querySelectorAll('[data-backup-search]').forEach(row => {
      row.classList.toggle('hidden', query && !row.dataset.backupSearch.includes(query));
    });
  });

  document.querySelector('#selectAllBackup')?.addEventListener('click', () => {
    document.querySelectorAll('[data-backup-select]').forEach(input => {
      const row = input.closest('.backup-row');
      if (!row.classList.contains('hidden')) input.checked = true;
    });
  });

  document.querySelector('#restoreBackupButton')?.addEventListener('click', async () => {
    const selected = Array.from(document.querySelectorAll('[data-backup-select]:checked'));
    const result = document.querySelector('#backupResult');
    if (!selected.length) {
      result.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ СЌР»РµРјРµРЅС‚С‹ РґР»СЏ РІРѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёСЏ.';
      result.classList.remove('hidden');
      return;
    }
    const productIds = selected
      .filter(input => input.dataset.backupType === 'product' || selectedBackupSection === 'products' || selectedBackupSection === 'free')
      .map(input => input.dataset.backupSelect);
    if (!productIds.length) {
      result.textContent = 'Р”Р»СЏ СЌС‚РѕРіРѕ СЂР°Р·РґРµР»Р° РІРѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёРµ Р±СѓРґРµС‚ РїРѕРґРєР»СЋС‡РµРЅРѕ РїРѕСЃР»Рµ РїРѕСЏРІР»РµРЅРёСЏ СѓРґР°Р»РµРЅРЅС‹С… С„Р°Р№Р»РѕРІ РёР»Рё Р±Р»РѕРєРѕРІ.';
      result.classList.remove('hidden');
      return;
    }
    const response = await api('/api/backup/products/restore', {
      method: 'POST',
      body: JSON.stringify({ ids: productIds })
    });
    catalogProducts = response.products;
    backupData = null;
    selectedBackupSection = 'products';
    saveNavigationState();
    await renderBackup();
  });
}

function productCategorySuggestions() {
  const categories = savedCategories && savedCategories.length ? savedCategories : [
    { name: 'РўРѕРїС‹', parent: 'РћРґРµР¶РґР°' },
    { name: 'Р¤СѓС‚Р±РѕР»РєРё', parent: 'РћРґРµР¶РґР°' },
    { name: 'РџР»Р°С‚СЊСЏ', parent: 'РћРґРµР¶РґР°' },
    { name: 'Р‘СЋСЃС‚РіР°Р»СЊС‚РµСЂС‹', parent: 'Р‘РµР»СЊРµ' },
    { name: 'Р—Р°РєСЂРµРїРёС‚РµР»Рё РґР»СЏ РіРµР»СЊ-Р»Р°РєР°', parent: 'РљСЂР°СЃРѕС‚Р°' }
  ];
  return categories.map(category => ({
    id: String(category.id || category.name || ''),
    name: String(category.name || ''),
    parent: String(category.parent || 'Р‘РµР· РєР°С‚РµРіРѕСЂРёРё'),
    parentId: String(category.parentId || ''),
    path: String(category.path || `${category.parent || 'Р‘РµР· РєР°С‚РµРіРѕСЂРёРё'} / ${category.name || ''}`),
    sortOrder: Number(category.sortOrder || 0),
    depth: Number(category.depth || String(category.path || '').split('/').filter(Boolean).length || 1)
  })).filter(category => category.name);
}

function scoreCategorySuggestion(category, query) {
  const name = category.name.toLowerCase();
  const parent = category.parent.toLowerCase();
  if (!query) return 10;
  if (name === query) return 1000;
  if (name.startsWith(query)) return 900 - name.length;
  if (name.split(/\s+/).some(part => part === query)) return 820 - name.length;
  if (name.includes(query)) return 700 - name.length;
  if (parent.includes(query)) return 250 - parent.length;
  return -1;
}

function manualCategoryMatches() {
  const query = productManualCategoryQuery.trim().toLowerCase();
  const seen = new Set();
  return productCategorySuggestions()
    .map(category => ({
      ...category,
      score: query ? scoreCategorySuggestion(category, query) : 10
    }))
    .filter(category => category.score >= 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return compareCategories(a, b);
    })
    .filter(category => {
      const key = `${category.name}|${category.parent}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 90);
}

function sortCategoryAlpha(items) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' }));
}

function modalCategoryRows() {
  const categories = productCategorySuggestions();
  const query = productManualCategoryQuery.trim().toLowerCase();
  if (query) return sortCategoryAlpha(manualCategoryMatches());

  const byParent = new Map();
  categories.forEach(category => {
    const parentKey = category.parentId || '';
    if (!byParent.has(parentKey)) byParent.set(parentKey, []);
    byParent.get(parentKey).push(category);
  });

  const rows = [];
  const walk = (parentId, depth) => {
    sortCategoryAlpha(byParent.get(parentId) || []).forEach(category => {
      const hasChildren = Boolean((byParent.get(category.id) || []).length);
      rows.push({ ...category, depth, hasChildren, expanded: productCategoryExpanded.has(category.id) });
      if (hasChildren && productCategoryExpanded.has(category.id)) walk(category.id, depth + 1);
    });
  };

  walk('', 0);
  return rows;
}

function modalCategoryRowsHtml() {
  return modalCategoryRows().map(category => `
    <button class="manual-category-item ${productCategoryModalSelectionId === category.id ? 'active' : ''}" style="--depth:${Math.max(0, Number(category.depth || 0))}" type="button" data-manual-category="${escapeHtml(category.name)}" data-manual-id="${escapeHtml(category.id)}" data-manual-parent="${escapeHtml(category.parent)}" data-has-children="${category.hasChildren ? 'true' : 'false'}">
      <span class="category-arrow ${category.hasChildren ? '' : 'empty'} ${category.expanded ? 'open' : ''}" data-category-toggle="${escapeHtml(category.id)}">вЂє</span>
      <span class="category-row-name">${escapeHtml(category.name)}</span>
    </button>
  `).join('');
}

function productCategoryModal() {
  if (!productManualCategoryOpen) return '';
  return `
    <div class="modal-backdrop product-category-backdrop" id="productCategoryModal">
      <section class="modal product-category-modal">
        <button class="modal-close" id="closeManualCategory" type="button">Г—</button>
        <h2>Р’С‹Р±РµСЂРёС‚Рµ РєР°С‚РµРіРѕСЂРёСЋ Рё С‚РёРї С‚РѕРІР°СЂР°</h2>
        <div class="category-modal-tools">
          <div class="modal-search">
            <img src="/assets/icon-search.svg" alt="">
            <input id="manualCategorySearch" value="${escapeHtml(productManualCategoryQuery)}" placeholder="РќР°Р·РІР°РЅРёРµ РєР°С‚РµРіРѕСЂРёРё, С‚РѕРІР°СЂР° РёР»Рё С‚РёРїР°">
          </div>
          <select>
            <option>РСЃРєР°С‚СЊ РІРµР·РґРµ</option>
            <option>Р“Р»Р°РІРЅС‹Рµ РєР°С‚РµРіРѕСЂРёРё</option>
            <option>РџРѕРґРєР°С‚РµРіРѕСЂРёРё</option>
          </select>
        </div>
        <div class="manual-category-list modal-category-list" id="manualCategoryList">
          ${modalCategoryRowsHtml()}
        </div>
        <div class="category-modal-footer">
          <button class="btn primary" id="confirmProductCategory" type="button" ${productCategoryModalSelection ? '' : 'disabled'}>РџРѕРґС‚РІРµСЂРґРёС‚СЊ</button>
          <span>${productCategoryModalSelection ? escapeHtml(productCategoryModalSelection) : 'РљР°С‚РµРіРѕСЂРёСЏ РЅРµ РІС‹Р±СЂР°РЅР°'}</span>
        </div>
      </section>
    </div>
  `;
}

function selectedCategoryPropertiesPanel() {
  if (!productDraftCategory) return '';
  const colors = catalogColors || [];
  return `
    <section class="category-live-properties">
      <div class="section-head">
        <div>
          <p class="eyebrow">РљР°С‚РµРіРѕСЂРёСЏ РїСЂРѕРґР°РІС†Р°</p>
          <h2>${escapeHtml(productDraftCategory)}</h2>
        </div>
        <span class="status draft">РљР°С‡РµСЃС‚РІРѕ РєР°СЂС‚РѕС‡РєРё: 2</span>
      </div>
      <div class="selected-category-line">
        <strong>${escapeHtml(productDraftCategory)}</strong>
        <button class="btn" id="changeProductCategory" type="button">РР·РјРµРЅРёС‚СЊ</button>
        <label class="switch-row compact"><input type="checkbox"><span class="switch"></span>18+</label>
      </div>
      <label class="field compact magic-field"><span>РђСЂС‚РёРєСѓР» РїСЂРѕРґР°РІС†Р°</span><input><button type="button">AI</button></label>
      <div class="category-property-card">
        <label class="field compact">
          <span>Р‘СЂРµРЅРґ</span>
          <input placeholder="Р’С‹Р±СЂР°С‚СЊ Р±СЂРµРЅРґ">
        </label>
        <label class="field compact">
          <span>Р¦РІРµС‚</span>
          <select>
            <option>Р’С‹Р±СЂР°С‚СЊ С†РІРµС‚</option>
            ${colors.map(color => `<option>${escapeHtml(color.name)}</option>`).join('')}
          </select>
        </label>
        <label class="field compact">
          <span>РњР°С‚РµСЂРёР°Р»</span>
          <select>
            <option>Р’С‹Р±СЂР°С‚СЊ РјР°С‚РµСЂРёР°Р»</option>
            ${(catalogMaterials || []).map(material => `<option>${escapeHtml(material)}</option>`).join('')}
          </select>
        </label>
        <label class="field compact">
          <span>Р Р°Р·РјРµСЂ</span>
          <input placeholder="РќР°РїСЂРёРјРµСЂ: 75-B, M, 42">
        </label>
      </div>
      <div class="marking-box">
        <h3>РўРќР’Р­Р”</h3>
        <button class="btn" type="button">Р’С‹Р±СЂР°С‚СЊ</button>
        <label class="switch-row"><input type="checkbox" checked><span class="switch"></span>РќСѓР¶РЅР° РјР°СЂРєРёСЂРѕРІРєР° РљРР—</label>
        <label class="switch-row"><input type="checkbox"><span class="switch"></span>РџРѕРґС‚РІРµСЂР¶РґР°СЋ, С‡С‚Рѕ РЅР° С‚РѕРІР°СЂ РЅР°РЅРµСЃРµРЅР° РЅРµРѕР±С…РѕРґРёРјР°СЏ РјР°СЂРєРёСЂРѕРІРєР°</label>
      </div>
    </section>
  `;
}

function productMediaGalleryHtml() {
  const images = productDraftMedia.filter(file => file.kind === 'image');
  const videos = productDraftMedia.filter(file => file.kind === 'video');
  const main = productDraftMedia[0];
  const thumbnails = productDraftMedia;

  return `
    <div class="product-media-gallery">
      <label class="media-main-card ${main ? 'has-media' : 'is-empty'}">
        <input id="productMediaInput" type="file" accept="image/*,video/*" multiple>
        ${main ? `
          ${main.kind === 'video'
            ? `<video src="${main.preview}" muted playsinline></video>`
            : `<img src="${main.preview}" alt="">`
          }
          <span class="main-badge">Р“Р»Р°РІРЅР°СЏ</span>
        ` : `
          <span class="upload-ghost">+</span>
          <strong>Р¤РѕС‚Рѕ Рё РІРёРґРµРѕ</strong>
          <small>РџРµСЂРµС‚Р°С‰РёС‚Рµ СЃСЋРґР° РёР»Рё РІС‹Р±РµСЂРёС‚Рµ С„Р°Р№Р»</small>
        `}
      </label>
      <div class="media-thumb-grid">
        ${thumbnails.map((file, index) => `
          <div class="media-thumb ${index === 0 ? 'active' : ''}" role="button" tabindex="0" draggable="true" data-media-index="${index}" title="РџРµСЂРµС‚Р°С‰РёС‚Рµ РЅР° РґСЂСѓРіРѕРµ С„РѕС‚Рѕ, С‡С‚РѕР±С‹ РїРѕРјРµРЅСЏС‚СЊ РјРµСЃС‚Р°РјРё.">
            ${file.kind === 'video'
              ? `<video src="${file.preview}" muted playsinline></video><span class="play-dot">в–¶</span>`
              : `<img src="${file.preview}" alt="">`
            }
            <span class="thumb-order">${index + 1}</span>
            ${index === 0 ? '<span class="thumb-main-dot">Р“Р»Р°РІРЅР°СЏ</span>' : `<button class="thumb-main-action" type="button" data-set-main-media="${index}">Р“Р»Р°РІРЅР°СЏ</button>`}
            <span class="thumb-drag-dot">в‡„</span>
          </div>
        `).join('')}
        <label class="media-add-tile">
          <input id="productMediaAddInput" type="file" accept="image/*,video/*" multiple>
          <span>+</span>
          <strong>Р”РѕР±Р°РІРёС‚СЊ</strong>
        </label>
      </div>
      <div class="media-upload-status" id="productMediaStatus">
        ${productDraftMedia.length ? `Р¤РѕС‚Рѕ: ${images.length}, РІРёРґРµРѕ: ${videos.length}` : 'Р¤РѕС‚Рѕ Рё РІРёРґРµРѕ РїРѕРєР° РЅРµ РІС‹Р±СЂР°РЅС‹'}
      </div>
    </div>
  `;
}

function productEditorPanel() {
  const editorContent = `
      <section class="product-builder">
        <aside class="variant-sidebar">
          <div class="section-head">
            <h2>Р’Р°СЂРёР°РЅС‚С‹ С‚РѕРІР°СЂР°</h2>
            <span class="status draft">1 / 30</span>
          </div>
          <div class="variant-card">
            <div class="variant-image"><span>в–Ў</span></div>
            <div>
              <strong>РќРѕРІР°СЏ РєР°СЂС‚РѕС‡РєР°</strong>
              <span class="muted">Р¤РѕС‚Рѕ Рё РЅР°Р·РІР°РЅРёРµ РїРѕСЏРІСЏС‚СЃСЏ РїРѕСЃР»Рµ Р·Р°РїРѕР»РЅРµРЅРёСЏ</span>
            </div>
          </div>
        </aside>
        <div class="builder-main">
          <div class="builder-notice">
            <span class="info-dot">i</span>
            РЎРѕР·РґР°Р№С‚Рµ РєР°СЂС‚РѕС‡РєСѓ С‚РѕРІР°СЂР°: РјРµРґРёР°, РєР°С‚РµРіРѕСЂРёСЏ, РѕРїРёСЃР°РЅРёРµ Рё С‚РѕСЂРіРѕРІС‹Рµ РїР°СЂР°РјРµС‚СЂС‹
          </div>
          <div class="builder-card">
            <div class="media-column">
              ${productMediaGalleryHtml()}
              <div class="media-tools">
                <button class="builder-soft" type="button">Р РµРґР°РєС‚РѕСЂ С„РѕС‚Рѕ</button>
                <button class="builder-soft" type="button">Р¤РѕС‚РѕСЃС‚СѓРґРёСЏ</button>
                <button class="builder-muted" type="button">Р’РёРґРµРѕРѕР±Р»РѕР¶РєР°</button>
              </div>
              <div class="link-loader">
                <span class="muted">Р”РѕР±Р°РІРёС‚СЊ РјРµРґРёР° РїРѕ СЃСЃС‹Р»РєРµ</span>
                <div>
                  <input placeholder="https://">
                  <button type="button">в†’</button>
                </div>
              </div>
            </div>
            <div class="main-info-column">
              <div class="creation-steps">
                <span class="active"><b>1</b>РРЅС„РѕСЂРјР°С†РёСЏ Рѕ С‚РѕРІР°СЂРµ</span>
                <span><b>2</b>РџСЂРµРґРІР°СЂРёС‚РµР»СЊРЅС‹Р№ РїСЂРѕСЃРјРѕС‚СЂ</span>
              </div>
              <div class="section-head product-simple-head">
                <h2>РћСЃРЅРѕРІРЅР°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ</h2>
                <span class="status draft">Р“РѕС‚РѕРІРЅРѕСЃС‚СЊ: 0%</span>
              </div>
              <div class="product-simple-form">
                <label class="simple-field product-name-field">
                  <input id="newProductName" value="${escapeHtml(productDraftName)}" autocomplete="off" placeholder="РќР°Р·РІР°РЅРёРµ">
                </label>
                <div class="simple-field product-category-field">
                  <button class="simple-select" type="button" id="openProductCategory">
                    <span>${productDraftCategory ? escapeHtml(productDraftCategory) : 'РљР°С‚РµРіРѕСЂРёСЏ Рё С‚РёРї *'}</span>
                    <b>вЂє</b>
                  </button>
                </div>
                <label class="simple-field with-note">
                  <input id="newProductBarcode" placeholder="РЁС‚СЂРёС…РєРѕРґ">
                  <small>РЁС‚СЂРёС…РєРѕРґ РЅСѓР¶РµРЅ РґР»СЏ РєРѕРјРїРµРЅСЃР°С†РёРё РїСЂРё СѓС‚РµСЂРµ</small>
                </label>
                <label class="simple-field">
                  <input id="newProductArticle" value="${escapeHtml(productGeneratedArticle || generateMarketplaceArticle())}" placeholder="РђСЂС‚РёРєСѓР» *">
                </label>
                <div class="simple-grid two">
                  <label class="simple-field">
                    <input id="newProductSalePrice" type="number" min="0" value="0" placeholder="Р’Р°С€Р° С†РµРЅР°, в‚Ѕ *">
                  </label>
                  <label class="simple-field">
                    <input id="newProductPurchasePrice" type="number" min="0" value="0" placeholder="Р¦РµРЅР° РґРѕ СЃРєРёРґРєРё, в‚Ѕ">
                  </label>
                </div>
                <label class="simple-field">
                  <select id="newProductVat">
                    <option>РќР”РЎ *</option>
                    <option>Р‘РµР· РќР”РЎ</option>
                    <option>0%</option>
                    <option>10%</option>
                    <option>20%</option>
                  </select>
                </label>
                <div class="simple-section-title">Р“Р°Р±Р°СЂРёС‚С‹ Рё РІРµСЃ</div>
                <label class="simple-field">
                  <input id="newProductLength" type="number" min="0" placeholder="Р”Р»РёРЅР° СѓРїР°РєРѕРІРєРё, РјРј *">
                </label>
                <label class="simple-field">
                  <input id="newProductWidth" type="number" min="0" placeholder="РЁРёСЂРёРЅР° СѓРїР°РєРѕРІРєРё, РјРј *">
                </label>
                <label class="simple-field">
                  <input id="newProductHeight" type="number" min="0" placeholder="Р’С‹СЃРѕС‚Р° СѓРїР°РєРѕРІРєРё, РјРј *">
                </label>
                <label class="simple-field">
                  <input id="newProductWeight" type="number" min="0" placeholder="Р’РµСЃ СЃ СѓРїР°РєРѕРІРєРѕР№, Рі *">
                </label>
                <div class="simple-grid three">
                  <label class="simple-field">
                    <input id="newProductStock" type="number" min="0" value="0" placeholder="РћСЃС‚Р°С‚РѕРє">
                  </label>
                  <label class="simple-field">
                    <input id="newProductBrand" list="brandOptions" placeholder="Р‘СЂРµРЅРґ">
                  </label>
                  <label class="simple-field">
                    <input id="newProductManufacturer" placeholder="РџСЂРѕРёР·РІРѕРґРёС‚РµР»СЊ">
                  </label>
                </div>
                <datalist id="brandOptions">
                  ${(catalogBrands || []).map(brand => `<option value="${escapeHtml(brand.name || brand)}"></option>`).join('')}
                </datalist>
                <input id="newProductAssortment" type="hidden" value="">
                <input id="newProductSellerArticle" type="hidden" value="">
                <input id="newProductSeason" type="hidden" value="Р’СЃРµСЃРµР·РѕРЅРЅС‹Р№">
                <select id="newProductAvailability" class="hidden">
                  <option>Р”РѕСЃС‚СѓРїРЅС‹ Рє РїСЂРѕРґР°Р¶Рµ</option>
                  <option>Р’ РїСЂРѕРґР°Р¶Рµ</option>
                  <option>РќРµС‚ РІ РЅР°Р»РёС‡РёРё</option>
                  <option>Р’ РѕС€РёР±РєРµ</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

  return `
    <section class="product-editor">
      <div class="section-head">
        <div>
          <p class="muted">РџР°РЅРµР»СЊ СѓРїСЂР°РІР»РµРЅРёСЏ / РўРѕРІР°СЂС‹ / Р”РѕР±Р°РІР»РµРЅРёРµ С‚РѕРІР°СЂР°</p>
          <h1>Р”РѕР±Р°РІР»РµРЅРёРµ С‚РѕРІР°СЂР°</h1>
        </div>
        <div class="row">
          <button class="btn danger-outline" id="cancelProductEditor" type="button">РћС‚РјРµРЅРёС‚СЊ</button>
          <button class="btn primary" id="saveProductEditor" type="button">Р”РѕР±Р°РІРёС‚СЊ С‚РѕРІР°СЂ</button>
        </div>
      </div>
      <div class="editor-content">${editorContent}</div>
      ${productCategoryModal()}
      <p class="result hidden" id="productEditorResult"></p>
    </section>
  `;
}

function bindProductEditor() {
  document.querySelector('#cancelProductEditor').addEventListener('click', () => {
    productEditorOpen = false;
    renderCatalog();
  });

  document.querySelector('#saveProductEditor').addEventListener('click', async () => {
    const nextProduct = createProductFromDraft();
    const response = await api('/api/catalog/products', {
      method: 'POST',
      body: JSON.stringify(nextProduct)
    });
    catalogProducts = response.products;
    catalogBrands = (await api('/api/catalog/brands')).brands;
    productEditorOpen = false;
    productDraftName = '';
    productDraftCategory = '';
    productManualCategoryOpen = false;
    productManualCategoryQuery = '';
    productDraftMedia = [];
    productGeneratedArticle = '';
    renderCatalog();
  });

  const nameInput = document.querySelector('#newProductName');
    const openCategoryButton = document.querySelector('#openProductCategory');
    const changeButton = document.querySelector('#changeProductCategory');
    const manualSearch = document.querySelector('#manualCategorySearch');
    const manualList = document.querySelector('#manualCategoryList');
    const confirmCategoryButton = document.querySelector('#confirmProductCategory');
    const mediaInput = document.querySelector('#productMediaInput');
    const mediaAddInput = document.querySelector('#productMediaAddInput');
    const mediaDropTarget = document.querySelector('.media-main-card');
    const mediaStatus = document.querySelector('#productMediaStatus');

    const selectProductCategory = button => {
      productDraftCategory = button.dataset.productCategory || button.dataset.manualCategory;
      productManualCategoryOpen = false;
      productManualCategoryQuery = '';
      productCategoryModalSelection = '';
      productCategoryModalSelectionId = '';
      renderCatalog();
    };

    const bindManualItems = () => {
      document.querySelectorAll('[data-manual-category]').forEach(button => {
        button.addEventListener('click', event => {
          const toggle = event.target.closest('[data-category-toggle]');
          if (toggle && button.dataset.hasChildren === 'true') {
            const id = toggle.dataset.categoryToggle;
            if (productCategoryExpanded.has(id)) {
              productCategoryExpanded.delete(id);
            } else {
              productCategoryExpanded.add(id);
            }
            if (manualList) {
              manualList.innerHTML = modalCategoryRowsHtml();
              bindManualItems();
            }
            return;
          }
          productCategoryModalSelection = button.dataset.manualCategory;
          productCategoryModalSelectionId = button.dataset.manualId;
          manualList?.querySelectorAll('.manual-category-item').forEach(item => item.classList.remove('active'));
          button.classList.add('active');
          if (confirmCategoryButton) confirmCategoryButton.disabled = false;
          document.querySelector('.category-modal-footer span').textContent = productCategoryModalSelection;
        });
      });
    };

    nameInput?.addEventListener('input', () => {
      productDraftName = nameInput.value;
    });

    openCategoryButton?.addEventListener('click', () => {
      productManualCategoryOpen = true;
      productManualCategoryQuery = productDraftName;
      productCategoryModalSelection = productDraftCategory;
      productCategoryModalSelectionId = '';
      renderCatalog();
    });

    manualSearch?.addEventListener('input', () => {
      productManualCategoryQuery = manualSearch.value;
      if (manualList) {
        manualList.innerHTML = modalCategoryRowsHtml();
        bindManualItems();
      }
    });

    document.querySelector('#closeManualCategory')?.addEventListener('click', () => {
      productManualCategoryOpen = false;
      productCategoryModalSelection = '';
      productCategoryModalSelectionId = '';
      renderCatalog();
    });

    confirmCategoryButton?.addEventListener('click', () => {
      if (!productCategoryModalSelection) return;
      selectProductCategory({
        dataset: {
          productCategory: productCategoryModalSelection
        }
      });
    });

    changeButton?.addEventListener('click', () => {
      productDraftCategory = '';
      productManualCategoryOpen = true;
      productCategoryModalSelection = '';
      productCategoryModalSelectionId = '';
      renderCatalog();
    });

    bindManualItems();

    const bindMediaInput = (input, append = false) => {
      input?.addEventListener('change', async () => {
        const files = Array.from(input.files || []);
        const payload = await Promise.all(files.map(fileToMediaPayload));
        productDraftMedia = append ? [...productDraftMedia, ...payload] : payload;
        if (mediaStatus) {
          const images = productDraftMedia.filter(file => file.kind === 'image').length;
          const videos = productDraftMedia.filter(file => file.kind === 'video').length;
          mediaStatus.textContent = `Р’С‹Р±СЂР°РЅРѕ: С„РѕС‚Рѕ ${images}, РІРёРґРµРѕ ${videos}`;
        }
        renderCatalog();
      });
    };

    bindMediaInput(mediaInput, false);
    bindMediaInput(mediaAddInput, true);

    document.querySelectorAll('[data-media-index]').forEach(button => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.mediaIndex);
        if (!Number.isFinite(index) || index <= 0) return;
        const next = [...productDraftMedia];
        const [item] = next.splice(index, 1);
        next.unshift(item);
        productDraftMedia = next;
        renderCatalog();
      });

      button.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        button.click();
      });

      button.addEventListener('dragstart', event => {
        event.dataTransfer.setData('text/plain', button.dataset.mediaIndex);
        event.dataTransfer.effectAllowed = 'move';
      });

      button.addEventListener('dragover', event => {
        event.preventDefault();
        button.classList.add('drag-over');
      });

      button.addEventListener('dragleave', () => button.classList.remove('drag-over'));

      button.addEventListener('drop', event => {
        event.preventDefault();
        button.classList.remove('drag-over');
        const from = Number(event.dataTransfer.getData('text/plain'));
        const to = Number(button.dataset.mediaIndex);
        if (!Number.isFinite(from) || !Number.isFinite(to) || from === to) return;
        const next = [...productDraftMedia];
        [next[from], next[to]] = [next[to], next[from]];
        productDraftMedia = next;
        renderCatalog();
      });
    });

    document.querySelectorAll('[data-set-main-media]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        const index = Number(button.dataset.setMainMedia);
        if (!Number.isFinite(index) || index <= 0) return;
        const next = [...productDraftMedia];
        const [item] = next.splice(index, 1);
        next.unshift(item);
        productDraftMedia = next;
        renderCatalog();
      });
    });

    mediaDropTarget?.addEventListener('dragover', event => {
      event.preventDefault();
      mediaDropTarget.classList.add('drag-over');
    });
    mediaDropTarget?.addEventListener('dragleave', () => mediaDropTarget.classList.remove('drag-over'));
    mediaDropTarget?.addEventListener('drop', async event => {
      event.preventDefault();
      mediaDropTarget.classList.remove('drag-over');
      const files = Array.from(event.dataTransfer?.files || []).filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
      productDraftMedia = await Promise.all(files.map(fileToMediaPayload));
      if (mediaStatus) {
        const images = productDraftMedia.filter(file => file.kind === 'image').length;
        const videos = productDraftMedia.filter(file => file.kind === 'video').length;
        mediaStatus.textContent = `Р’С‹Р±СЂР°РЅРѕ: С„РѕС‚Рѕ ${images}, РІРёРґРµРѕ ${videos}`;
      }
      renderCatalog();
    });
}

function buildCategoryParentOptions(categories) {
  const sorted = [...categories].sort(compareCategories);
  const childrenByParent = new Map();

  sorted.forEach(category => {
    const parent = category.parent || 'Р‘РµР· РєР°С‚РµРіРѕСЂРёРё';
    if (!childrenByParent.has(parent)) childrenByParent.set(parent, []);
    childrenByParent.get(parent).push(category);
  });

  const renderBranch = (parentName, depth, visited = new Set()) => {
    return (childrenByParent.get(parentName) || []).map(category => {
      if (visited.has(category.name)) return '';
      const nextVisited = new Set(visited);
      nextVisited.add(category.name);
      const prefix = depth === 0 ? '' : `${'-- '.repeat(depth)}`;
      return `
        <option value="${category.name}">${prefix}${category.name}</option>
        ${renderBranch(category.name, depth + 1, nextVisited)}
      `;
    }).join('');
  };

  return renderBranch('Р‘РµР· РєР°С‚РµРіРѕСЂРёРё', 0);
}

function buildCategoryPathRows(categories) {
  const sorted = [...categories].sort(compareCategories);
  const byParent = new Map();
  const knownIds = new Set(sorted.map(category => category.id).filter(Boolean));

  sorted.forEach(category => {
    const parent = category.parentId || category.parent || 'Р‘РµР· РєР°С‚РµРіРѕСЂРёРё';
    if (!byParent.has(parent)) byParent.set(parent, []);
    byParent.get(parent).push(category);
  });

  const roots = sorted.filter(category => {
    const parent = category.parentId || category.parent || 'Р‘РµР· РєР°С‚РµРіРѕСЂРёРё';
    return parent === 'Р‘РµР· РєР°С‚РµРіРѕСЂРёРё' || !knownIds.has(parent);
  });

  const byId = new Map(sorted.map(category => [String(category.id || category.name), category]));
  categoryDrillPath = categoryDrillPath.filter(id => byId.has(String(id)));
  localStorage.setItem('thechamp_category_drill_path', JSON.stringify(categoryDrillPath));

  const levels = [{ title: 'РЈСЂРѕРІРµРЅСЊ 1', parent: 'Р“Р»Р°РІРЅС‹Рµ РєР°С‚РµРіРѕСЂРёРё', items: roots, selectedId: categoryDrillPath[0] }];
  categoryDrillPath.forEach((id, index) => {
    const category = byId.get(String(id));
    const children = byParent.get(category?.id || category?.name) || [];
    if (category && children.length) {
      levels.push({
        title: `РЈСЂРѕРІРµРЅСЊ ${index + 2}`,
        parent: category.name,
        items: children,
        selectedId: categoryDrillPath[index + 1]
      });
    }
  });

  const selectedNames = categoryDrillPath.map(id => byId.get(String(id))?.name).filter(Boolean);

  return `
    <div class="category-drill-summary">
      <div>
        <strong>РљР°С‚РµРіРѕСЂРёР№: ${sorted.length}</strong>
        <span>${selectedNames.length ? selectedNames.join(' / ') : 'Р’С‹Р±РµСЂРёС‚Рµ РіР»Р°РІРЅСѓСЋ РєР°С‚РµРіРѕСЂРёСЋ'}</span>
      </div>
      <button class="btn" type="button" id="resetCategoryDrill">РЎР±СЂРѕСЃРёС‚СЊ</button>
    </div>
    <div class="category-drill">
      ${levels.map((level, levelIndex) => `
        <section class="category-level">
          <header>
            <span>${level.title}</span>
            <strong>${escapeHtml(level.parent)}</strong>
          </header>
          <div class="category-level-list">
            ${level.items.map(category => {
              const id = String(category.id || category.name);
              const childCount = (byParent.get(category.id || category.name) || []).length;
              const active = String(level.selectedId || '') === id;
              return `
                <button class="category-level-button ${active ? 'active' : ''}" type="button" data-drill-level="${levelIndex}" data-drill-category="${escapeHtml(id)}">
                  <span>${escapeHtml(category.name)}</span>
                  <small>${childCount ? `${childCount} РїРѕРґРєР°С‚РµРіРѕСЂРёР№` : 'РєРѕРЅРµС‡РЅР°СЏ РєР°С‚РµРіРѕСЂРёСЏ'}</small>
                </button>
              `;
            }).join('')}
          </div>
        </section>
      `).join('')}
    </div>
  `;
}

function bindCategoryForm() {
  const modal = document.querySelector('#categoryModal');
  const openButton = document.querySelector('#addCategoryButton');
  const closeButton = document.querySelector('#closeCategoryModal');
  const cancelButton = document.querySelector('#cancelCategoryButton');
  const form = document.querySelector('#categoryForm');

  document.querySelectorAll('[data-drill-category]').forEach(button => {
    button.addEventListener('click', () => {
      const level = Number(button.dataset.drillLevel || 0);
      categoryDrillPath = categoryDrillPath.slice(0, level);
      categoryDrillPath[level] = button.dataset.drillCategory;
      localStorage.setItem('thechamp_category_drill_path', JSON.stringify(categoryDrillPath));
      renderCatalog();
    });
  });

  document.querySelector('#resetCategoryDrill')?.addEventListener('click', () => {
    categoryDrillPath = [];
    localStorage.setItem('thechamp_category_drill_path', JSON.stringify(categoryDrillPath));
    renderCatalog();
  });

  const closeModal = () => modal.classList.add('hidden');
  const openModal = parent => {
    pendingCategoryParent = parent || 'Р‘РµР· РєР°С‚РµРіРѕСЂРёРё';
    form.reset();
    document.querySelector('#categoryOneCId').value = '0';
    document.querySelector('#categorySortOrder').value = '1';
    document.querySelector('#categoryParent').value = pendingCategoryParent;
    modal.classList.remove('hidden');
  };

  openButton.addEventListener('click', () => openModal(openButton.dataset.parent));
  document.querySelectorAll('[data-add-child]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      openModal(button.dataset.addChild);
    });
  });
  closeButton.addEventListener('click', closeModal);
  cancelButton.addEventListener('click', closeModal);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const error = document.querySelector('#categoryFormError');
    error.textContent = '';

    try {
      await api('/api/catalog/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: document.querySelector('#categoryName').value.trim(),
          url: document.querySelector('#categoryUrl').value.trim(),
          parent: document.querySelector('#categoryParent').value,
          oneCId: document.querySelector('#categoryOneCId').value.trim(),
          sortOrder: Number(document.querySelector('#categorySortOrder').value || 1),
          active: document.querySelector('#categoryActive').checked,
          showHome: document.querySelector('#categoryShowHome').checked,
          mainImageName: document.querySelector('#categoryMainImage').files[0]?.name || '',
          iconName: document.querySelector('#categoryIcon').files[0]?.name || ''
        })
      });
      savedCategories = (await api('/api/catalog/categories')).categories;
      renderCatalog();
    } catch (err) {
      error.textContent = err.message;
    }
  });
}

function renderApiLogs() {
  layout(`
    <p class="eyebrow">РўРµС…РЅРёС‡РµСЃРєРёР№ РјРѕРЅРёС‚РѕСЂРёРЅРі</p>
    <h1>Р›РѕРіРё API</h1>
    <section class="panel">
      <div class="event-list">${dashboardData.apiEvents.map(eventCard).join('')}</div>
    </section>
  `);
}

function renderUsers() {
  layout(`
    <p class="eyebrow">Р‘РµР·РѕРїР°СЃРЅРѕСЃС‚СЊ</p>
    <h1>Р¦РµРЅС‚СЂ СЂРѕР»РµР№ Рё РїСЂР°РІ РґРѕСЃС‚СѓРїР°</h1>
    <section class="grid modules">
      <div class="card"><h3>Р’Р»Р°РґРµР»РµС†</h3><p class="muted">Р’СЃРµ РјР°РіР°Р·РёРЅС‹, API-РєР»СЋС‡Рё, С„РёРЅР°РЅСЃС‹ Рё СѓРїСЂР°РІР»РµРЅРёРµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏРјРё.</p><span class="chip">1 РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ</span></div>
      <div class="card"><h3>РћРїРµСЂР°С†РёРё</h3><p class="muted">Р—Р°РєР°Р·С‹, СЃРєР»Р°Рґ, РјР°СЂРєРёСЂРѕРІРєР° Рё РїСЂРѕС†РµСЃСЃС‹ РґРѕСЃС‚Р°РІРєРё.</p><span class="chip">5 РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№</span></div>
      <div class="card"><h3>Р¤РёРЅР°РЅСЃС‹</h3><p class="muted">РћС‚С‡РµС‚ РїРѕ РїСЂРёР±С‹Р»Рё, РґРµРЅРµР¶РЅС‹Р№ РїРѕС‚РѕРє, СЂР°СЃС…РѕРґС‹ Рё СЃРѕРіР»Р°СЃРѕРІР°РЅРёРµ С†РµРЅ.</p><span class="chip">3 РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ</span></div>
      <div class="card"><h3>РљРѕРЅС‚РµРЅС‚ С‚РѕРІР°СЂРѕРІ</h3><p class="muted">PIM-РєР°СЂС‚РѕС‡РєРё, РѕРїРёСЃР°РЅРёСЏ, РёР·РѕР±СЂР°Р¶РµРЅРёСЏ Рё СЃРѕРїРѕСЃС‚Р°РІР»РµРЅРёРµ РєР°С‚РµРіРѕСЂРёР№.</p><span class="chip">3 РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ</span></div>
    </section>
  `);
}

function renderSettings() {
  const activeSection = settingsSections.find(section => section.id === selectedSettingsSection) || settingsSections[0];
  const profile = getAccountProfile();
  const isAccount = activeSection.id === 'account';

  layout(`
    <section class="settings-shell">
      <div class="top-actions">
        <div>
          <p class="eyebrow">${t('companyTitle')}</p>
          <h1>${t('settingsTitle')}</h1>
          <p class="muted">${t('settingsSubtitle')}</p>
        </div>
      </div>
      <div class="settings-layout">
        <aside class="settings-nav panel">
          ${settingsSections.map(section => `
            <button type="button" data-settings-section="${section.id}" class="${section.id === activeSection.id ? 'active' : ''}">
              <span class="settings-dot"></span>${t(section.labelKey)}
            </button>
          `).join('')}
        </aside>
        <section class="panel settings-content">
          <div class="settings-content-head">
            <div>
              <h2>${t(activeSection.labelKey)}</h2>
              <p class="muted">${isAccount ? t('accountSubtitle') : t('sectionSoon')}</p>
            </div>
            ${isAccount ? `<span class="save-pill" id="accountSaveState">${t('savedLabel')}</span>` : ''}
          </div>
          ${isAccount ? `
            <form class="account-form" id="accountForm">
              <label class="field">
                <span>${t('userLabel')}</span>
                <input name="user" value="${escapeHtml(profile.user)}" autocomplete="name">
              </label>
              <label class="field">
                <span>${t('loginLabel')}</span>
                <input name="login" value="${escapeHtml(profile.login)}" autocomplete="username">
              </label>
              <label class="field">
                <span>${t('passwordLabel')}</span>
                <input name="password" type="password" value="${escapeHtml(profile.password)}" autocomplete="new-password">
              </label>
              <label class="field">
                <span>${t('phoneLabel')}</span>
                <input name="phone" value="${escapeHtml(profile.phone)}" autocomplete="tel">
              </label>
            </form>
          ` : `
            <div class="settings-placeholder">
              <span class="menu-gear"></span>
              <strong>${t(activeSection.labelKey)}</strong>
              <p class="muted">${t('sectionSoon')}</p>
            </div>
          `}
        </section>
      </div>
    </section>
  `);

  document.querySelectorAll('[data-settings-section]').forEach(button => {
    button.addEventListener('click', () => {
      selectedSettingsSection = button.dataset.settingsSection;
      saveNavigationState();
      renderSettings();
    });
  });

  const form = document.querySelector('#accountForm');
  if (form) {
    const saveState = document.querySelector('#accountSaveState');
    form.addEventListener('input', () => {
      const nextProfile = Object.fromEntries(new FormData(form).entries());
      localStorage.setItem('thechamp_account_profile', JSON.stringify(nextProfile));
      if (saveState) {
        saveState.textContent = t('savedLabel');
        saveState.classList.add('is-saved');
        window.setTimeout(() => saveState.classList.remove('is-saved'), 600);
      }
    });
  }
}

function renderLanguage() {
  layout(`
    <section class="settings-shell">
      <div class="top-actions">
        <div>
          <p class="eyebrow">${t('companyTitle')}</p>
          <h1>${t('languageTitle')}</h1>
          <p class="muted">${t('languageSubtitle')}</p>
        </div>
      </div>
      <section class="panel language-panel">
        <div class="settings-content-head">
          <div>
            <h2>${t('chooseLanguage')}</h2>
            <p class="muted">${t('currentLanguage')}: ${languageNames[appLanguage]}</p>
          </div>
        </div>
        <div class="language-grid">
          ${Object.entries(languageNames).map(([code, label]) => `
            <button type="button" data-language="${code}" class="language-card ${appLanguage === code ? 'active' : ''}">
              <strong>${label}</strong>
              <span>${code.toUpperCase()}</span>
            </button>
          `).join('')}
        </div>
      </section>
    </section>
  `);

  document.querySelectorAll('[data-language]').forEach(button => {
    button.addEventListener('click', () => {
      appLanguage = button.dataset.language;
      localStorage.setItem('thechamp_language', appLanguage);
      document.documentElement.lang = appLanguage;
      renderApp();
    });
  });
}

function renderPremium() {
  layout(`
    <section class="settings-shell">
      <div class="top-actions">
        <div>
          <p class="eyebrow">${t('companyTitle')}</p>
          <h1>${t('premium')}</h1>
          <p class="muted">${t('sectionSoon')}</p>
        </div>
      </div>
      <section class="panel settings-placeholder">
        <span class="menu-premium"></span>
        <strong>${t('premium')}</strong>
        <p class="muted">${t('sectionSoon')}</p>
      </section>
    </section>
  `);
}

async function renderApp() {
  if (!requireAuth()) {
    renderLogin();
    return;
  }

  document.documentElement.lang = appLanguage;

  if (!dashboardData) {
    dashboardData = await api('/api/dashboard');
  }

  if (currentView === 'dashboard') renderDashboard();
  if (currentView === 'modules') renderModules();
  if (currentView === 'backup') renderBackup();
  if (currentView === 'catalog') renderCatalog();
  if (currentView === 'integrations') renderIntegrations();
  if (currentView === 'api') renderApiLogs();
  if (currentView === 'users') renderUsers();
  if (currentView === 'settings') renderSettings();
  if (currentView === 'language') renderLanguage();
  if (currentView === 'premium') renderPremium();
}

loadAppConfig().then(renderApp);


