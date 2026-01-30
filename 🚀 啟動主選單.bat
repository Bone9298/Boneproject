@echo off
chcp 65001 >nul
title FB 現貨出清機器人 - 主選單

:MENU
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║          FB 現貨出清機器人 - 主啟動選單                   ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo  【主要功能】
echo.
echo   1. 🚀 啟動本地系統 (推薦日常使用)
echo      └─ 使用本地 MariaDB + Python + HTTP Server
echo.
echo   2. 🐳 啟動 Docker 系統 (測試/部署用)
echo      └─ 使用 Docker 容器運行完整系統
echo.
echo   3. 🌐 Ngrok 分享設置 (分享給朋友)
echo      └─ 設置公開網址，讓朋友訪問
echo.
echo  【工具選單】
echo.
echo   4. 🛠️  資料管理工具
echo   5. ⚙️  系統配置工具
echo   6. 📖 查看使用說明
echo.
echo   0. ❌ 退出
echo.
echo ════════════════════════════════════════════════════════════
echo.
set /p choice=請選擇功能 (0-6): 

if "%choice%"=="1" goto LOCAL
if "%choice%"=="2" goto DOCKER
if "%choice%"=="3" goto NGROK
if "%choice%"=="4" goto TOOLS
if "%choice%"=="5" goto CONFIG
if "%choice%"=="6" goto DOCS
if "%choice%"=="0" exit
goto MENU

:LOCAL
cls
echo.
echo ════════════════════════════════════════════════════════════
echo  啟動本地系統
echo ════════════════════════════════════════════════════════════
echo.
echo 正在啟動本地系統...
echo.
call "啟動系統.bat"
pause
goto MENU

:DOCKER
cls
echo.
echo ════════════════════════════════════════════════════════════
echo  啟動 Docker 系統
echo ════════════════════════════════════════════════════════════
echo.
echo 正在啟動 Docker...
echo.
call "啟動Docker.bat"
pause
goto MENU

:NGROK
cls
echo.
echo ════════════════════════════════════════════════════════════
echo  Ngrok 分享設置
echo ════════════════════════════════════════════════════════════
echo.
echo  1. 安裝 Ngrok (首次使用)
echo  2. 測試 Ngrok 分享
echo  3. 啟動 Ngrok 分享
echo  4. 配置擴充功能
echo  5. 恢復本地配置
echo  0. 返回主選單
echo.
set /p ngrok_choice=請選擇 (0-5): 

if "%ngrok_choice%"=="1" (
    call "1_安裝Ngrok.bat"
    pause
    goto NGROK
)
if "%ngrok_choice%"=="2" (
    call "2_測試Ngrok.bat"
    pause
    goto NGROK
)
if "%ngrok_choice%"=="3" (
    call "啟動Ngrok分享.bat"
    pause
    goto NGROK
)
if "%ngrok_choice%"=="4" (
    call "配置擴充功能Ngrok.bat"
    pause
    goto NGROK
)
if "%ngrok_choice%"=="5" (
    call "恢復本地配置.bat"
    pause
    goto NGROK
)
if "%ngrok_choice%"=="0" goto MENU
goto NGROK

:TOOLS
cls
echo.
echo ════════════════════════════════════════════════════════════
echo  資料管理工具
echo ════════════════════════════════════════════════════════════
echo.
echo  1. 匯入資料到 Docker
echo  2. 匯入資料庫 (本地)
echo  3. 停止 Docker 服務
echo  0. 返回主選單
echo.
set /p tool_choice=請選擇 (0-3): 

if "%tool_choice%"=="1" (
    call "匯入資料到Docker.bat"
    pause
    goto TOOLS
)
if "%tool_choice%"=="2" (
    call "匯入資料庫.bat"
    pause
    goto TOOLS
)
if "%tool_choice%"=="3" (
    call "停止Docker.bat"
    pause
    goto TOOLS
)
if "%tool_choice%"=="0" goto MENU
goto TOOLS

:CONFIG
cls
echo.
echo ════════════════════════════════════════════════════════════
echo  系統配置工具
echo ════════════════════════════════════════════════════════════
echo.
echo  1. 配置擴充功能使用 Ngrok
echo  2. 恢復擴充功能本地配置
echo  0. 返回主選單
echo.
set /p config_choice=請選擇 (0-2): 

if "%config_choice%"=="1" (
    call "配置擴充功能Ngrok.bat"
    pause
    goto CONFIG
)
if "%config_choice%"=="2" (
    call "恢復本地配置.bat"
    pause
    goto CONFIG
)
if "%config_choice%"=="0" goto MENU
goto CONFIG

:DOCS
cls
echo.
echo ════════════════════════════════════════════════════════════
echo  使用說明文檔
echo ════════════════════════════════════════════════════════════
echo.
echo  📖 可用文檔：
echo.
echo     - README.md (系統說明)
echo     - Docker使用說明.md
echo     - Ngrok使用說明.md
echo     - 擴充功能Ngrok配置.md
echo     - DEPLOYMENT.md (伺服器部署)
echo.
echo  💡 提示：這些文檔在專案資料夾中，可直接開啟查看
echo.
pause
goto MENU
