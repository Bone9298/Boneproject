@echo off
chcp 65001 >nul
echo ============================================================
echo 完整測試流程
echo ============================================================
echo.

echo [測試 1/5] 檢查本地服務
echo.
echo 請確認以下服務正在運行：
echo   - MariaDB (Windows 服務)
echo   - 後端 API (port 5000)
echo   - 前端服務 (port 8000)
echo.
echo 如果沒有運行，請先執行「啟動系統.bat」
echo.
pause

echo.
echo [測試 2/5] 測試本地訪問
echo.
echo 正在開啟瀏覽器測試...
start http://localhost:8000
timeout /t 3
echo.
echo ✓ 能看到商品管理系統嗎？ (Y/N)
set /p local_ok=
if /i not "%local_ok%"=="Y" (
    echo [錯誤] 本地訪問失敗，請檢查服務是否正常運行
    pause
    exit /b 1
)

echo.
echo [測試 3/5] 啟動 Ngrok
echo.
echo 即將啟動 Ngrok，會開啟兩個新視窗
pause
start "Ngrok - 前端" cmd /k "ngrok http 8000"
timeout /t 2
start "Ngrok - API" cmd /k "ngrok http 5000"

echo.
echo [測試 4/5] 獲取公開網址
echo.
echo 請在「Ngrok - 前端」視窗中找到網址
echo 範例：https://abc123.ngrok-free.app
echo.
echo 請輸入前端的 ngrok 網址：
set /p frontend_url=
echo.
echo 請輸入 API 的 ngrok 網址：
set /p api_url=

echo.
echo [測試 5/5] 測試外部訪問
echo.
echo 正在開啟公開網址...
start %frontend_url%
echo.
echo ✓ 能看到商品管理系統嗎？ (Y/N)
set /p public_ok=

echo.
echo ============================================================
if /i "%public_ok%"=="Y" (
    echo ✅ 測試成功！
    echo.
    echo 📋 公開網址：
    echo    前端：%frontend_url%
    echo    API：%api_url%
    echo.
    echo 📱 Chrome 擴充功能配置：
    echo    請編輯 extension\popup.html
    echo    將 API_BASE_URL 改為：%api_url%/api
    echo.
    echo 🎉 現在可以分享給朋友了！
) else (
    echo ❌ 測試失敗
    echo.
    echo 請檢查：
    echo   1. Ngrok 是否正常運行？
    echo   2. 網址是否正確？
    echo   3. 防火牆是否阻擋？
)
echo ============================================================
echo.
pause
