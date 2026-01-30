@echo off
chcp 65001 >nul
echo ============================================================
echo 啟動 Ngrok 分享服務
echo ============================================================
echo.

echo [步驟 1/3] 設置 Ngrok 認證...
ngrok config add-authtoken 38pxx6Tt3hOSw2Aqi47Q8GUyQOy_2QPt9Ep6nUTJ5YTBb9qy

echo.
echo [步驟 2/3] 啟動本地服務...
echo 請確保您已經執行了 "啟動系統.bat" 啟動後端和前端
echo.
timeout /t 3

echo.
echo [步驟 3/3] 啟動 Ngrok 隧道...
echo.
echo 正在啟動...
echo   - 前端 (port 8000)
echo   - API (port 5000)
echo.
echo ============================================================
echo Ngrok 已啟動！
echo ============================================================
echo.
echo 🌐 請在新開的 Ngrok 視窗中查看公開網址
echo.
echo 📝 使用說明：
echo   1. 找到 "Forwarding" 欄位
echo   2. 複製 8000 的網址給朋友（前端）
echo   3. 告訴朋友這是您的管理系統網址
echo.
echo ⚠️  注意：
echo   - 保持此視窗開啟，關閉後網址將失效
echo   - 免費版每次重啟網址會改變
echo   - API 會自動被前端調用
echo.
pause

REM 啟動兩個 ngrok 隧道
start "Ngrok - 前端 Port 8000" ngrok http 8000
timeout /t 2
start "Ngrok - API Port 5000" ngrok http 5000

echo.
echo ✅ Ngrok 隧道已啟動！
echo.
pause
