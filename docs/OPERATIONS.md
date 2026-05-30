# The Champ operations checklist

## Daily checks

Run:

```powershell
.\scripts\healthcheck.ps1 -BaseUrl http://127.0.0.1:4173
```

Expected:

- frontend returns `200`
- dashboard API returns `200`
- products API returns `200`
- categories API returns `200`
- backup API returns `200`

## Before every deployment

1. Run syntax checks.
2. Run datastore audit.
3. Confirm live data root.
4. Backup `THECHAMP_DATA_ROOT`.
5. Deploy code.
6. Restart server.
7. Run health check again.

## Current live data warning

The current live data source is:

```text
D:\thechamp
```

The workspace copy is:

```text
C:\Users\Crypt\Documents\TheChamp
```

Do not migrate from the workspace copy until live data is copied or `THECHAMP_DATA_ROOT` is configured.
