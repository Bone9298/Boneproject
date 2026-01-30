@echo off
chcp 65001 >nul
echo ============================================================
echo 匯入資料到 Docker 容器
echo ============================================================
echo.

echo [步驟 1/3] 從本地 MariaDB 匯出資料...
"C:\Program Files\MariaDB 12.1\bin\mysqldump.exe" -u root -pbgx9298 fb_products > docker_backup.sql

if errorlevel 1 (
    echo [錯誤] 匯出失敗！
    pause
    exit /b 1
)

echo [成功] 資料已匯出到 docker_backup.sql
echo.

echo [步驟 2/3] 匯入資料到 Docker 容器...
type docker_backup.sql | docker compose exec -T db mysql -u fb_user -p9298 fb_products

if errorlevel 1 (
    echo [錯誤] 匯入失敗！
    pause
    exit /b 1
)

echo [成功] 資料已匯入到 Docker
echo.

echo [步驟 3/3] 驗證資料...
docker compose exec db mysql -u fb_user -p9298 -e "USE fb_products; SELECT COUNT(*) AS total_products FROM products;"

echo.
echo ============================================================
echo 匯入完成！
echo ============================================================
echo.
echo 現在可以訪問 http://localhost 查看您的商品
echo.
pause
