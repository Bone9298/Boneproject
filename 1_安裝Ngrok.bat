@echo off
chcp 65001 >nul
echo ============================================================
echo Ngrok 安裝與測試指南
echo ============================================================
echo.

echo [步驟 1] 下載 Ngrok
echo.
echo 1. 訪問：https://ngrok.com/download
echo 2. 下載 Windows 版本
echo 3. 解壓縮到：C:\ngrok
echo.
pause

echo.
echo [步驟 2] 添加到系統路徑
echo.
echo 執行以下命令（以管理員身份運行 PowerShell）：
echo.
echo [System.Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\ngrok", "Machine")
echo.
echo 或手動添加：
echo   1. 搜尋「環境變數」
echo   2. 編輯「系統變數」中的 Path
echo   3. 新增：C:\ngrok
echo.
pause

echo.
echo [步驟 3] 驗證安裝
echo.
ngrok version
if errorlevel 1 (
    echo [錯誤] Ngrok 未安裝或未添加到 PATH
    echo 請完成步驟 1 和 2
    pause
    exit /b 1
)

echo.
echo [步驟 4] 設置認證 Token
echo.
ngrok config add-authtoken 38pxx6Tt3hOSw2Aqi47Q8GUyQOy_2QPt9Ep6nUTJ5YTBb9qy

echo.
echo ============================================================
echo ✅ Ngrok 設置完成！
echo ============================================================
echo.
echo 下一步：
echo   1. 執行「啟動系統.bat」啟動本地服務
echo   2. 執行「啟動Ngrok分享.bat」啟動 ngrok 隧道
echo.
pause
