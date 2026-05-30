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
  'Категории',
  'Комиссия категорий',
  'Товары',
  'Бренды',
  'Цвета',
  'Материалы',
  'Материалы (для фильтров)',
  'Сезоны',
  'Типы товаров',
  'Страна',
  'Теги',
  'Размеры',
  'Отзывы товаров',
  'Промокоды',
  'Характеристики'
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
let selectedCatalogSection = localStorage.getItem('thechamp_catalog_section') || 'Категории';
let catalogOpen = localStorage.getItem('thechamp_catalog_open') !== 'false';
let pendingCategoryParent = 'Без категории';
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
  ru: 'Русский',
  en: 'English',
  tr: 'Türkçe'
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
    'Категории': 'Категории',
    'Комиссия категорий': 'Комиссия категорий',
    'Товары': 'Товары',
    'Бренды': 'Бренды',
    'Цвета': 'Цвета',
    'Материалы': 'Материалы',
    'Материалы ( для фильтров)': 'Материалы ( для фильтров)',
    'Сезоны': 'Сезоны',
    'Типы товаров': 'Типы товаров',
    'Страна': 'Страна',
    'Теги': 'Теги',
    'Размеры': 'Размеры',
    'Отзывы товаров': 'Отзывы товаров',
    'Промокоды': 'Промокоды',
    'Характеристики': 'Характеристики'
  },
  en: {
    'Категории': 'Categories',
    'Комиссия категорий': 'Category commission',
    'Товары': 'Products',
    'Бренды': 'Brands',
    'Цвета': 'Colors',
    'Материалы': 'Materials',
    'Материалы ( для фильтров)': 'Materials (filters)',
    'Сезоны': 'Seasons',
    'Типы товаров': 'Product types',
    'Страна': 'Country',
    'Теги': 'Tags',
    'Размеры': 'Sizes',
    'Отзывы товаров': 'Product reviews',
    'Промокоды': 'Promo codes',
    'Характеристики': 'Attributes'
  },
  tr: {
    'Категории': 'Kategoriler',
    'Комиссия категорий': 'Kategori komisyonu',
    'Товары': 'Ürünler',
    'Бренды': 'Markalar',
    'Цвета': 'Renkler',
    'Материалы': 'Materyaller',
    'Материалы ( для фильтров)': 'Materyaller (filtreler)',
    'Сезоны': 'Sezonlar',
    'Типы товаров': 'Ürün tipleri',
    'Страна': 'Ülke',
    'Теги': 'Etiketler',
    'Размеры': 'Bedenler',
    'Отзывы товаров': 'Ürün yorumları',
    'Промокоды': 'Promokodlar',
    'Характеристики': 'Özellikler'
  }
};

const translations = {
  ru: {
    navHome: 'Главная',
    navCatalog: 'Каталог',
    navModules: 'Модули',
    navBackup: 'BuckUp',
    navIntegrations: 'API маркетплейсов',
    navApiLogs: 'Логи API',
    navAccess: 'Права доступа',
    searchPlaceholder: 'Поиск заказа, SKU, бренда или события API',
    companyTitle: 'Информация о фирме',
    companyPerson: 'Баркова Евдокия',
    companyRole: 'Управляющий +1',
    settings: 'Настройки',
    premium: 'Premium',
    language: 'Язык',
    logout: 'Выход',
    aiAssistant: 'AI помощник',
    chats: 'Чаты',
    support: 'Поддержка',
    notifications: 'Уведомления',
    settingsTitle: 'Настройки',
    settingsSubtitle: 'Управляйте профилем, сотрудниками, API, уведомлениями и юридическими разделами компании.',
    settingsAccount: 'Учётная запись',
    settingsEmployees: 'Сотрудники',
    settingsApiIntegrations: 'API интеграции',
    settingsSellerApi: 'Seller API',
    settingsPrivateApps: 'Управление частными приложениями',
    settingsNotifications: 'Уведомления',
    settingsCompanyInfo: 'Информация о компании',
    settingsContracts: 'Договоры',
    settingsBrandRepresentation: 'Представительство брендов',
    accountTitle: 'Данные пользователя',
    accountSubtitle: 'Изменения сохраняются автоматически на этом компьютере.',
    userLabel: 'Пользователь',
    loginLabel: 'Логин',
    passwordLabel: 'Пароль',
    phoneLabel: 'Телефон',
    savedLabel: 'Сохранено',
    languageTitle: 'Язык интерфейса',
    languageSubtitle: 'Выберите язык для панели администратора The Champ.',
    currentLanguage: 'Текущий язык',
    chooseLanguage: 'Выбрать язык',
    sectionSoon: 'Раздел подготовлен. Следующим шагом сюда можно добавить рабочие формы и права доступа.',
    openSettings: 'Открыть настройки',
    openLanguage: 'Открыть языки'
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
    navModules: 'Modüller',
    navBackup: 'BuckUp',
    navIntegrations: 'Marketplace API',
    navApiLogs: 'API kayıtları',
    navAccess: 'Erişim hakları',
    searchPlaceholder: 'Sipariş, SKU, marka veya API olayı ara',
    companyTitle: 'Firma bilgileri',
    companyPerson: 'Evdokia Barkova',
    companyRole: 'Yönetici +1',
    settings: 'Ayarlar',
    premium: 'Premium',
    language: 'Dil',
    logout: 'Çıkış',
    aiAssistant: 'AI asistan',
    chats: 'Sohbetler',
    support: 'Destek',
    notifications: 'Bildirimler',
    settingsTitle: 'Ayarlar',
    settingsSubtitle: 'Profil, çalışanlar, API, bildirimler ve şirket bölümlerini yönetin.',
    settingsAccount: 'Hesap',
    settingsEmployees: 'Çalışanlar',
    settingsApiIntegrations: 'API entegrasyonları',
    settingsSellerApi: 'Seller API',
    settingsPrivateApps: 'Özel uygulama yönetimi',
    settingsNotifications: 'Bildirimler',
    settingsCompanyInfo: 'Ећirket bilgileri',
    settingsContracts: 'Sözleşmeler',
    settingsBrandRepresentation: 'Marka temsilciliği',
    accountTitle: 'Kullanıcı bilgileri',
    accountSubtitle: 'Değişiklikler bu bilgisayarda otomatik saklanır.',
    userLabel: 'Kullanıcı',
    loginLabel: 'Giriş',
    passwordLabel: 'Ећifre',
    phoneLabel: 'Telefon',
    savedLabel: 'Kaydedildi',
    languageTitle: 'Arayüz dili',
    languageSubtitle: 'The Champ admin paneli için dili seçin.',
    currentLanguage: 'Geçerli dil',
    chooseLanguage: 'Dil seç',
    sectionSoon: 'Bölüm hazırlandı. Sonraki adımda buraya çalışma formları ve erişim hakları eklenebilir.',
    openSettings: 'Ayarları aç',
    openLanguage: 'Dilleri aç'
  }
};

function t(key) {
  return translations[appLanguage]?.[key] || translations.ru[key] || key;
}

