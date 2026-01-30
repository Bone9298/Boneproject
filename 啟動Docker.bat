@echo off
chcp 65001 >nul
echo ============================================================
echo FB 現貨出清機器人 - Docker 版本
echo ============================================================
echo.

echo [檢查] 檢查 Docker Desktop 是否運行...
docker info >nul 2>&1
if errorlevel 1 (
    echo [錯誤] Docker Desktop 未運行！
    echo.
    echo 請先開啟 Docker Desktop，然後重試。
    echo.
    pause
    exit /b 1
)

echo [成功] Docker 正在運行
echo.

echo [啟動] 啟動所有服務...
docker compose up -d

if errorlevel 1 (
    echo [錯誤] 啟動失敗！
    pause
    exit /b 1
)

echo.
echo [等待] 等待服務啟動...
timeout /t 5 /nobreak >nul

echo.
echo ============================================================
echo 系統已成功啟動！
echo ============================================================
echo.
echo 📦 運行中的服務：
docker compose ps
echo.
echo ============================================================
echo 🌐 訪問地址：
echo    前端: http://localhost
echo    API: http://localhost/api/products
echo ============================================================
echo.
echo 💡 提示：
echo    - 查看日誌: docker compose logs -f
echo    - 停止服務: docker compose down
echo    - 重啟服務: docker compose restart
echo.
echo 🚀 正在開啟瀏覽器...
start http://localhost
echo.
pause
