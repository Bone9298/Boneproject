@echo off
chcp 65001 >nul
title 匯出資料庫到 init_db.sql

echo ============================================================
echo 匯出 Docker 資料庫到 init_db.sql
echo ============================================================
echo.

echo 🔍 檢查 Docker 容器狀態...
docker compose ps
echo.

echo 📦 匯出資料庫結構和資料...
echo.

REM 匯出完整資料庫（結構 + 資料）
docker compose exec -T db mysqldump -u fb_user -p9298 --databases fb_products --add-drop-database --add-drop-table --routines --triggers --events > backend\init_db_backup.sql

if %ERRORLEVEL% EQU 0 (
    echo ✅ 匯出成功！
    echo.
    echo 檔案位置: backend\init_db_backup.sql
    echo.
    echo ============================================================
    echo 下一步選擇：
    echo ============================================================
    echo.
    echo 1. 保留原始 init_db.sql（只有結構）
    echo    + 新增 init_db_backup.sql（結構+資料）
    echo.
    echo 2. 覆蓋 init_db.sql 為完整備份
    echo.
    set /p choice=請選擇 (1 或 2): 
    
    if "!choice!"=="2" (
        copy backend\init_db_backup.sql backend\init_db.sql
        echo.
        echo ✅ 已覆蓋 init_db.sql
    ) else (
        echo.
        echo ✅ 保留兩個檔案：
        echo    - init_db.sql ^(只有結構^)
        echo    - init_db_backup.sql ^(結構+資料^)
    )
) else (
    echo.
    echo ❌ 匯出失敗！
    echo.
    echo 可能原因：
    echo 1. Docker 未啟動
    echo 2. 資料庫容器未運行
    echo.
    echo 請執行 "啟動Docker.bat" 後再試
)

echo.
echo ============================================================
pause
