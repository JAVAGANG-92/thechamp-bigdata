@echo off
set "APP_DIR=D:\thechamp"
set "APP_URL=http://localhost:4173"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$port = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue; " ^
  "if (-not $port) { " ^
  "  $py = (Get-Command py -ErrorAction SilentlyContinue); " ^
  "  if ($py) { Start-Process -FilePath $py.Source -ArgumentList '-3 py_server.py' -WorkingDirectory '%APP_DIR%' -WindowStyle Minimized } " ^
  "  else { Start-Process -FilePath 'python' -ArgumentList 'py_server.py' -WorkingDirectory '%APP_DIR%' -WindowStyle Minimized }; " ^
  "  Start-Sleep -Seconds 2 " ^
  "}; " ^
  "Start-Process '%APP_URL%'"

exit /b
