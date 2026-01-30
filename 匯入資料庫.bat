@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 開始匯入 FB 商品資料庫
echo ========================================
echo.

REM 列出所有可用的 .sql 備份檔案
echo 📂 可用的備份檔案:
echo.
dir /b *.sql 2>nul
if %errorlevel% neq 0 (
    echo ❌ 找不到任何 .sql 備份檔案！
    echo.
    echo 請確認:
    echo 1. 已將匯出的 .sql 檔案複製到此資料夾
    echo 2. 檔案副檔名為 .sql
    echo ========================================
    pause
    exit /b 1
)

echo.
echo ========================================
set /p sqlfile="請輸入要匯入的 SQL 檔案名稱: "

if not exist "%sqlfile%" (
    echo.
    echo ❌ 找不到檔案: %sqlfile%
    echo ========================================
    pause
    exit /b 1
)

echo.
echo ⚠️  警告: 此操作將會覆蓋現有的資料庫內容！
set /p confirm="確定要繼續嗎? (輸入 YES 確認): "

if not "%confirm%"=="YES" (
    echo.
    echo ❌ 操作已取消
    echo ========================================
    pause
    exit /b 0
)

echo.
echo 📥 正在匯入資料...
echo.

REM 使用 mysql 匯入資料庫
"C:\Program Files\MariaDB 12.1\bin\mysql.exe" -u fb_user -p9298 fb_products < %sqlfile%

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 資料庫匯入成功！
    echo ========================================
    echo 📄 匯入檔案: %sqlfile%
    echo.
    echo 💡 您現在可以啟動應用程式使用了
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ❌ 匯入失敗！
    echo ========================================
    echo 請檢查:
    echo 1. MariaDB 服務是否正在運行
    echo 2. 帳號密碼是否正確 (fb_user/9298)
    echo 3. 資料庫 fb_products 是否已建立
    echo 4. SQL 檔案格式是否正確
    echo ========================================
)

echo.
pause