const visibleTextTranslations = {
  en: {
    'Центр управления маркетплейсами': 'Marketplace control center',
    'Заказы, остатки, финансы и карточки товаров в одном кабинете.': 'Orders, stock, finance and product cards in one workspace.',
    'Панель подготовлена как white-label система: бренд, логотип, данные и доступы меняются в настройках окружения.': 'The panel is prepared as a white-label system: brand, logo, data and access can be changed in environment settings.',
    'Умный склад': 'Smart warehouse',
    'Сборка, упаковка и адресное хранение.': 'Picking, packing and address storage.',
    'PIM-система': 'PIM system',
    'Создание и массовое редактирование карточек.': 'Create and bulk-edit product cards.',
    'AI-финансы': 'AI finance',
    'Прибыль, денежный поток и план-факт.': 'Profit, cash flow and plan versus actual.',
    'Вход администратора': 'Administrator login',
    'Добро пожаловать в панель': 'Welcome to the panel',
    'Демо-аккаунт:': 'Demo account:',
    'Пароль': 'Password',
    'Войти': 'Log in',
    'Модуль Seller будет подключен позже': 'The Seller module will be connected later',
    'Подключить Seller': 'Connect Seller',
    'Платформа': 'Platform',
    'Режим': 'Mode',
    'Статус': 'Status',
    'Последняя синхронизация': 'Last sync',
    'Заказы': 'Orders',
    'Разница остатков': 'Stock difference',
    'Активен': 'Active',
    'Внимание': 'Attention',
    'AI-финансовый директор': 'AI finance director',
    'AI-планировщик': 'AI planner',
    'Финансы': 'Finance',
    'Поставки': 'Supply',
    'Сборка': 'Picking',
    'Упаковка': 'Packing',
    'Адресное хранение': 'Address storage',
    'Видео-контроль': 'Video control',
    'ОПиУ': 'P&L',
    'ДДС': 'Cash flow',
    'ABC-анализ': 'ABC analysis',
    'Снабжение': 'Supply',
    'Закупки': 'Purchasing',
    'Поставщики': 'Suppliers',
    'Расходы': 'Expenses',
    'Импорт': 'Import',
    'Создание': 'Creation',
    'Редактирование': 'Editing',
    'Аналитика': 'Analytics',
    'прибыли': 'profit',
    'дней запаса': 'days of stock',
    'карточки': 'cards',
    'Карта модулей': 'Module map',
    'Операционные модули': 'Operations modules',
    'Каждый модуль можно расширить собственными endpoint-ами маркетплейсов, очередями и отчетами.': 'Each module can be extended with custom marketplace endpoints, queues and reports.',
    'Центр API-интеграций': 'API integration center',
    'Подключения маркетплейсов': 'Marketplace connections',
    'Проверить подключение': 'Check connection',
    'Режим работы': 'Operating mode',
    'Собственный маркетплейс': 'Custom marketplace',
    'Собственный API': 'Custom API',
    'Готовая структура endpoint-ов': 'Ready endpoint structure',
    'Метрики панели, модули и интеграции.': 'Panel metrics, modules and integrations.',
    'Проверка ключа маркетплейса и URL.': 'Marketplace key and URL check.',
    'Запускает синхронизацию заказов, остатков и карточек товаров.': 'Starts order, stock and product-card sync.',
    'Платформы': 'Platforms',
    'Здесь будут размещены модули этого раздела каталога.': 'Modules for this catalog section will appear here.',
    'Категории': 'Categories',
    'Создавайте и храните категории каталога.': 'Create and store catalog categories.',
    'Добавить категорию': 'Add category',
    'Категорий пока нет': 'No categories yet',
    'Нажмите «Добавить категорию», чтобы создать первую категорию.': 'Click "Add category" to create the first category.',
    'Категорий:': 'Categories:',
    'Выберите главную категорию': 'Select a main category',
    'Уровень': 'Level',
    'Главные категории': 'Main categories',
    'подкатегорий': 'subcategories',
    'конечная категория': 'final category',
    'От меньшего к большему': 'From smaller to larger',
    'Активность категории': 'Category activity',
    'Показывать на главной': 'Show on home page',
    'Справочник брендов': 'Brand directory',
    'Товаров с брендом': 'Products with brand',
    'Готово': 'Ready',
    'Бренды': 'Brands',
    'Все бренды собираются из товаров и сохраняются в каталоге': 'All brands are collected from products and saved in the catalog',
    'Название бренда': 'Brand name',
    'Добавить бренд': 'Add brand',
    'Брендов пока нет': 'No brands yet',
    'Добавьте первый бренд или создайте товар с новым брендом.': 'Add the first brand or create a product with a new brand.',
    'Цвета': 'Colors',
    'Цветов пока нет': 'No colors yet',
    'Товары': 'Products',
    'Работа с товарами': 'Product management',
    'Список товаров': 'Product list',
    'Скачать шаблоны': 'Download templates',
    'Добавить товары': 'Add products',
    'Название, артикул, SKU, штрихкод': 'Name, article, SKU, barcode',
    'Фильтры⌄': 'Filters⌄',
    'Удалить выбранные': 'Delete selected',
    'Сбросить': 'Reset',
    'Товар': 'Product',
    'Артикул / SKU': 'Article / SKU',
    'Цена': 'Price',
    'Остатки': 'Stock',
    'Штрихкод': 'Barcode',
    'Качество': 'Quality',
    'Дата / объем': 'Date / volume',
    'Товаров пока нет': 'No products yet',
    'Нажмите «Добавить товары», заполните данные, и товар появится в этой таблице.': 'Click "Add products", fill in the data, and the product will appear in this table.',
    'Объединен': 'Grouped',
    'Добавить метку': 'Add label',
    'Ваша цена': 'Your price',
    'Отзывы:': 'Reviews:',
    'Рейтинг:': 'Rating:',
    'Контент:': 'Content:',
    'Аналитика': 'Analytics',
    'Редактировать': 'Edit',
    'Удалить': 'Delete',
    'Добавление категории': 'Add category',
    'Закрыть': 'Close',
    'Название': 'Name',
    'Родительская категория': 'Parent category',
    'Без категории': 'No category',
    'ID категории в системе 1C': 'Category ID in 1C',
    'Порядок сортировки': 'Sort order',
    'Изображение категории (главная)': 'Category image (main)',
    'Иконка (48x48px)': 'Icon (48x48px)',
    'Перетащите изображение сюда': 'Drag image here',
    'или': 'or',
    'Нажмите, чтобы загрузить': 'Click to upload',
    'Отмена': 'Cancel',
    'Сохранить категорию': 'Save category',
    'Все удаленные данные сохраняются здесь, чтобы их можно было выбрать и вернуть обратно.': 'Deleted data is stored here so you can select and restore it.',
    'Пока здесь нет удаленных данных. После удаления элементы будут сохраняться в этом разделе.': 'There is no deleted data here yet. Deleted items will be saved in this section.',
    'Поиск по названию, артикулу или дате удаления': 'Search by name, article or deletion date',
    'Выбрать все': 'Select all',
    'Восстановить выбранное': 'Restore selected',
    'Выберите категорию и тип товара': 'Select product category and type',
    'Название категории, товара или типа': 'Category, product or type name',
    'Искать везде': 'Search everywhere',
    'Главные категории': 'Main categories',
    'Подкатегории': 'Subcategories',
    'Подтвердить': 'Confirm',
    'Категория продавца': 'Seller category',
    'Качество карточки: 2': 'Card quality: 2',
    'Изменить': 'Change',
    'Артикул продавца': 'Seller article',
    'Бренд': 'Brand',
    'Выбрать бренд': 'Choose brand',
    'Цвет': 'Color',
    'Выбрать цвет': 'Choose color',
    'Материал': 'Material',
    'Выбрать материал': 'Choose material',
    'Размер': 'Size',
    'Например: 75-B, M, 42': 'Example: 75-B, M, 42',
    'ТНВЭД': 'HS code',
    'Выбрать': 'Choose',
    'Нужна маркировка КИЗ': 'KIZ marking required',
    'Подтверждаю, что на товар нанесена необходимая маркировка': 'I confirm that the required marking is applied to the product',
    'Главная': 'Main',
    'Фото и видео': 'Photo and video',
    'Перетащите сюда или выберите файл': 'Drag here or choose a file',
    'Добавить': 'Add',
    'Варианты товара': 'Product variants',
    'Новая карточка': 'New card',
    'Фото и название появятся после заполнения': 'Photo and name will appear after filling',
    'Создайте карточку товара: медиа, категория, описание и торговые параметры': 'Create a product card: media, category, description and trade parameters',
    'Редактор фото': 'Photo editor',
    'Фотостудия': 'Photo studio',
    'Видеообложка': 'Video cover',
    'Добавить медиа по ссылке': 'Add media by link',
    'Информация о товаре': 'Product information',
    'Предварительный просмотр': 'Preview',
    'Основная информация': 'Basic information',
    'Готовность: 0%': 'Readiness: 0%',
    'Штрихкод нужен для компенсации при утере': 'Barcode is needed for loss compensation',
    'Ваша цена, ₽ *': 'Your price, ₽ *',
    'Цена до скидки, ₽': 'Price before discount, ₽',
    'НДС *': 'VAT *',
    'Без НДС': 'No VAT',
    'Габариты и вес': 'Dimensions and weight',
    'Длина упаковки, мм *': 'Package length, mm *',
    'Ширина упаковки, мм *': 'Package width, mm *',
    'Высота упаковки, мм *': 'Package height, mm *',
    'Вес с упаковкой, г *': 'Package weight, g *',
    'Остаток': 'Stock',
    'Производитель': 'Manufacturer',
    'Доступны к продаже': 'Available for sale',
    'Продается': 'On sale',
    'Без названия': 'Untitled',
    'Бренд не указан': 'Brand not specified',
    'на складе': 'in stock',
    'л': 'l',
    'Причина не указана': 'Reason not specified',
    'Все': 'All',
    'Готовы к продаже': 'Ready for sale',
    'Ошибки': 'Errors',
    'На доработку': 'Needs work',
    'Сняты с продажи': 'Removed from sale',
    'Архив': 'Archive',
    'В продаже': 'On sale',
    'Нет в наличии': 'Out of stock',
    'В ошибке': 'Has error',
    'Панель управления / Товары / Добавление товара': 'Control panel / Products / Add product',
    'Добавление товара': 'Add product',
    'Отменить': 'Cancel',
    'Добавить товар': 'Add product',
    'Технический мониторинг': 'Technical monitoring',
    'Логи API': 'API logs',
    'Безопасность': 'Security',
    'Центр ролей и прав доступа': 'Role and access center',
    'Владелец': 'Owner',
    'Все магазины, API-ключи, финансы и управление пользователями.': 'All stores, API keys, finance and user management.',
    'Операции': 'Operations',
    'Заказы, склад, маркировка и процессы доставки.': 'Orders, warehouse, marking and delivery processes.',
    'Финансы': 'Finance',
    'Отчет по прибыли, денежный поток, расходы и согласование цен.': 'Profit report, cash flow, expenses and price approval.',
    'Контент товаров': 'Product content',
    'PIM-карточки, описания, изображения и сопоставление категорий.': 'PIM cards, descriptions, images and category mapping.',
    'пользователь': 'user',
    'пользователя': 'users',
    'пользователей': 'users',
    'Ожидает подключения': 'Waiting for connection',
    'Требуется настройка': 'Setup required',
    'Получено 63 новых заказа': '63 new orders received',
    'Обновлено 214 остатков': '214 stock items updated',
    'Обогащено 18 карточек': '18 cards enriched'
  },
  tr: {
    'Центр управления маркетплейсами': 'Marketplace yönetim merkezi',
    'Заказы, остатки, финансы и карточки товаров в одном кабинете.': 'Siparişler, stoklar, finans ve ürün kartları tek panelde.',
    'Панель подготовлена как white-label система: бренд, логотип, данные и доступы меняются в настройках окружения.': 'Panel white-label sistem olarak hazırlandı: marka, logo, veriler ve erişimler ortam ayarlarından değişir.',
    'Умный склад': 'Akıllı depo',
    'Сборка, упаковка и адресное хранение.': 'Toplama, paketleme ve adresli depolama.',
    'PIM-система': 'PIM sistemi',
    'Создание и массовое редактирование карточек.': 'Ürün kartları oluşturma ve toplu düzenleme.',
    'AI-финансы': 'AI finans',
    'Прибыль, денежный поток и план-факт.': 'Kâr, nakit akışı ve plan/gerçek.',
    'Вход администратора': 'Yönetici girişi',
    'Добро пожаловать в панель': 'Panele hoş geldiniz',
    'Демо-аккаунт:': 'Demo hesap:',
    'Пароль': 'Şifre',
    'Войти': 'Giriş yap',
    'Модуль Seller будет подключен позже': 'Seller modülü daha sonra bağlanacak',
    'Подключить Seller': 'Seller bağla',
    'Платформа': 'Platform',
    'Режим': 'Mod',
    'Статус': 'Durum',
    'Последняя синхронизация': 'Son senkronizasyon',
    'Заказы': 'Siparişler',
    'Разница остатков': 'Stok farkı',
    'Активен': 'Aktif',
    'Внимание': 'Dikkat',
    'AI-финансовый директор': 'AI finans direktörü',
    'AI-планировщик': 'AI planlayıcı',
    'Финансы': 'Finans',
    'Поставки': 'Tedarik',
    'Сборка': 'Toplama',
    'Упаковка': 'Paketleme',
    'Адресное хранение': 'Adresli depolama',
    'Видео-контроль': 'Video kontrol',
    'ОПиУ': 'Kâr-zarar',
    'ДДС': 'Nakit akışı',
    'ABC-анализ': 'ABC analizi',
    'Снабжение': 'Tedarik',
    'Закупки': 'Satın alma',
    'Поставщики': 'Tedarikçiler',
    'Расходы': 'Giderler',
    'Импорт': 'İçe aktarma',
    'Создание': 'Oluşturma',
    'Редактирование': 'Düzenleme',
    'Аналитика': 'Analitik',
    'прибыли': 'kâr',
    'дней запаса': 'gün stok',
    'карточки': 'kart',
    'Карта модулей': 'Modül haritası',
    'Операционные модули': 'Operasyon modülleri',
    'Каждый модуль можно расширить собственными endpoint-ами маркетплейсов, очередями и отчетами.': 'Her modül özel marketplace endpointleri, kuyruklar ve raporlarla genişletilebilir.',
    'Центр API-интеграций': 'API entegrasyon merkezi',
    'Подключения маркетплейсов': 'Marketplace bağlantıları',
    'Проверить подключение': 'Bağlantıyı kontrol et',
    'Режим работы': 'Çalışma modu',
    'Собственный маркетплейс': 'Özel marketplace',
    'Собственный API': 'Özel API',
    'Готовая структура endpoint-ов': 'Hazır endpoint yapısı',
    'Метрики панели, модули и интеграции.': 'Panel metrikleri, modüller ve entegrasyonlar.',
    'Проверка ключа маркетплейса и URL.': 'Marketplace anahtarı ve URL kontrolü.',
    'Запускает синхронизацию заказов, остатков и карточек товаров.': 'Sipariş, stok ve ürün kartı senkronizasyonunu başlatır.',
    'Платформы': 'Platformlar',
    'Здесь будут размещены модули этого раздела каталога.': 'Bu katalog bölümünün modülleri burada yer alacak.',
    'Категории': 'Kategoriler',
    'Создавайте и храните категории каталога.': 'Katalog kategorilerini oluşturun ve saklayın.',
    'Добавить категорию': 'Kategori ekle',
    'Категорий пока нет': 'Henüz kategori yok',
    'Нажмите «Добавить категорию», чтобы создать первую категорию.': 'İlk kategoriyi oluşturmak için "Kategori ekle"ye basın.',
    'Категорий:': 'Kategori:',
    'Выберите главную категорию': 'Ana kategoriyi seçin',
    'Уровень': 'Seviye',
    'Главные категории': 'Ana kategoriler',
    'подкатегорий': 'alt kategori',
    'конечная категория': 'son kategori',
    'От меньшего к большему': 'Küçükten büyüğe',
    'Активность категории': 'Kategori aktifliği',
    'Показывать на главной': 'Ana sayfada göster',
    'Справочник брендов': 'Marka rehberi',
    'Товаров с брендом': 'Markalı ürünler',
    'Готово': 'Hazır',
    'Бренды': 'Markalar',
    'Все бренды собираются из товаров и сохраняются в каталоге': 'Tüm markalar ürünlerden toplanır ve katalogda saklanır',
    'Название бренда': 'Marka adı',
    'Добавить бренд': 'Marka ekle',
    'Брендов пока нет': 'Henüz marka yok',
    'Добавьте первый бренд или создайте товар с новым брендом.': 'İlk markayı ekleyin veya yeni markalı ürün oluşturun.',
    'Цвета': 'Renkler',
    'Цветов пока нет': 'Henüz renk yok',
    'Товары': 'Ürünler',
    'Работа с товарами': 'Ürün yönetimi',
    'Список товаров': 'Ürün listesi',
    'Скачать шаблоны': 'Şablonları indir',
    'Добавить товары': 'Ürün ekle',
    'Название, артикул, SKU, штрихкод': 'Ad, artikül, SKU, barkod',
    'Фильтры⌄': 'Filtreler⌄',
    'Удалить выбранные': 'Seçilenleri sil',
    'Сбросить': 'Sıfırla',
    'Товар': 'Ürün',
    'Артикул / SKU': 'Artikül / SKU',
    'Цена': 'Fiyat',
    'Остатки': 'Stok',
    'Штрихкод': 'Barkod',
    'Качество': 'Kalite',
    'Дата / объем': 'Tarih / hacim',
    'Товаров пока нет': 'Henüz ürün yok',
    'Нажмите «Добавить товары», заполните данные, и товар появится в этой таблице.': '"Ürün ekle"ye basıp bilgileri doldurun, ürün bu tabloda görünecek.',
    'Объединен': 'Birleştirildi',
    'Добавить метку': 'Etiket ekle',
    'Ваша цена': 'Fiyatınız',
    'Отзывы:': 'Yorumlar:',
    'Рейтинг:': 'Puan:',
    'Контент:': 'İçerik:',
    'Аналитика': 'Analitik',
    'Редактировать': 'Düzenle',
    'Удалить': 'Sil',
    'Добавление категории': 'Kategori ekleme',
    'Закрыть': 'Kapat',
    'Название': 'Ad',
    'Родительская категория': 'Üst kategori',
    'Без категории': 'Kategorisiz',
    'ID категории в системе 1C': '1C sisteminde kategori ID',
    'Порядок сортировки': 'Sıralama',
    'Изображение категории (главная)': 'Kategori görseli (ana)',
    'Иконка (48x48px)': 'İkon (48x48px)',
    'Перетащите изображение сюда': 'Görseli buraya sürükleyin',
    'или': 'veya',
    'Нажмите, чтобы загрузить': 'Yüklemek için tıklayın',
    'Отмена': 'İptal',
    'Сохранить категорию': 'Kategoriyi kaydet',
    'Все удаленные данные сохраняются здесь, чтобы их можно было выбрать и вернуть обратно.': 'Silinen tüm veriler burada saklanır, seçip geri yükleyebilirsiniz.',
    'Пока здесь нет удаленных данных. После удаления элементы будут сохраняться в этом разделе.': 'Burada henüz silinen veri yok. Silinen öğeler bu bölümde saklanacak.',
    'Поиск по названию, артикулу или дате удаления': 'Ad, artikül veya silinme tarihine göre ara',
    'Выбрать все': 'Tümünü seç',
    'Восстановить выбранное': 'Seçilenleri geri yükle',
    'Выберите категорию и тип товара': 'Ürün kategorisi ve tipini seçin',
    'Название категории, товара или типа': 'Kategori, ürün veya tip adı',
    'Искать везде': 'Her yerde ara',
    'Главные категории': 'Ana kategoriler',
    'Подкатегории': 'Alt kategoriler',
    'Подтвердить': 'Onayla',
    'Категория продавца': 'Satıcı kategorisi',
    'Качество карточки: 2': 'Kart kalitesi: 2',
    'Изменить': 'Değiştir',
    'Артикул продавца': 'Satıcı artikülü',
    'Бренд': 'Marka',
    'Выбрать бренд': 'Marka seç',
    'Цвет': 'Renk',
    'Выбрать цвет': 'Renk seç',
    'Материал': 'Materyal',
    'Выбрать материал': 'Materyal seç',
    'Размер': 'Beden',
    'Например: 75-B, M, 42': 'Örn: 75-B, M, 42',
    'ТНВЭД': 'GTİP kodu',
    'Выбрать': 'Seç',
    'Нужна маркировка КИЗ': 'KIZ işaretlemesi gerekli',
    'Подтверждаю, что на товар нанесена необходимая маркировка': 'Üründe gerekli işaretlemenin bulunduğunu onaylıyorum',
    'Главная': 'Ana',
    'Фото и видео': 'Fotoğraf ve video',
    'Перетащите сюда или выберите файл': 'Buraya sürükleyin veya dosya seçin',
    'Добавить': 'Ekle',
    'Варианты товара': 'Ürün varyantları',
    'Новая карточка': 'Yeni kart',
    'Фото и название появятся после заполнения': 'Fotoğraf ve ad doldurduktan sonra görünecek',
    'Создайте карточку товара: медиа, категория, описание и торговые параметры': 'Ürün kartı oluşturun: medya, kategori, açıklama ve satış parametreleri',
    'Редактор фото': 'Fotoğraf editörü',
    'Фотостудия': 'Foto stüdyo',
    'Видеообложка': 'Video kapağı',
    'Добавить медиа по ссылке': 'Link ile medya ekle',
    'Информация о товаре': 'Ürün bilgisi',
    'Предварительный просмотр': 'Ön izleme',
    'Основная информация': 'Temel bilgiler',
    'Готовность: 0%': 'Hazırlık: 0%',
    'Штрихкод нужен для компенсации при утере': 'Barkod kayıp telafisi için gereklidir',
    'Ваша цена, ₽ *': 'Fiyatınız, ₽ *',
    'Цена до скидки, ₽': 'İndirim öncesi fiyat, ₽',
    'НДС *': 'KDV *',
    'Без НДС': 'KDV yok',
    'Габариты и вес': 'Ölçüler ve ağırlık',
    'Длина упаковки, мм *': 'Paket uzunluğu, mm *',
    'Ширина упаковки, мм *': 'Paket genişliği, mm *',
    'Высота упаковки, мм *': 'Paket yüksekliği, mm *',
    'Вес с упаковкой, г *': 'Paket ağırlığı, g *',
    'Остаток': 'Stok',
    'Производитель': 'Üretici',
    'Доступны к продаже': 'Satışa uygun',
    'Продается': 'Satışta',
    'Без названия': 'Adsız',
    'Бренд не указан': 'Marka belirtilmedi',
    'на складе': 'depoda',
    'л': 'l',
    'Причина не указана': 'Neden belirtilmedi',
    'Все': 'Tümü',
    'Готовы к продаже': 'Satışa hazır',
    'Ошибки': 'Hatalar',
    'На доработку': 'Düzenlenecek',
    'Сняты с продажи': 'Satıştan kaldırılanlar',
    'Архив': 'Arşiv',
    'В продаже': 'Satışta',
    'Нет в наличии': 'Stokta yok',
    'В ошибке': 'Hatalı',
    'Панель управления / Товары / Добавление товара': 'Yönetim paneli / Ürünler / Ürün ekleme',
    'Добавление товара': 'Ürün ekleme',
    'Отменить': 'İptal',
    'Добавить товар': 'Ürün ekle',
    'Технический мониторинг': 'Teknik izleme',
    'Логи API': 'API kayıtları',
    'Безопасность': 'Güvenlik',
    'Центр ролей и прав доступа': 'Rol ve erişim merkezi',
    'Владелец': 'Sahip',
    'Все магазины, API-ключи, финансы и управление пользователями.': 'Tüm mağazalar, API anahtarları, finans ve kullanıcı yönetimi.',
    'Операции': 'Operasyonlar',
    'Заказы, склад, маркировка и процессы доставки.': 'Siparişler, depo, işaretleme ve teslimat süreçleri.',
    'Финансы': 'Finans',
    'Отчет по прибыли, денежный поток, расходы и согласование цен.': 'Kâr raporu, nakit akışı, giderler ve fiyat onayı.',
    'Контент товаров': 'Ürün içeriği',
    'PIM-карточки, описания, изображения и сопоставление категорий.': 'PIM kartları, açıklamalar, görseller ve kategori eşleştirme.',
    'пользователь': 'kullanıcı',
    'пользователя': 'kullanıcı',
    'пользователей': 'kullanıcı',
    'Ожидает подключения': 'Bağlantı bekliyor',
    'Требуется настройка': 'Ayar gerekli',
    'Получено 63 новых заказа': '63 yeni sipariş alındı',
    'Обновлено 214 остатков': '214 stok güncellendi',
    'Обогащено 18 карточек': '18 kart zenginleştirildi'
  }
};

