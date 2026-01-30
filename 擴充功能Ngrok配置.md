# Chrome 擴充功能 Ngrok 配置指南

## 📱 為什麼需要配置？

Chrome 擴充功能目前設定為使用本地 API (`localhost:5000`)。
當使用 ngrok 分享時，需要將 API 網址改為 ngrok 提供的公開網址。

## 🔧 配置步驟

### 1. 獲取 Ngrok API 網址

執行 `啟動Ngrok分享.bat` 後，在 **API (port 5000)** 的 ngrok 視窗中找到網址。

範例：
```
Forwarding  https://xyz789.ngrok-free.app -> http://localhost:5000
```

複製這個網址：`https://xyz789.ngrok-free.app`

### 2. 修改擴充功能設定

開啟檔案：`extension\popup.html`

找到這一行（大約在第 170-180 行附近）：

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

改為：

```javascript
const API_BASE_URL = 'https://xyz789.ngrok-free.app/api';
```

**⚠️ 記得加上 `/api` 結尾！**

### 3. 重新載入擴充功能

1. 打開 Chrome
2. 訪問 `chrome://extensions/`
3. 找到「FB 現貨出清機器人」
4. 點擊🔄重新載入按鈕

### 4. 測試擴充功能

1. 訪問 Facebook 商品頁面
2. 點擊擴充功能圖示
3. 嘗試抓取商品
4. 檢查是否能正常新增到系統

## 📦 分享給朋友使用

### 方式 1：修改後分享（推薦）

1. 按照上述步驟修改 `popup.html`
2. 將整個 `extension` 資料夾壓縮
3. 分享給朋友
4. 朋友解壓縮後，在 Chrome 載入擴充功能

**優點**：朋友不需要修改任何東西

### 方式 2：給朋友修改說明

1. 分享原始的 `extension` 資料夾
2. 給朋友看這份說明文件
3. 朋友自行修改 API 網址

## ⚙️ 自動配置腳本

我已為您準備了自動配置腳本：

**雙擊執行**：`配置擴充功能Ngrok.bat`

腳本會詢問您的 ngrok API 網址，然後自動修改 `popup.html`。

## 🔄 切換回本地模式

當不使用 ngrok 時，記得改回本地網址：

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

或者保留兩個版本：
- `popup.html` - 本地版本
- `popup-ngrok.html` - ngrok 版本

使用時複製對應版本。

## ❓ 常見問題

### Q: 擴充功能無法連接 API？
A: 檢查：
1. API 網址是否正確？
2. 是否加了 `/api` 結尾？
3. ngrok 是否還在運行？
4. 是否重新載入了擴充功能？

### Q: 每次重啟 ngrok 都要改嗎？
A: 是的，免費版 ngrok 每次重啟網址會變。可以考慮：
- 使用付費版 ngrok（固定網址）
- 部署到伺服器（永久網址）

### Q: 可以同時支援本地和 ngrok 嗎？
A: 可以，修改 `popup.html` 添加切換開關，或維護兩個版本。

---

**準備好配置了嗎？執行 `配置擴充功能Ngrok.bat` 或手動修改！** 🚀
