#!/bin/bash

# 臉書現貨機器人 - 伺服器部署腳本（Linux/Mac）

# 設定伺服器資訊（請修改）
SERVER_USER="your_username"
SERVER_IP="your_server_ip"
SERVER_PATH="/home/user/fb-bot"

echo "================================================"
echo "  臉書現貨機器人 - 伺服器部署工具"
echo "================================================"
echo ""
echo "📋 當前設定:"
echo "   伺服器: $SERVER_USER@$SERVER_IP"
echo "   路徑:   $SERVER_PATH"
echo ""
echo "⚠️  請確認以上資訊正確！"
echo "   如需修改，請編輯此檔案的「設定伺服器資訊」部分"
echo ""
read -p "按 Enter 繼續..."

while true; do
    clear
    echo "================================================"
    echo "  選擇部署方式"
    echo "================================================"
    echo ""
    echo "  [1] 完全重建（清空舊資料，載入最新資料）"
    echo "  [2] 只更新程式碼（保留資料庫）"
    echo "  [3] 只更新資料庫結構（添加 publish_order）"
    echo "  [4] 手動上傳檔案（使用 SCP）"
    echo "  [5] 查看伺服器狀態"
    echo "  [0] 退出"
    echo ""
    read -p "請選擇 (0-5): " choice

    case $choice in
        1)
            echo ""
            echo "🚀 開始完全重建部署..."
            echo ""
            echo "步驟 1: 上傳檔案到伺服器"
            rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '__pycache__' \
                ./ $SERVER_USER@$SERVER_IP:$SERVER_PATH/

            echo ""
            echo "步驟 2: 在伺服器上重建容器"
            ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker compose down -v && docker compose up -d"

            echo ""
            echo "步驟 3: 檢查容器狀態"
            ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker compose ps"

            echo ""
            echo "✅ 完全重建完成！"
            read -p "按 Enter 繼續..."
            ;;
        2)
            echo ""
            echo "🔄 更新程式碼..."
            echo ""
            rsync -avz --exclude 'node_modules' --exclude '__pycache__' \
                ./frontend/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/frontend/
            rsync -avz --exclude '__pycache__' \
                ./backend/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/backend/
            scp nginx.conf $SERVER_USER@$SERVER_IP:$SERVER_PATH/

            ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker compose restart api nginx"

            echo ""
            echo "✅ 程式碼更新完成！"
            read -p "按 Enter 繼續..."
            ;;
        3)
            echo ""
            echo "🔄 更新資料庫結構..."
            echo ""
            echo "上傳 SQL 檔案"
            scp ./backend/add_publish_order.sql $SERVER_USER@$SERVER_IP:$SERVER_PATH/backend/

            echo "執行資料庫更新"
            ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker compose exec -T db mysql -u fb_user -p9298 fb_products < backend/add_publish_order.sql"

            echo ""
            echo "✅ 資料庫更新完成！"
            read -p "按 Enter 繼續..."
            ;;
        4)
            echo ""
            echo "📤 上傳檔案到伺服器..."
            echo ""
            rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '__pycache__' \
                ./ $SERVER_USER@$SERVER_IP:$SERVER_PATH/
            echo ""
            echo "✅ 檔案上傳完成！"
            read -p "按 Enter 繼續..."
            ;;
        5)
            echo ""
            echo "📊 檢查伺服器狀態..."
            echo ""
            ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker compose ps && echo '' && echo '最近日誌:' && docker compose logs --tail=20"
            echo ""
            read -p "按 Enter 繼續..."
            ;;
        0)
            echo "再見！"
            exit 0
            ;;
        *)
            echo "無效選擇"
            sleep 1
            ;;
    esac
done
