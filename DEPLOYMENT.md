# Docker 部署快速指南

## 📦 準備工作

### 1. 安裝 Docker

**Windows:**
- 下載並安裝 [Docker Desktop](https://www.docker.com/products/docker-desktop/)

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose-plugin
```

### 2. 檢查安裝
```bash
docker --version
docker compose version
```

---

## 🚀 本地測試部署

### Step 1: 啟動服務

在專案根目錄執行：

```bash
# 建置並啟動所有服務
docker compose up -d --build

# 查看日誌
docker compose logs -f

# 檢查服務狀態
docker compose ps
```

### Step 2: 訪問系統

- 前端管理系統：http://localhost
- API 端點：http://localhost/api/products

### Step 3: 停止服務

```bash
# 停止服務
docker compose down

# 停止並刪除數據
docker compose down -v
```

---

## 🌐 部署到雲端伺服器

### 準備伺服器

**推薦配置：**
- CPU: 2核心
- RAM: 2GB
- 硬碟: 20GB
- 作業系統: Ubuntu 22.04 LTS

**雲端服務商：**
- AWS EC2
- Google Cloud Compute Engine
- DigitalOcean Droplet
- Linode
- Vultr

### Step 1: 連接伺服器

```bash
ssh root@your-server-ip
```

### Step 2: 安裝 Docker

```bash
# 更新系統
apt update && apt upgrade -y

# 安裝 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安裝 Docker Compose
apt install docker-compose-plugin -y

# 驗證安裝
docker --version
docker compose version
```

### Step 3: 上傳專案

**方法 A: 使用 Git**
```bash
# 安裝 Git
apt install git -y

# Clone 專案
git clone https://github.com/yourusername/fb-bot.git
cd fb-bot
```

**方法 B: 手動上傳**
```bash
# 在本地打包
tar -czf fb-bot.tar.gz \
    backend/ \
    extension/ \
    *.html \
    *.css \
    *.js \
    docker-compose.yml \
    nginx.conf \
    .dockerignore

# 上傳到伺服器
scp fb-bot.tar.gz root@your-server-ip:/root/

# 在伺服器解壓
ssh root@your-server-ip
cd /root
tar -xzf fb-bot.tar.gz
cd fb-bot
```

### Step 4: 配置環境變數

```bash
# 複製環境變數範本
cp .env.example .env

# 編輯環境變數
nano .env
```

修改以下內容：
```env
DB_ROOT_PASSWORD=your_secure_password_here
ALLOWED_ORIGINS=https://yourdomain.com
```

### Step 5: 啟動服務

```bash
# 建置並啟動
docker compose up -d --build

# 查看日誌
docker compose logs -f

# 確認所有服務運行
docker compose ps
```

### Step 6: 設定域名

在您的域名 DNS 設定：
```
A Record: yourdomain.com → 伺服器 IP
A Record: www.yourdomain.com → 伺服器 IP
```

### Step 7: 配置 HTTPS (Let's Encrypt)

```bash
# 安裝 Certbot
apt install certbot python3-certbot-nginx -y

# 停止 nginx 容器
docker compose stop nginx

# 取得憑證
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# 憑證會儲存在：
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem

# 創建 SSL 目錄並複製憑證
mkdir -p ssl
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/

# 重啟 nginx
docker compose up -d nginx
```

### Step 8: 設定防火牆

```bash
# 安裝 UFW
apt install ufw -y

# 允許 SSH
ufw allow 22/tcp

# 允許 HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# 啟用防火牆
ufw enable

# 檢查狀態
ufw status
```

---

## 👥 給用戶的安裝指南

### 下載擴充功能

提供 `extension` 資料夾的壓縮檔

### 安裝步驟

1. **載入擴充功能**
   - 開啟 Chrome
   - 前往 `chrome://extensions/`
   - 開啟「開發人員模式」
   - 點擊「載入未封裝項目」
   - 選擇 `extension` 資料夾

2. **設定 API**
   - 右鍵點擊擴充功能圖示
   - 選擇「選項」
   - 輸入 API 網址：`https://yourdomain.com`
   - 點擊「測試連線」
   - 點擊「儲存設定」

3. **開始使用**
   - 訪問 `https://yourdomain.com` 管理商品
   - 在 Facebook 貼文使用擴充功能

---

## 🔧 維護指令

### 查看日誌
```bash
# 所有服務
docker compose logs -f

# 特定服務
docker compose logs -f api
docker compose logs -f db
docker compose logs -f nginx
```

### 重啟服務
```bash
# 重啟所有服務
docker compose restart

# 重啟特定服務
docker compose restart api
```

### 更新程式碼
```bash
# 拉取最新程式碼
git pull

# 重新建置並啟動
docker compose up -d --build
```

### 備份資料庫
```bash
# 備份
docker compose exec db mysqldump -u fb_user -p9298 fb_products > backup_$(date +%Y%m%d).sql

# 還原
docker compose exec -T db mysql -u fb_user -p9298 fb_products < backup_20260128.sql
```

### 清理 Docker
```bash
# 清理未使用的映像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的卷
docker volume prune
```

---

## 📊 監控

### 檢查服務狀態
```bash
docker compose ps
```

### 檢查資源使用
```bash
docker stats
```

### 檢查磁碟空間
```bash
df -h
```

---

## ⚠️ 常見問題

### 1. 無法連接 API

**檢查：**
```bash
# 確認服務運行
docker compose ps

# 查看 API 日誌
docker compose logs api

# 測試 API
curl http://localhost/api/products
```

### 2. 資料庫連接失敗

**檢查：**
```bash
# 查看資料庫日誌
docker compose logs db

# 進入資料庫容器
docker compose exec db mysql -u fb_user -p9298 fb_products
```

### 3. Nginx 錯誤

**檢查：**
```bash
# 查看 nginx 日誌
docker compose logs nginx

# 測試 nginx 配置
docker compose exec nginx nginx -t
```

### 4. 憑證過期

```bash
# 更新憑證
certbot renew

# 複製新憑證
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/

# 重啟 nginx
docker compose restart nginx
```

---

## 🎯 完成檢查清單

- [ ] Docker 和 Docker Compose 已安裝
- [ ] 專案已上傳到伺服器
- [ ] 環境變數已配置
- [ ] 服務已啟動並運行
- [ ] 域名 DNS 已設定
- [ ] HTTPS 憑證已配置
- [ ] 防火牆已設定
- [ ] 擴充功能已更新並測試
- [ ] 用戶可以訪問管理系統
- [ ] 用戶可以使用擴充功能

---

## 📞 支援

如有問題，請檢查：
1. Docker 服務狀態
2. 日誌檔案
3. 網路連接
4. 防火牆設定
