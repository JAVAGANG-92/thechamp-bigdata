# The Champ BigData

Административная панель The Champ для каталога, товаров, справочников, BuckUp и будущих seller/API-интеграций.

## Быстрый запуск

Windows:

```powershell
D:\thechamp\THECHAMP_SERVER_START.bat
```

Ручной запуск из папки проекта:

```powershell
python py_server.py
```

Адрес панели:

```text
http://localhost:4173
```

## Настройки окружения

Скопируйте:

```text
.env.example -> .env
```

Главные параметры:

```text
THECHAMP_PORT=4173
THECHAMP_DATA_ROOT=D:\thechamp-data
DATABASE_URL=postgresql://thechamp:change_me@127.0.0.1:5432/thechamp
PUBLIC_BASE_URL=http://localhost:4173
```

`THECHAMP_DATA_ROOT` нужен, чтобы отделить код от рабочих данных: товаров, фото, видео и BuckUp.

## Структура

- `public/` - интерфейс панели.
- `katalog/` - локальная файловая база каталога и справочников.
- `BuckUp/` - удаленные данные для восстановления.
- `database/` - PostgreSQL schema и план миграции.
- `docs/` - deploy и операционные инструкции.
- `tools/` - служебные скрипты.
- `py_server.py` - основной локальный сервер.
- `server.js` - резервный Node.js сервер.

## Проверка здоровья

```powershell
.\scripts\healthcheck.ps1 -BaseUrl http://127.0.0.1:4173
```

## Подготовка к online server

Подробный план:

```text
docs/DEPLOYMENT.md
```

Операционные правила:

```text
docs/OPERATIONS.md
```
