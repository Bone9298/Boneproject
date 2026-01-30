// Popup.js - Chrome Extension Popup Logic

let selectedProducts = [];
let productPageUrl = 'http://localhost:8000/index.html';
let isCommenting = false;
let shouldStop = false;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Popup] Initialized');

    // 載入分店設定
    await loadBranchSetting();

    await loadProducts();
    await checkFacebookPage();

    document.getElementById('startBtn').addEventListener('click', startCommenting);
    document.getElementById('stopBtn').addEventListener('click', stopCommenting);
    document.getElementById('refreshBtn').addEventListener('click', loadProducts);

    // 監聽分店選擇變更
    document.getElementById('branchSelect').addEventListener('change', async (e) => {
        const branch = e.target.value;
        await saveBranchSetting(branch);
        await loadProducts();
        updateUI();
    });
});

// Stop commenting
function stopCommenting() {
    shouldStop = true;
    document.getElementById('stopBtn').disabled = true;
    addLog('⏹ 用戶請求停止...', 'info');

    // Send stop message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'stopCommenting'
        });
    });
}

// 🔥 取得 API URL（從設定讀取）
async function getApiUrl() {
    try {
        const result = await chrome.storage.sync.get(['apiUrl']);
        const url = result.apiUrl || 'http://localhost:5000';
        console.log('[Popup] Using API URL:', url);
        return url;
    } catch (error) {
        console.error('[Popup] Error getting API URL:', error);
        return 'http://localhost:5000'; // 預設值
    }
}

// 🏪 載入分店設定
async function loadBranchSetting() {
    try {
        const result = await chrome.storage.sync.get(['selectedBranch']);
        const branch = result.selectedBranch || '';
        document.getElementById('branchSelect').value = branch;
        console.log('[Popup] Loaded branch setting:', branch || '全部分店');
    } catch (error) {
        console.error('[Popup] Error loading branch setting:', error);
    }
}

// 🏪 儲存分店設定
async function saveBranchSetting(branch) {
    try {
        await chrome.storage.sync.set({ selectedBranch: branch });
        console.log('[Popup] Saved branch setting:', branch || '全部分店');
    } catch (error) {
        console.error('[Popup] Error saving branch setting:', error);
    }
}

// Load pending products from Flask API
async function loadProducts() {
    try {
        const apiUrl = await getApiUrl();  // 🔥 從設定讀取
        const selectedBranch = document.getElementById('branchSelect').value;

        console.log('[Popup] Loading pending products from:', apiUrl);
        console.log('[Popup] Selected branch:', selectedBranch || '全部分店');

        const response = await fetch(`${apiUrl}/api/products`);  // 🔥 使用設定的 URL

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        const allProducts = data.products || [];

        // 🔥 過濾商品：pending=true + 符合分店
        selectedProducts = allProducts.filter(p => {
            const isPending = p.pending === true;
            const matchBranch = !selectedBranch || p.branch === selectedBranch;
            return isPending && matchBranch;
        });

        // 🔥 按照 publishOrder 排序（確保優先商品在前）
        selectedProducts.sort((a, b) => {
            const orderA = a.publishOrder || 9999;
            const orderB = b.publishOrder || 9999;
            return orderA - orderB;
        });

        const branchText = selectedBranch || '全部分店';
        console.log(`[Popup] ${branchText}: Found ${selectedProducts.length} pending products (sorted by publish order)`);

        updateUI();

    } catch (error) {
        console.error('[Popup] Error loading products:', error);
        selectedProducts = [];
        updateUI();
        addLog('❌ 無法連接 API，請到擴充功能設定頁面檢查 API 網址', 'error');
    }
}

