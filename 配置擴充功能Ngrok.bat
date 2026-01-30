@echo off
chcp 65001 >nul
echo ============================================================
echo 配置 Chrome 擴充功能使用 Ngrok
echo ============================================================
echo.

echo 請輸入您的 Ngrok API 網址
echo 範例：https://xyz789.ngrok-free.app
echo.
set /p ngrok_url=Ngrok API 網址: 

echo.
echo 正在備份原始檔案...
copy "extension\popup.html" "extension\popup.html.local_backup" >nul

echo.
echo 正在更新 API 網址...

REM 使用 PowerShell 進行替換
powershell -Command "(Get-Content 'extension\popup.html') -replace 'http://localhost:5000/api', '%ngrok_url%/api' | Set-Content 'extension\popup.html'"

echo.
echo ============================================================
echo ✅ 配置完成！
echo ============================================================
echo.
echo 📝 已將 API 網址更新為：%ngrok_url%/api
echo 📦 原始檔案已備份為：popup.html.local_backup
echo.
echo 下一步：
echo   1. 打開 Chrome
echo   2. 訪問 chrome://extensions/
echo   3. 找到擴充功能並點擊「重新載入」
echo   4. 測試抓取商品功能
echo.
echo 💡 提示：
echo   要恢復本地模式，執行「恢復本地配置.bat」
echo.
pause
