// API 設定頁面邏輯

// 載入已儲存的設定
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Options] Loading saved settings...');

    try {
        const result = await chrome.storage.sync.get(['apiUrl']);
        if (result.apiUrl) {
            document.getElementById('apiUrl').value = result.apiUrl;
            console.log('[Options] Loaded API URL:', result.apiUrl);
        } else {
            // 預設值
            document.getElementById('apiUrl').value = 'http://localhost:5000';
        }
    } catch (error) {
        console.error('[Options] Error loading settings:', error);
        showStatus('載入設定時發生錯誤', 'error');
    }
});

// 儲存設定
document.getElementById('saveBtn').addEventListener('click', async () => {
    const apiUrl = document.getElementById('apiUrl').value.trim();

    // 驗證輸入
    if (!apiUrl) {
        showStatus('❌ 請輸入 API 網址', 'error');
        return;
    }

    // 驗證 URL 格式
    try {
        new URL(apiUrl);
    } catch (e) {
        showStatus('❌ 網址格式不正確，請輸入完整的 URL（包含 http:// 或 https://）', 'error');
        return;
    }

    // 移除結尾的斜線
    const cleanUrl = apiUrl.replace(/\/$/, '');

    try {
        await chrome.storage.sync.set({ apiUrl: cleanUrl });
        console.log('[Options] Saved API URL:', cleanUrl);
        showStatus('✅ 設定已儲存成功！', 'success');

        // 3秒後自動關閉狀態訊息
        setTimeout(() => {
            hideStatus();
        }, 3000);
    } catch (error) {
        console.error('[Options] Error saving settings:', error);
        showStatus('❌ 儲存設定時發生錯誤', 'error');
    }
});

// 測試連線
document.getElementById('testBtn').addEventListener('click', async () => {
    const apiUrl = document.getElementById('apiUrl').value.trim().replace(/\/$/, '');

    if (!apiUrl) {
        showStatus('❌ 請先輸入 API 網址', 'error');
        return;
    }

    // 驗證 URL 格式
    try {
        new URL(apiUrl);
    } catch (e) {
        showStatus('❌ 網址格式不正確', 'error');
        return;
    }

    showStatus('🔄 正在測試連線...', 'info');

    try {
        console.log('[Options] Testing connection to:', apiUrl);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超時

        const response = await fetch(`${apiUrl}/api/products`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            const productCount = data.products ? data.products.length : 0;
            showStatus(`✅ 連線成功！找到 ${productCount} 個商品`, 'success');
            console.log('[Options] Connection test successful:', data);
        } else {
            showStatus(`❌ 連線失敗：伺服器回應 HTTP ${response.status}`, 'error');
            console.error('[Options] Connection test failed:', response.status);
        }
    } catch (error) {
        console.error('[Options] Connection test error:', error);

        if (error.name === 'AbortError') {
            showStatus('❌ 連線逾時：無法在 10 秒內連接到伺服器', 'error');
        } else if (error.message.includes('Failed to fetch')) {
            showStatus('❌ 連線失敗：無法連接到伺服器，請檢查網址是否正確', 'error');
        } else {
            showStatus(`❌ 連線失敗：${error.message}`, 'error');
        }
    }
});

// 顯示狀態訊息
function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type} show`;
}

// 隱藏狀態訊息
function hideStatus() {
    const statusDiv = document.getElementById('status');
    statusDiv.classList.remove('show');
}

// Enter 鍵儲存
document.getElementById('apiUrl').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('saveBtn').click();
    }
});