function translateVisibleText(value) {
  if (appLanguage === 'ru' || value == null) return value;
  const original = String(value);
  const trimmed = original.trim();
  if (!trimmed) return original;

  const dictionary = visibleTextTranslations[appLanguage] || {};
  let translated = dictionary[trimmed];
  if (!translated) {
    translated = Object.entries(dictionary).reduce((text, [from, to]) => text.replaceAll(from, to), trimmed);
  }

  if (!translated || translated === trimmed) return original;
  return original.replace(trimmed, translated);
}

function localizeVisibleText(root = document) {
  if (appLanguage === 'ru') return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION'].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    node.nodeValue = translateVisibleText(node.nodeValue);
  });

  root.querySelectorAll('[placeholder], [title], [aria-label]').forEach(element => {
    ['placeholder', 'title', 'aria-label'].forEach(attribute => {
      if (element.hasAttribute(attribute)) {
        element.setAttribute(attribute, translateVisibleText(element.getAttribute(attribute)));
      }
    });
  });
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

function uiText(value) {
  return escapeHtml(translateVisibleText(value));
}

function getAccountProfile() {
  const fallback = {
    user: 'Баркова Евдокия',
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

  if (text.includes('женщинам') || text.includes('женская') || text.includes('для женщин')) return 1;
  if (text.includes('мужчинам') || text.includes('мужская') || text.includes('для мужчин')) return 2;
  if (text.includes('девочкам') || text.includes('девочки') || text.includes('для девочек')) return 3;
  if (text.includes('мальчикам') || text.includes('мальчики') || text.includes('для мальчиков')) return 4;
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
  if (!response.ok) throw new Error(data.message || 'Запрос не выполнен');
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
          <p class="eyebrow">Центр управления маркетплейсами</p>
          <h1>Заказы, остатки, финансы и карточки товаров в одном кабинете.</h1>
          <p class="muted">Панель подготовлена как white-label система: бренд, логотип, данные и доступы меняются в настройках окружения.</p>
          <div class="preview-grid">
            <div class="mini-card"><h3>Умный склад</h3><p class="muted">Сборка, упаковка и адресное хранение.</p></div>
            <div class="mini-card"><h3>PIM-система</h3><p class="muted">Создание и массовое редактирование карточек.</p></div>
            <div class="mini-card"><h3>AI-финансы</h3><p class="muted">Прибыль, денежный поток и план-факт.</p></div>
          </div>
        </div>
      </div>
      <aside class="login-side">
        <form class="login-card" id="loginForm">
          <p class="eyebrow">Вход администратора</p>
          <h2>Добро пожаловать в панель</h2>
          <p class="muted">Демо-аккаунт: ${escapeHtml(demoEmail)} / admin</p>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" value="${escapeHtml(demoEmail)}" autocomplete="email">
          </div>
          <div class="field">
            <label for="password">Пароль</label>
            <input id="password" type="password" value="admin" autocomplete="current-password">
          </div>
          <p class="error" id="loginError"></p>
          <button class="btn primary full" type="submit">Войти</button>
        </form>
      </aside>
    </section>
  `;

  localizeVisibleText(app);

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
        <button class="seller-connect" type="button" disabled title="Модуль Seller будет подключен позже">
          <span>Seller</span>
          <strong>Подключить Seller</strong>
        </button>
        <nav class="nav">
          <button type="button" data-view="dashboard" class="${currentView === 'dashboard' ? 'active' : ''}">
            <span><img class="nav-icon" src="${icons.dashboard}" alt=""></span>${t('navHome')}
          </button>
          <button type="button" data-toggle-catalog class="catalog-toggle ${currentView === 'catalog' ? 'active' : ''}">
            <span><img class="nav-icon" src="${icons.catalog}" alt=""></span>
            <span class="nav-label">${t('navCatalog')}</span>
            <span class="chevron ${catalogOpen ? 'open' : ''}">⌄</span>
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
                <button type="button" class="company-menu-item" data-company-view="language"><span class="menu-language"></span>${t('language')}<b>›</b></button>
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

  localizeVisibleText(app);

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
        <span class="status ${item.health}">${item.health === 'good' ? 'Активен' : 'Внимание'}</span>
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
      <thead><tr><th>Платформа</th><th>Режим</th><th>Статус</th><th>Последняя синхронизация</th><th>Заказы</th><th>Разница остатков</th></tr></thead>
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
    connected: 'Подключено',
    pending: 'Ожидает',
    draft: 'Черновик'
  }[status] || status;
}

function renderModules() {
  layout(`
    <p class="eyebrow">Карта модулей ${escapeHtml(appBrand())}</p>
    <h1>Операционные модули</h1>
    <p class="muted">Каждый модуль можно расширить собственными endpoint-ами маркетплейсов, очередями и отчетами.</p>
    <section class="grid modules">
      ${dashboardData.modules.map(moduleCard).join('')}
    </section>
  `);
}

function renderIntegrations() {
  layout(`
    <p class="eyebrow">Центр API-интеграций</p>
    <h1>Подключения маркетплейсов</h1>
    <section class="grid two-col">
      <div class="panel">
        <h2>Проверить подключение</h2>
        <form id="integrationForm" class="form-grid">
          <div class="field">
            <label for="provider">Платформа</label>
            <select id="provider">
              <option>${escapeHtml(appBrand())}</option>
              <option>${escapeHtml(appProductName())}</option>
              <option>Yandex Market</option>
              <option>Trendyol</option>
              <option>Собственный маркетплейс</option>
            </select>
          </div>
          <div class="field">
            <label for="mode">Режим работы</label>
            <select id="mode">
              <option>FBO</option>
              <option>FBS</option>
              <option>DBS / RealFBS</option>
              <option>Собственный API</option>
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
          <button class="btn primary" type="submit">Проверить подключение</button>
        </form>
        <div id="integrationResult" class="result hidden"></div>
      </div>
      <div class="panel">
        <h2>Готовая структура endpoint-ов</h2>
        <div class="event-list">
          <div class="event"><strong>GET /api/dashboard</strong><p class="muted">Метрики панели, модули и интеграции.</p></div>
          <div class="event"><strong>POST /api/integrations/test</strong><p class="muted">Проверка ключа маркетплейса и URL.</p></div>
          <div class="event"><strong>POST /api/sync</strong><p class="muted">Запускает синхронизацию заказов, остатков и карточек товаров.</p></div>
        </div>
      </div>
    </section>
    <section class="panel" style="margin-top:18px">
      <h2>Платформы</h2>
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
  if (selectedCatalogSection === 'Категории' && !savedCategories) {
    savedCategories = (await api('/api/catalog/categories')).categories;
  }
  if (selectedCatalogSection === 'Товары') {
    if (!savedCategories) savedCategories = (await api('/api/catalog/categories')).categories;
    if (!catalogColors) catalogColors = (await api('/api/catalog/colors')).colors;
    if (!catalogMaterials) catalogMaterials = (await api('/api/catalog/materials')).materials;
    if (!catalogBrands) catalogBrands = (await api('/api/catalog/brands')).brands;
    if (!catalogProducts) catalogProducts = (await api('/api/catalog/products')).products;
  }
  if (selectedCatalogSection === 'Бренды') {
    if (!catalogProducts) catalogProducts = (await api('/api/catalog/products')).products;
    catalogBrands = (await api('/api/catalog/brands')).brands;
  }
  if (selectedCatalogSection === 'Цвета' && !catalogColors) {
    catalogColors = (await api('/api/catalog/colors')).colors;
  }
  const categories = savedCategories || [];
  const productsForStats = selectedCatalogSection === 'Товары' ? (catalogProducts || []) : [];
  const catalogStats = {
    products: productsForStats.length,
    categories: categories.length,
    stock: productsForStats.reduce((sum, product) => sum + Number(product.stock || 0), 0),
    averagePrice: productsForStats.length
      ? productsForStats.reduce((sum, product) => sum + Number(product.salePrice || 0), 0) / productsForStats.length
      : 0,
    importStatus: 'Готова'
  };
  const categoryButtons = selectedCatalogSection === 'Категории' ? buildCategoryPathRows(categories) : '';
  let sectionPanel = `
    <section class="panel" style="margin-top:18px">
      <div class="empty-state">
        <img class="empty-icon" src="/assets/icon-folder.svg" alt="">
        <div>
          <h3>${catalogLabel(selectedCatalogSection)}</h3>
          <p class="muted">Здесь будут размещены модули этого раздела каталога.</p>
        </div>
      </div>
    </section>
  `;

  if (selectedCatalogSection === 'Категории') {
    sectionPanel = `
      <section class="panel" style="margin-top:18px">
        <div class="section-head">
          <div>
            <h2>${uiText('Категории')}</h2>
            <p class="muted">${uiText('Создавайте и храните категории каталога.')}</p>
          </div>
          <button class="btn primary" type="button" id="addCategoryButton" data-parent="Без категории">${uiText('Добавить категорию')}</button>
        </div>
        <div class="category-board ${categoryButtons ? '' : 'hidden'}">
          ${categoryButtons}
        </div>
        <div class="empty-state ${categoryButtons ? 'hidden' : ''}">
          <img class="empty-icon" src="/assets/icon-folder.svg" alt="">
          <div>
            <h3>${uiText('Категорий пока нет')}</h3>
            <p class="muted">${uiText('Нажмите «Добавить категорию», чтобы создать первую категорию.')}</p>
          </div>
        </div>
      </section>
      ${categoryModal()}
    `;
  }

  if (selectedCatalogSection === 'Товары') {
    sectionPanel = productEditorOpen ? productEditorPanel() : productModulesPanel();
  }

  if (selectedCatalogSection === 'Цвета') {
    sectionPanel = colorsPanel();
  }
  if (selectedCatalogSection === 'Бренды') {
    sectionPanel = brandsPanel();
  }

  layout(`
    <div class="top-actions catalog-page-head ${selectedCatalogSection === 'Товары' ? 'product-catalog-head' : ''}">
      <div>
        <h1>${catalogLabel(selectedCatalogSection)}</h1>
      </div>
    </div>
    ${sectionPanel}
  `);

  if (selectedCatalogSection === 'Категории') {
    bindCategoryForm();
  }

  if (selectedCatalogSection === 'Товары') {
    productEditorOpen ? bindProductEditor() : bindProductModules();
  }
  if (selectedCatalogSection === 'Бренды') {
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
  const name = productDraftName.trim() || productDraftCategory || 'Новый товар';
  const category = productDraftCategory || 'Без категории';
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
    season: value('#newProductSeason') || 'Всесезонный',
    availability: value('#newProductAvailability') || 'Доступны к продаже',
    barcode: value('#newProductBarcode'),
    wb: marketplaceArticle,
    seller: value('#newProductSellerArticle') || `TC-${Date.now().toString().slice(-6)}`,
    color: '—',
    sizes: '—',
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
  { id: 'all', label: 'Все' },
  { id: 'sale', label: 'В продаже' },
  { id: 'ready', label: 'Готовы к продаже' },
  { id: 'errors', label: 'Ошибки' },
  { id: 'review', label: 'На доработку' },
  { id: 'removed', label: 'Сняты с продажи' },
  { id: 'archive', label: 'Архив' }
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

  if (product.archived || text.includes('архив')) return 'archive';
  if (product.removedFromSale || product.saleStopped || text.includes('снят')) return 'removed';
  if (product.hasError || product.error || text.includes('ошиб')) return 'errors';
  if (!hasName || !hasCategory) return 'errors';
  if (product.needsWork || product.inReview || text.includes('доработ') || text.includes('чернов') || text.includes('подготов')) return 'review';
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
    const name = String(product.brand || '').trim() || 'Бренд не указан';
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
          <span>Справочник брендов</span>
          <strong>${brands.length}</strong>
        </div>
        <div>
          <span>Товаров с брендом</span>
          <strong>${totalProducts}</strong>
        </div>
        <div>
          <span>Последняя синхронизация</span>
          <strong>Готово</strong>
        </div>
      </div>

      <section class="panel brand-panel">
        <div class="section-head">
          <div>
            <h2>Бренды</h2>
            <p class="muted">Все бренды собираются из товаров и сохраняются в каталоге ${escapeHtml(appBrand())}.</p>
          </div>
          <form class="brand-form" id="brandForm">
            <input id="brandNameInput" placeholder="Название бренда" autocomplete="off">
            <button class="btn primary" type="submit">Добавить бренд</button>
          </form>
        </div>
        <p class="result hidden" id="brandResult"></p>
        <div class="brand-grid ${brands.length ? '' : 'hidden'}">
          ${brands.map(brand => `
            <article class="brand-card">
              <div class="brand-mark">${escapeHtml(brand.name.slice(0, 2).toUpperCase())}</div>
              <div>
                <strong>${escapeHtml(brand.name)}</strong>
                <span>${brand.products.length} товаров</span>
              </div>
              <small>${brand.source === 'manual' ? 'Добавлен вручную' : 'Из товаров'}</small>
            </article>
          `).join('')}
        </div>
        <div class="empty-state ${brands.length ? 'hidden' : ''}">
          <img class="empty-icon" src="/assets/icon-folder.svg" alt="">
          <div>
            <h3>Брендов пока нет</h3>
            <p class="muted">Добавьте первый бренд или создайте товар с новым брендом.</p>
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
      result.textContent = 'Укажите название бренда.';
      result.classList.remove('hidden');
      return;
    }
    const response = await api('/api/catalog/brands', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
    catalogBrands = response.brands;
    input.value = '';
    result.textContent = `Бренд "${name}" сохранен.`;
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
          <h2>Цвета</h2>
          <p class="muted">Цвета синхронизируются из папки D:\\thechamp\\katalog\\Цвета.</p>
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
          <h3>Цветов пока нет</h3>
          <p class="muted">Добавьте папку цвета в D:\\thechamp\\katalog\\Цвета, и она появится здесь.</p>
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
            <span>←</span>
            <span>${uiText('Товары')}</span>
            <span>›</span>
            <strong>${uiText('Работа с товарами')}</strong>
          </div>
          <h1>${uiText('Список товаров')}</h1>
        </div>
        <div class="product-list-actions">
          <button class="btn soft" type="button">${uiText('Скачать шаблоны')}</button>
          <button class="btn primary" id="addProductButton" type="button">${uiText('Добавить товары')}</button>
        </div>
      </div>

      <div class="product-status-tabs">
        ${productStatusTabs.map(tab => `
          <button class="${activeProductStatus === tab.id ? 'active' : ''}" type="button" data-product-status-tab="${tab.id}">
            ${uiText(tab.label)} <span>${statusCounts[tab.id] || 0}</span>
          </button>
        `).join('')}
      </div>

      <div class="product-list-toolbar">
        <label class="product-list-search">
          <img src="/assets/icon-search.svg" alt="">
          <input id="productSearchInput" placeholder="${uiText('Название, артикул, SKU, штрихкод')}">
        </label>
        <button class="btn soft" id="applyProductFilters" type="button">${uiText('Фильтры⌄')}</button>
        <button class="btn danger-outline" id="deleteSelectedProducts" type="button">${uiText('Удалить выбранные')}</button>
        <button class="btn soft" id="resetProductFilters" type="button">${uiText('Сбросить')}</button>
      </div>

      <p class="result hidden" id="productModuleResult"></p>

      <div class="product-table-shell">
        <div class="product-table" id="productTable">
          <div class="product-table-head product-table-head-modern">
            <label class="product-check"><input id="selectAllProducts" type="checkbox"></label>
            <span>${uiText('Товар')}</span>
            <span>${uiText('Артикул / SKU')}</span>
            <span>${uiText('Статус')}</span>
            <span>${uiText('Цена')}</span>
            <span>${uiText('Остатки')}</span>
            <span>${uiText('Штрихкод')}</span>
            <span>${uiText('Качество')}</span>
            <span>${uiText('Дата / объем')}</span>
            <span></span>
          </div>          ${productRows}
        </div>
        <div class="empty-state ${products.length ? 'hidden' : ''}">
          <img class="empty-icon" src="/assets/icon-folder.svg" alt="">
          <div>
            <h3>${uiText('Товаров пока нет')}</h3>
            <p class="muted">${uiText('Нажмите «Добавить товары», заполните данные, и товар появится в этой таблице.')}</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function productRow(product) {
  const productName = product.name || translateVisibleText('Без названия');
  const article = product.seller || product.marketplaceSku || product.wb || product.id || '—';
  const sku = product.marketplaceSku || product.wb || product.barcode || article;
  const stock = Number(product.stock || 0);
  const price = Number(product.salePrice || product.price || 0);
  const barcode = product.barcode || product.marketplaceSku || `TCP${String(product.id || '').replace(/\D/g, '').slice(0, 10)}`;
  const volume = product.volume || '1,20';
  const rating = product.rating || '0';
  const contentRating = product.contentRating || '86,5';
  const created = product.createdAt ? String(product.createdAt).slice(0, 10) : '—';
  const status = product.availability || (stock > 0 ? 'Продается' : 'Нет в наличии');
  const visibleStatus = translateVisibleText(status);
  const listStatus = getProductListStatus(product);
  const removedReason = translateVisibleText(product.removedReason || product.saleStopReason || product.deactivationReason || 'Причина не указана');
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
          <span>${escapeHtml(translateVisibleText(product.category || 'Без категории'))}</span>
          <small>${escapeHtml(translateVisibleText(product.brand || 'Бренд не указан'))}</small>
        </div>
      </div>
      <div class="product-article-cell">
        <strong>${escapeHtml(article)}</strong>
        <span>SKU ${escapeHtml(sku)}</span>
        <small>${uiText('Объединен')}</small>
      </div>
      <div class="product-status-cell">
        <span class="product-status-pill">${escapeHtml(visibleStatus)}</span>
        ${listStatus === 'removed' ? `<small class="removed-reason">${escapeHtml(removedReason)}</small>` : ''}
        <button class="product-add-label" type="button">${uiText('Добавить метку')}</button>
      </div>
      <div class="product-price-cell">
        <strong>${formatMoney(price)}</strong>
        <span>${uiText('Ваша цена')}</span>
      </div>
      <div class="product-stock-cell">
        <strong>${escapeHtml(stock)}</strong>
        <span>${escapeHtml(appBrand())}</span>
        <small>${escapeHtml(product.myStock || 1)} ${uiText('на складе')}</small>
      </div>
      <a class="product-link-cell" href="#">${escapeHtml(barcode)}</a>
      <div class="product-quality-cell">
        <span>${uiText('Отзывы:')} <strong>0</strong></span>
        <span>${uiText('Рейтинг:')} <strong>${escapeHtml(rating)}</strong></span>
        <span>${uiText('Контент:')} <strong>${escapeHtml(contentRating)}</strong></span>
      </div>
      <div class="product-date-cell">
        <strong>${escapeHtml(created)}</strong>
        <span>${escapeHtml(volume)} ${uiText('л')}</span>
      </div>
      <div class="row-actions">
        <button type="button" title="${uiText('Аналитика')}">▥</button>
        <button type="button" title="${uiText('Редактировать')}">✎</button>
        <button type="button" data-delete-product="${escapeHtml(product.id)}" title="${uiText('Удалить')}">⋮</button>
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
          <h2>${uiText('Добавление категории')}</h2>
          <button class="btn" type="button" id="closeCategoryModal">${uiText('Закрыть')}</button>
        </div>
        <div class="form-stack">
          <input id="categoryName" name="name" placeholder="${uiText('Название')}" required>
          <input id="categoryUrl" name="url" placeholder="URL">
          <label class="field compact">
            <span>${uiText('Родительская категория')}</span>
            <select id="categoryParent" name="parent">
              <option value="Без категории">${uiText('Без категории')}</option>
              ${parentOptions}
            </select>
          </label>
          <label class="field compact">
            <span>${uiText('ID категории в системе 1C')}</span>
            <input id="categoryOneCId" name="oneCId" value="0">
          </label>
          <label class="field compact">
            <span>${uiText('Порядок сортировки')}</span>
            <input id="categorySortOrder" name="sortOrder" type="number" value="1" min="1">
          </label>
          <p class="muted">( ${uiText('От меньшего к большему')} )</p>
          <label class="switch-row">
            <input id="categoryActive" name="active" type="checkbox">
            <span class="switch"></span>
            ${uiText('Активность категории')}
          </label>
          <label class="switch-row">
            <input id="categoryShowHome" name="showHome" type="checkbox">
            <span class="switch"></span>
            ${uiText('Показывать на главной')}
          </label>
          <label class="field compact">
            <span>${uiText('Изображение категории (главная)')}</span>
            <input id="categoryMainImage" name="mainImage" type="file" accept="image/*">
          </label>
          <div>
            <p class="muted"><strong>${uiText('Иконка (48x48px)')}</strong></p>
            <label class="dropzone" for="categoryIcon">
              <input id="categoryIcon" name="icon" type="file" accept="image/*">
              <strong>${uiText('Перетащите изображение сюда')}</strong>
              <span>${uiText('или')}</span>
              <span class="upload-link">${uiText('Нажмите, чтобы загрузить')}</span>
            </label>
          </div>
          <p class="error" id="categoryFormError"></p>
          <div class="row end">
            <button class="btn" type="button" id="cancelCategoryButton">${uiText('Отмена')}</button>
            <button class="btn primary" type="submit">${uiText('Сохранить категорию')}</button>
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
      showResult('Выберите товары для удаления.');
      return;
    }
    const response = await api('/api/catalog/products/delete', {
      method: 'POST',
      body: JSON.stringify({ ids })
    });
    catalogProducts = response.products;
    showResult(`Удалено товаров: ${ids.length}.`);
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
  { id: 'products', title: 'Buck up Product', subtitle: 'Удаленные товары' },
  { id: 'files', title: 'Buck up file', subtitle: 'Удаленные файлы' },
  { id: 'blogs', title: 'Buck up blog', subtitle: 'Удаленные блоки' },
  { id: 'free', title: 'Buck up free', subtitle: 'Все удаленные данные' }
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
        <strong>${escapeHtml(item.name || product.name || 'Удаленный элемент')}</strong>
        <span>${escapeHtml(item.category || product.category || 'Без категории')}</span>
      </div>
      <div class="backup-meta">
        <strong>${escapeHtml(item.article || product.seller || product.marketplaceSku || '—')}</strong>
        <span>${escapeHtml(product.barcode || product.wb || '')}</span>
      </div>
      <div class="backup-meta">
        <strong>${escapeHtml(item.deletedAt || '—')}</strong>
        <span>${item.archivedFiles ? 'Файлы сохранены' : 'Только данные'}</span>
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
        <p class="muted">Пока здесь нет удаленных данных. После удаления элементы будут сохраняться в этом разделе.</p>
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
          <p class="muted">Все удаленные данные сохраняются здесь, чтобы их можно было выбрать и вернуть обратно.</p>
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
            <input id="backupSearchInput" placeholder="Поиск по названию, артикулу или дате удаления">
          </label>
          <button class="btn soft" id="selectAllBackup" type="button">Выбрать все</button>
          <button class="btn primary" id="restoreBackupButton" type="button">Восстановить выбранное</button>
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
      result.textContent = 'Выберите элементы для восстановления.';
      result.classList.remove('hidden');
      return;
    }
    const productIds = selected
      .filter(input => input.dataset.backupType === 'product' || selectedBackupSection === 'products' || selectedBackupSection === 'free')
      .map(input => input.dataset.backupSelect);
    if (!productIds.length) {
      result.textContent = 'Для этого раздела восстановление будет подключено после появления удаленных файлов или блоков.';
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
    { name: 'Топы', parent: 'Одежда' },
    { name: 'Футболки', parent: 'Одежда' },
    { name: 'Платья', parent: 'Одежда' },
    { name: 'Бюстгальтеры', parent: 'Белье' },
    { name: 'Закрепители для гель-лака', parent: 'Красота' }
  ];
  return categories.map(category => ({
    id: String(category.id || category.name || ''),
    name: String(category.name || ''),
    parent: String(category.parent || 'Без категории'),
    parentId: String(category.parentId || ''),
    path: String(category.path || `${category.parent || 'Без категории'} / ${category.name || ''}`),
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
      <span class="category-arrow ${category.hasChildren ? '' : 'empty'} ${category.expanded ? 'open' : ''}" data-category-toggle="${escapeHtml(category.id)}">›</span>
      <span class="category-row-name">${escapeHtml(category.name)}</span>
    </button>
  `).join('');
}

function productCategoryModal() {
  if (!productManualCategoryOpen) return '';
  return `
    <div class="modal-backdrop product-category-backdrop" id="productCategoryModal">
      <section class="modal product-category-modal">
        <button class="modal-close" id="closeManualCategory" type="button">×</button>
        <h2>Выберите категорию и тип товара</h2>
        <div class="category-modal-tools">
          <div class="modal-search">
            <img src="/assets/icon-search.svg" alt="">
            <input id="manualCategorySearch" value="${escapeHtml(productManualCategoryQuery)}" placeholder="Название категории, товара или типа">
          </div>
          <select>
            <option>Искать везде</option>
            <option>Главные категории</option>
            <option>Подкатегории</option>
          </select>
        </div>
        <div class="manual-category-list modal-category-list" id="manualCategoryList">
          ${modalCategoryRowsHtml()}
        </div>
        <div class="category-modal-footer">
          <button class="btn primary" id="confirmProductCategory" type="button" ${productCategoryModalSelection ? '' : 'disabled'}>Подтвердить</button>
          <span>${productCategoryModalSelection ? escapeHtml(productCategoryModalSelection) : 'Категория не выбрана'}</span>
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
          <p class="eyebrow">Категория продавца</p>
          <h2>${escapeHtml(productDraftCategory)}</h2>
        </div>
        <span class="status draft">Качество карточки: 2</span>
      </div>
      <div class="selected-category-line">
        <strong>${escapeHtml(productDraftCategory)}</strong>
        <button class="btn" id="changeProductCategory" type="button">Изменить</button>
        <label class="switch-row compact"><input type="checkbox"><span class="switch"></span>18+</label>
      </div>
      <label class="field compact magic-field"><span>Артикул продавца</span><input><button type="button">AI</button></label>
      <div class="category-property-card">
        <label class="field compact">
          <span>Бренд</span>
          <input placeholder="Выбрать бренд">
        </label>
        <label class="field compact">
          <span>Цвет</span>
          <select>
            <option>Выбрать цвет</option>
            ${colors.map(color => `<option>${escapeHtml(color.name)}</option>`).join('')}
          </select>
        </label>
        <label class="field compact">
          <span>Материал</span>
          <select>
            <option>Выбрать материал</option>
            ${(catalogMaterials || []).map(material => `<option>${escapeHtml(material)}</option>`).join('')}
          </select>
        </label>
        <label class="field compact">
          <span>Размер</span>
          <input placeholder="Например: 75-B, M, 42">
        </label>
      </div>
      <div class="marking-box">
        <h3>ТНВЭД</h3>
        <button class="btn" type="button">Выбрать</button>
        <label class="switch-row"><input type="checkbox" checked><span class="switch"></span>Нужна маркировка КИЗ</label>
        <label class="switch-row"><input type="checkbox"><span class="switch"></span>Подтверждаю, что на товар нанесена необходимая маркировка</label>
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
          <span class="main-badge">Главная</span>
        ` : `
          <span class="upload-ghost">+</span>
          <strong>Фото и видео</strong>
          <small>Перетащите сюда или выберите файл</small>
        `}
      </label>
      <div class="media-thumb-grid">
        ${thumbnails.map((file, index) => `
          <div class="media-thumb ${index === 0 ? 'active' : ''}" role="button" tabindex="0" draggable="true" data-media-index="${index}" title="Перетащите на другое фото, чтобы поменять местами.">
            ${file.kind === 'video'
              ? `<video src="${file.preview}" muted playsinline></video><span class="play-dot">▶</span>`
              : `<img src="${file.preview}" alt="">`
            }
            <span class="thumb-order">${index + 1}</span>
            ${index === 0 ? '<span class="thumb-main-dot">Главная</span>' : `<button class="thumb-main-action" type="button" data-set-main-media="${index}">Главная</button>`}
            <span class="thumb-drag-dot">⇄</span>
          </div>
        `).join('')}
        <label class="media-add-tile">
          <input id="productMediaAddInput" type="file" accept="image/*,video/*" multiple>
          <span>+</span>
          <strong>Добавить</strong>
        </label>
      </div>
      <div class="media-upload-status" id="productMediaStatus">
        ${productDraftMedia.length ? `Фото: ${images.length}, видео: ${videos.length}` : 'Фото и видео пока не выбраны'}
      </div>
    </div>
  `;
}

function productEditorPanel() {
  const editorContent = `
      <section class="product-builder">
        <aside class="variant-sidebar">
          <div class="section-head">
            <h2>Варианты товара</h2>
            <span class="status draft">1 / 30</span>
          </div>
          <div class="variant-card">
            <div class="variant-image"><span>□</span></div>
            <div>
              <strong>Новая карточка</strong>
              <span class="muted">Фото и название появятся после заполнения</span>
            </div>
          </div>
        </aside>
        <div class="builder-main">
          <div class="builder-notice">
            <span class="info-dot">i</span>
            Создайте карточку товара: медиа, категория, описание и торговые параметры
          </div>
          <div class="builder-card">
            <div class="media-column">
              ${productMediaGalleryHtml()}
              <div class="media-tools">
                <button class="builder-soft" type="button">Редактор фото</button>
                <button class="builder-soft" type="button">Фотостудия</button>
                <button class="builder-muted" type="button">Видеообложка</button>
              </div>
              <div class="link-loader">
                <span class="muted">Добавить медиа по ссылке</span>
                <div>
                  <input placeholder="https://">
                  <button type="button">→</button>
                </div>
              </div>
            </div>
            <div class="main-info-column">
              <div class="creation-steps">
                <span class="active"><b>1</b>Информация о товаре</span>
                <span><b>2</b>Предварительный просмотр</span>
              </div>
              <div class="section-head product-simple-head">
                <h2>Основная информация</h2>
                <span class="status draft">Готовность: 0%</span>
              </div>
              <div class="product-simple-form">
                <label class="simple-field product-name-field">
                  <input id="newProductName" value="${escapeHtml(productDraftName)}" autocomplete="off" placeholder="Название">
                </label>
                <div class="simple-field product-category-field">
                  <button class="simple-select" type="button" id="openProductCategory">
                    <span>${productDraftCategory ? escapeHtml(productDraftCategory) : 'Категория и тип *'}</span>
                    <b>›</b>
                  </button>
                </div>
                <label class="simple-field with-note">
                  <input id="newProductBarcode" placeholder="Штрихкод">
                  <small>Штрихкод нужен для компенсации при утере</small>
                </label>
                <label class="simple-field">
                  <input id="newProductArticle" value="${escapeHtml(productGeneratedArticle || generateMarketplaceArticle())}" placeholder="Артикул *">
                </label>
                <div class="simple-grid two">
                  <label class="simple-field">
                    <input id="newProductSalePrice" type="number" min="0" value="0" placeholder="Ваша цена, ₽ *">
                  </label>
                  <label class="simple-field">
                    <input id="newProductPurchasePrice" type="number" min="0" value="0" placeholder="Цена до скидки, ₽">
                  </label>
                </div>
                <label class="simple-field">
                  <select id="newProductVat">
                    <option>НДС *</option>
                    <option>Без НДС</option>
                    <option>0%</option>
                    <option>10%</option>
                    <option>20%</option>
                  </select>
                </label>
                <div class="simple-section-title">Габариты и вес</div>
                <label class="simple-field">
                  <input id="newProductLength" type="number" min="0" placeholder="Длина упаковки, мм *">
                </label>
                <label class="simple-field">
                  <input id="newProductWidth" type="number" min="0" placeholder="Ширина упаковки, мм *">
                </label>
                <label class="simple-field">
                  <input id="newProductHeight" type="number" min="0" placeholder="Высота упаковки, мм *">
                </label>
                <label class="simple-field">
                  <input id="newProductWeight" type="number" min="0" placeholder="Вес с упаковкой, г *">
                </label>
                <div class="simple-grid three">
                  <label class="simple-field">
                    <input id="newProductStock" type="number" min="0" value="0" placeholder="Остаток">
                  </label>
                  <label class="simple-field">
                    <input id="newProductBrand" list="brandOptions" placeholder="Бренд">
                  </label>
                  <label class="simple-field">
                    <input id="newProductManufacturer" placeholder="Производитель">
                  </label>
                </div>
                <datalist id="brandOptions">
                  ${(catalogBrands || []).map(brand => `<option value="${escapeHtml(brand.name || brand)}"></option>`).join('')}
                </datalist>
                <input id="newProductAssortment" type="hidden" value="">
                <input id="newProductSellerArticle" type="hidden" value="">
                <input id="newProductSeason" type="hidden" value="Всесезонный">
                <select id="newProductAvailability" class="hidden">
                  <option>Доступны к продаже</option>
                  <option>В продаже</option>
                  <option>Нет в наличии</option>
                  <option>В ошибке</option>
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
          <p class="muted">Панель управления / Товары / Добавление товара</p>
          <h1>Добавление товара</h1>
        </div>
        <div class="row">
          <button class="btn danger-outline" id="cancelProductEditor" type="button">Отменить</button>
          <button class="btn primary" id="saveProductEditor" type="button">Добавить товар</button>
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
          mediaStatus.textContent = `Выбрано: фото ${images}, видео ${videos}`;
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
        mediaStatus.textContent = `Выбрано: фото ${images}, видео ${videos}`;
      }
      renderCatalog();
    });
}

function buildCategoryParentOptions(categories) {
  const sorted = [...categories].sort(compareCategories);
  const childrenByParent = new Map();

  sorted.forEach(category => {
    const parent = category.parent || 'Без категории';
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

  return renderBranch('Без категории', 0);
}

function buildCategoryPathRows(categories) {
  const sorted = [...categories].sort(compareCategories);
  const byParent = new Map();
  const knownIds = new Set(sorted.map(category => category.id).filter(Boolean));

  sorted.forEach(category => {
    const parent = category.parentId || category.parent || 'Без категории';
    if (!byParent.has(parent)) byParent.set(parent, []);
    byParent.get(parent).push(category);
  });

  const roots = sorted.filter(category => {
    const parent = category.parentId || category.parent || 'Без категории';
    return parent === 'Без категории' || !knownIds.has(parent);
  });

  const byId = new Map(sorted.map(category => [String(category.id || category.name), category]));
  categoryDrillPath = categoryDrillPath.filter(id => byId.has(String(id)));
  localStorage.setItem('thechamp_category_drill_path', JSON.stringify(categoryDrillPath));

  const levels = [{ title: `${translateVisibleText('Уровень')} 1`, parent: translateVisibleText('Главные категории'), items: roots, selectedId: categoryDrillPath[0] }];
  categoryDrillPath.forEach((id, index) => {
    const category = byId.get(String(id));
    const children = byParent.get(category?.id || category?.name) || [];
    if (category && children.length) {
      levels.push({
        title: `${translateVisibleText('Уровень')} ${index + 2}`,
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
        <strong>${uiText('Категорий:')} ${sorted.length}</strong>
        <span>${selectedNames.length ? selectedNames.join(' / ') : uiText('Выберите главную категорию')}</span>
      </div>
      <button class="btn" type="button" id="resetCategoryDrill">${uiText('Сбросить')}</button>
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
                  <small>${childCount ? `${childCount} ${uiText('подкатегорий')}` : uiText('конечная категория')}</small>
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
    pendingCategoryParent = parent || 'Без категории';
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
    <p class="eyebrow">Технический мониторинг</p>
    <h1>Логи API</h1>
    <section class="panel">
      <div class="event-list">${dashboardData.apiEvents.map(eventCard).join('')}</div>
    </section>
  `);
}

function renderUsers() {
  layout(`
    <p class="eyebrow">Безопасность</p>
    <h1>Центр ролей и прав доступа</h1>
    <section class="grid modules">
      <div class="card"><h3>Владелец</h3><p class="muted">Все магазины, API-ключи, финансы и управление пользователями.</p><span class="chip">1 пользователь</span></div>
      <div class="card"><h3>Операции</h3><p class="muted">Заказы, склад, маркировка и процессы доставки.</p><span class="chip">5 пользователей</span></div>
      <div class="card"><h3>Финансы</h3><p class="muted">Отчет по прибыли, денежный поток, расходы и согласование цен.</p><span class="chip">3 пользователя</span></div>
      <div class="card"><h3>Контент товаров</h3><p class="muted">PIM-карточки, описания, изображения Рё сопоставление категорий.</p><span class="chip">3 пользователя</span></div>
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
