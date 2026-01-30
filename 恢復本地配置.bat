@echo off
chcp 65001 >nul
echo ============================================================
echo 恢復本地配置
echo ============================================================
echo.

if exist "extension\popup.html.local_backup" (
    echo 正在恢復本地配置...
    copy /Y "extension\popup.html.local_backup" "extension\popup.html" >nul
    echo.
    echo ✅ 已恢復為本地模式 (localhost:5000)
    echo.
    echo 請在 Chrome 中重新載入擴充功能
) else (
    echo ❌ 找不到備份檔案
    echo.
    echo 請手動編輯 extension\popup.html
    echo 將 API_BASE_URL 改回：http://localhost:5000/api
)

echo.
pause
