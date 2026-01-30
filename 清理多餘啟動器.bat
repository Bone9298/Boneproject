@echo off
chcp 65001 >nul
echo ============================================================
echo 清理多餘的啟動器
echo ============================================================
echo.
echo 已有「🚀 啟動主選單.bat」整合所有功能
echo 以下啟動器可以刪除：
echo.
echo [多餘的啟動器]
echo   - 啟動.bat (功能已整合到主選單)
echo   - 啟動服務器.py (已包含在啟動系統.bat中)
echo.
echo [保留的腳本] - 這些是主選單需要調用的
echo   ✅ 啟動系統.bat
echo   ✅ 啟動Docker.bat
echo   ✅ 1_安裝Ngrok.bat
echo   ✅ 2_測試Ngrok.bat
echo   ✅ 啟動Ngrok分享.bat
echo   ✅ 配置擴充功能Ngrok.bat
echo   ✅ 恢復本地配置.bat
echo   ✅ 匯入資料到Docker.bat
echo   ✅ 匯入資料庫.bat
echo   ✅ 停止Docker.bat
echo.
echo ============================================================
pause
echo.
echo 開始清理...
echo.

del /q "啟動.bat" 2>nul
if exist "啟動.bat" (
    echo ❌ 無法刪除 啟動.bat
) else (
    echo ✅ 已刪除 啟動.bat
)

del /q "啟動服務器.py" 2>nul
if exist "啟動服務器.py" (
    echo ❌ 無法刪除 啟動服務器.py
) else (
    echo ✅ 已刪除 啟動服務器.py
)

echo.
echo ============================================================
echo 清理完成！
echo ============================================================
echo.
echo 💡 從現在開始，只要使用「🚀 啟動主選單.bat」即可
echo.
pause