function updateUI() {
    const selectedBranch = document.getElementById('branchSelect').value;
    const branchText = selectedBranch || '全部分店';

    document.getElementById('selectedCount').textContent = selectedProducts.length;

    if (selectedProducts.length === 0) {
        document.getElementById('startBtn').disabled = true;
        document.getElementById('startBtn').textContent = '請先勾選商品';
        addLog(`${branchText}: 未找到待發布商品`, 'error');
        addLog('請到商品管理頁面：1) 勾選商品，或 2) 點擊「發布到 FB」', 'info');
    } else {
        document.getElementById('startBtn').disabled = false;
        document.getElementById('startBtn').textContent = `開始留言 (${selectedProducts.length} 個商品)`;
        addLog(`${branchText}: 成功載入 ${selectedProducts.length} 個商品`, 'success');
    }
}

// Check if current page is Facebook POST (not just Facebook)
async function checkFacebookPage() {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = tabs[0].url;

        console.log('[Popup] Current URL:', url); if (url && url.includes('facebook.com')) {
            // Check if it's actually a post page
            if (url.includes('/posts/') || url.includes('/permalink/') || url.includes('/photo/')) {
                document.getElementById('currentPage').textContent = 'Facebook 貼文 ✓';
                document.getElementById('warning').style.display = 'none';
            } else {
                document.getElementById('currentPage').textContent = 'Facebook (非貼文頁)';
                document.getElementById('warning').style.display = 'block';
                document.getElementById('startBtn').disabled = true;
                addLog('❌ 請打開具體的貼文頁面（不是首頁或個人頁）', 'error');
            }
        } else {
            document.getElementById('currentPage').textContent = '非 Facebook';
            document.getElementById('warning').style.display = 'block';
            document.getElementById('startBtn').disabled = true;
        }
    } catch (error) {
        console.error('Error checking page:', error);
    }
}

// Start commenting process
async function startCommenting() {
    if (selectedProducts.length === 0) {
        alert('請先勾選商品！');
        return;
    }

    console.log('[Popup] Starting commenting with', selectedProducts.length, 'products');

    isCommenting = true;
    shouldStop = false;

    // Show stop button, hide start button
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('stopBtn').style.display = 'block';
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('refreshBtn').disabled = true;

    // Show progress
    document.getElementById('progress').style.display = 'block';
    document.getElementById('log').style.display = 'block';

    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

        // Send message to content script to start commenting
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'startCommenting',
            products: selectedProducts
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('[Popup]', chrome.runtime.lastError);
                addLog('無法連接到頁面，請刷新 Facebook 頁面後重試', 'error');
                resetUI();
            }
        });

    } catch (error) {
        console.error('Error starting comments:', error);
        addLog('啟動失敗: ' + error.message, 'error');
        resetUI();
    }
}

// Listen for progress updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'progress') {
        updateProgress(message.current, message.total);
    } else if (message.type === 'log') {
        addLog(message.text, message.status);
    } else if (message.type === 'complete') {
        addLog('✅ 全部完成！', 'success');
        resetUI();
    } else if (message.type === 'error') {
        addLog('❌ ' + message.text, 'error');
        resetUI();
    } else if (message.type === 'stopped') {
        addLog('⏹ 已停止留言', 'info');
        resetUI();
    }
});

// Update progress bar
function updateProgress(current, total) {
    const percent = Math.round((current / total) * 100);
    document.getElementById('progressBar').style.width = percent + '%';
    document.getElementById('progressBar').textContent = `${current}/${total} (${percent}%)`;
}

// Add log message
function addLog(text, status = 'info') {
    const logDiv = document.getElementById('log');
    const logItem = document.createElement('div');
    logItem.className = `log-item ${status}`;
    logItem.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    logDiv.appendChild(logItem);
    logDiv.scrollTop = logDiv.scrollHeight;
}

// Reset UI after completion
function resetUI() {
    isCommenting = false;
    shouldStop = false;

    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('stopBtn').style.display = 'none';
    document.getElementById('startBtn').disabled = false;
    document.getElementById('refreshBtn').disabled = false;
    document.getElementById('startBtn').textContent = `開始留言 (${selectedProducts.length} 個商品)`;
}
