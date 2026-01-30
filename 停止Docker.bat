@echo off
chcp 65001 >nul
echo ============================================================
echo 停止 Docker 服務
echo ============================================================
echo.

docker compose down

echo.
echo [完成] 所有服務已停止
echo.
pause
