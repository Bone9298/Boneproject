@echo off
chcp 65001 >nul
echo ============================================================
echo 配置 Chrome 擴充功能 API 網址
echo ============================================================
echo.
echo 請選擇您的運行模式：
echo.
echo   1. 本地模式 (http://localhost:5000)
echo   2. Docker 模式 (http://localhost)
echo.
set /p mode=請選擇 (1 或 2): 

if "%mode%"=="1" (
    set api_url=http://localhost:5000
    echo.
    echo ✅ 已設定為本地模式
) else if "%mode%"=="2" (
    set api_url=http://localhost
    echo.
    echo ✅ 已設定為 Docker 模式
) else (
    echo.
    echo ❌ 無效選擇
    pause
    exit /b 1
)

echo.
echo API 網址：%api_url%
echo.
echo ============================================================
echo 請手動設置擴充功能：
echo ============================================================
echo.
echo 1. 開啟 Chrome 擴充功能頁面
echo    chrome://extensions/
echo.
echo 2. 找到「FB 批量留言助手」
echo.
echo 3. 點擊「擴充功能選項」
echo.
echo 4. 將 API URL 設定為：
echo    %api_url%
echo.
echo 5. 點擊「儲存設定」
echo.
echo 6. 重新載入擴充功能
echo.
echo ============================================================
echo.
echo 💡 提示：設定完成後，請重新打開擴充功能測試
echo.
pause
