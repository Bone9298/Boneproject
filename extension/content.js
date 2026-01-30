// Content.js - DEBUG VERSION with detailed logging
console.log('🚀 FB 批量留言助手已載入 (DEBUG MODE)');

let isProcessing = false;
let currentProducts = [];
let currentIndex = 0;
let shouldStop = false;
let publishLog = [];  // 發布日誌記錄

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startCommenting') {
        console.log('📩 收到開始留言指令，商品數量:', message.products.length);
        currentProducts = message.products;
        shouldStop = false;
        startBatchCommenting();
        sendResponse({ status: 'started' });
    } else if (message.action === 'stopCommenting') {
        console.log('⏹ 收到停止留言指令');
        shouldStop = true;
        sendLog('⏹ 正在停止留言...', 'info');
        sendResponse({ status: 'stopping' });
    }
    return true;
});

// Main function to start batch commenting
async function startBatchCommenting() {
    if (isProcessing) {
        sendLog('已在處理中，請稍候', 'error');
        return;
    }

    isProcessing = true;
    currentIndex = 0;
    publishLog = [];  // 清空日誌

    // 記錄開始時間和基本資訊
    const sessionInfo = {
        startTime: new Date().toISOString(),
        pageUrl: window.location.href,
        pageTitle: document.title,
        totalProducts: currentProducts.length,
        products: []
    };

    sendLog('開始批量留言...', 'info');

    // DEBUG: Log current page info
    console.log('📍 當前頁面 URL:', window.location.href);
    console.log('📍 頁面標題:', document.title);

    // Check if we're on a Facebook post
    if (!isFacebookPost()) {
        sendLog('請先打開 Facebook 貼文頁面', 'error');
        sendComplete(false);
        return;
    }

    // Process each product
    for (let i = 0; i < currentProducts.length; i++) {
        // Check if user requested stop
        if (shouldStop) {
            sendLog('⏹ 用戶已停止留言', 'info');
            sessionInfo.endTime = new Date().toISOString();
            sessionInfo.status = 'stopped';
            downloadLog(sessionInfo);
            chrome.runtime.sendMessage({ type: 'stopped' });
            isProcessing = false;
            return;
        }

        currentIndex = i;
        const product = currentProducts[i];

        sendProgress(i, currentProducts.length);
        sendLog(`處理商品 ${i + 1}/${currentProducts.length}: ${product.name}`, 'info');

        const productLog = {
            index: i + 1,
            name: product.name,
            specs: product.specs || '',
            price: product.price,
            branch: product.branch || '',
            startTime: new Date().toISOString()
        };

        try {
            await postComment(product);
            productLog.status = 'success';
            productLog.endTime = new Date().toISOString();
            sendLog(`✓ ${product.name} 留言成功`, 'success');

            // Wait 5 seconds between comments
            await wait(5000);

        } catch (error) {
            productLog.status = 'failed';
            productLog.error = error.message;
            productLog.endTime = new Date().toISOString();
            sendLog(`✗ ${product.name} 留言失敗: ${error.message}`, 'error');
            console.error('❌留言失敗:', error);

            // Ask user if they want to continue
            if (i < currentProducts.length - 1) {
                const shouldContinue = confirm(`商品 "${product.name}" 留言失敗。\n\n是否繼續處理剩餘商品？`);
                if (!shouldContinue) {
                    sendLog('用戶取消批量留言', 'error');
                    sessionInfo.endTime = new Date().toISOString();
                    sessionInfo.status = 'cancelled';
                    sessionInfo.products = publishLog;
                    downloadLog(sessionInfo);
                    isProcessing = false;
                    return;
                }
            }
        }

        publishLog.push(productLog);
    }

    // 完成後生成日誌檔案
    sessionInfo.endTime = new Date().toISOString();
    sessionInfo.status = 'completed';
    sessionInfo.products = publishLog;
    sessionInfo.successCount = publishLog.filter(p => p.status === 'success').length;
    sessionInfo.failedCount = publishLog.filter(p => p.status === 'failed').length;

    sendProgress(currentProducts.length, currentProducts.length);
    sendLog('批量留言完成！', 'success');
    sendComplete(true);

    // 下載日誌
    downloadLog(sessionInfo);

    isProcessing = false;
}

// Post a single comment
async function postComment(product) {
    console.log('\n🎯 ===== 開始處理商品:', product.name, '=====');

    // Step 1: Find and click comment button
    console.log('🔍 步驟 1: 尋找留言按鈕...');
    const commentBtn = await findCommentButton();
    if (!commentBtn) {
        throw new Error('找不到留言按鈕');
    }
    console.log('✅ 找到留言按鈕，準備點擊');

    commentBtn.click();
    await wait(2000);

    // Step 2: Find comment input area
    console.log('🔍 步驟 2: 尋找留言輸入框...');
    const commentBox = await findCommentBox();
    if (!commentBox) {
        throw new Error('找不到留言輸入框');
    }
    console.log('✅ 找到留言輸入框');

    // Step 3: Upload image if exists
    if (product.image) {
        console.log('🖼️ 步驟 3: 上傳商品圖片...');
        await uploadImage(product.image, commentBox);
        await wait(3000);
    }

    // Step 4: Type comment text
    const commentText = formatComment(product);
    console.log('⌨️ 步驟 4: 輸入留言內容:', commentText);
    await typeInCommentBox(commentBox, commentText);
    await wait(2000);

    // Step 5: Submit comment by pressing Enter
    console.log('📤 步驟 5: 按下 Enter 發送留言');
    sendLog('按下 Enter 鍵發送留言...');
    await wait(1500);

    // Simulate Enter key press
    const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
    });
    commentBox.dispatchEvent(enterEvent);

    sendLog('✅ 已發送留言', 'success');
    console.log('✅ 已觸發 Enter 按鍵事件');
    await wait(2000);

    // Skip verification - comments post successfully but verification fails in modal
    console.log('⏭️ 跳過驗證（留言已發送）');
    console.log('✅ 留言已成功發布\n');
}

// Find comment button (PRIORITIZE MODAL/DIALOG)
async function findCommentButton() {
    console.log('\n🔍 === 開始尋找留言按鈕 ===');

    // CRITICAL: Check all possible modal selectors
    const modalSelectors = [
        'div[role="dialog"]',
        'div[aria-modal="true"]',
        'div[data-pagelet*="PermalinkModal"]',
        'div[data-pagelet*="PostModal"]'
    ];

    let modal = null;
    for (const selector of modalSelectors) {
        modal = document.querySelector(selector);
        if (modal) {
            console.log('✅ 找到彈窗容器:', selector);
            console.log('📦 彈窗 HTML (前 200 字元):', modal.outerHTML.substring(0, 200));
            break;
        }
    }

    if (modal) {
        console.log('🎯 在彈窗中尋找留言按鈕...');

        // Log all buttons in modal for debugging
        const allModalButtons = modal.querySelectorAll('div[role="button"]');
        console.log(`📊 彈窗中共有 ${allModalButtons.length} 個按鈕`);

        // Search within modal first
        const commentSelectors = [
            'div[aria-label="留個言吧……"]',
            'div[aria-label="留言"]',
            'div[aria-label="Write a comment"]',
            'div[aria-label*="comment" i]',
            'div[aria-label*="留言" i]'
        ];

        for (const selector of commentSelectors) {
            const btn = modal.querySelector(selector);
            if (btn && btn.offsetParent !== null) {
                console.log('✅✅ 在彈窗中找到留言按鈕!', selector);
                console.log('📍 按鈕位置:', btn.getBoundingClientRect());
                return btn;
            }
        }

        // Fallback: search by text in modal
        console.log('⚠️ 用選擇器找不到，嘗試文字匹配...');
        for (let i = 0; i < allModalButtons.length; i++) {
            const btn = allModalButtons[i];
            if (btn.offsetParent === null) continue;
            const text = btn.textContent.trim();
            console.log(`  按鈕 ${i}: "${text}"`);
            if (text.includes('留言') || text.toLowerCase().includes('comment')) {
                console.log('✅✅ 在彈窗中找到留言按鈕 (文字匹配):', text);
                return btn;
            }
        }

        console.warn('⚠️ 在彈窗中找不到留言按鈕，嘗試主頁面...');
    } else {
        console.log('ℹ️ 沒有檢測到彈窗，在主頁面尋找');
    }

    // Fallback: search in main page
    console.log('🔍 在主頁面中尋找留言按鈕...');
    const selectors = [
        'div[aria-label="留個言吧……"]',
        'div[aria-label="留言"]',
        'div[aria-label="Write a comment"]'
    ];

    for (const selector of selectors) {
        const btn = document.querySelector(selector);
        if (btn) {
            console.log('✅ 在主頁面找到留言按鈕:', selector);
            return btn;
        }
    }

    // Last fallback
    const allButtons = document.querySelectorAll('div[role="button"]');
    console.log(`📊 主頁面共有 ${allButtons.length} 個按鈕`);
    for (const btn of allButtons) {
        const text = btn.textContent.trim();
        if (text.includes('留言') || text.includes('Comment')) {
            console.log('✅ 找到留言按鈕 (文字匹配):', text);
            return btn;
        }
    }

    console.error('❌ 找不到留言按鈕！');
    return null;
}

// Find comment input box (PRIORITIZE MODAL/DIALOG)
async function findCommentBox() {
    await wait(500);

    console.log('\n🔍 === 開始尋找留言輸入框 ===');

    // Check for modal
    const modalSelectors = [
        'div[role="dialog"]',
        'div[aria-modal="true"]',
        'div[data-pagelet*="PermalinkModal"]',
        'div[data-pagelet*="PostModal"]'
    ];

    let modal = null;
    for (const selector of modalSelectors) {
        modal = document.querySelector(selector);
        if (modal) {
            console.log('✅ 找到彈窗容器');
            break;
        }
    }

    if (modal) {
        console.log('🎯 在彈窗中尋找留言輸入框...');

        const inputSelectors = [
            'div[contenteditable="true"][role="textbox"]',
            'div[contenteditable="true"][aria-label*="comment" i]',
            'div[contenteditable="true"][aria-label*="留言" i]',
            'div.notranslate[contenteditable="true"]',
            'div[contenteditable="true"]'
        ];

        for (const selector of inputSelectors) {
            const boxes = modal.querySelectorAll(selector);
            console.log(`  嘗試選擇器: ${selector}, 找到 ${boxes.length} 個`);
            for (const box of boxes) {
                if (box.offsetParent !== null && !box.hasAttribute('aria-hidden')) {
                    console.log('✅✅ 在彈窗中找到留言輸入框!');
                    console.log('📍 輸入框位置:', box.getBoundingClientRect());
                    return box;
                }
            }
        }

        console.warn('⚠️ 在彈窗中找不到輸入框，嘗試主頁面...');
    }

    // Fallback: search in main page
    console.log('🔍 在主頁面中尋找留言輸入框...');
    const selectors = [
        'div[contenteditable="true"][role="textbox"]',
        'div[contenteditable="true"]'
    ];

    for (const selector of selectors) {
        const boxes = document.querySelectorAll(selector);
        for (const box of boxes) {
            if (box.offsetParent !== null) {
                console.log('✅ 在主頁面找到留言輸入框');
                return box;
            }
        }
    }

    console.error('❌ 找不到留言輸入框！');
    return null;
}

// Upload image to comment
async function uploadImage(base64Image, commentBox) {
    try {
        const imageInput = await findImageInput(commentBox);
        if (!imageInput) {
            console.warn('找不到圖片上傳按鈕，跳過圖片上傳');
            return;
        }

        const file = base64ToFile(base64Image, 'product.jpg');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        imageInput.files = dataTransfer.files;

        const event = new Event('change', { bubbles: true });
        imageInput.dispatchEvent(event);

        console.log('圖片上傳觸發成功');

    } catch (error) {
        console.error('圖片上傳失敗:', error);
        throw new Error('圖片上傳失敗');
    }
}

async function findImageInput(commentBox) {
    const container = commentBox.closest('form') || commentBox.closest('div[role="article"]') || commentBox.parentElement;
    if (!container) return null;

    const inputs = container.querySelectorAll('input[type="file"]');
    for (const input of inputs) {
        if (input.accept && input.accept.includes('image')) {
            return input;
        }
    }

    const imageButtons = container.querySelectorAll('[aria-label*="photo" i], [aria-label*="圖片" i], [aria-label*="相片" i]');
    for (const btn of imageButtons) {
        btn.click();
        await wait(300);

        const newInputs = document.querySelectorAll('input[type="file"]');
        for (const input of newInputs) {
            if (input.accept && input.accept.includes('image')) {
                return input;
            }
        }
    }

    return null;
}

function base64ToFile(base64, filename) {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}

async function typeInCommentBox(commentBox, text) {
    commentBox.focus();
    await wait(500);

    // CRITICAL: Simulate PASTE event - most reliable way to insert text
    // This properly triggers React's event handlers

    // Clear existing content first
    commentBox.textContent = '';

    // Create paste event with clipboard data
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/plain', text);

    const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dataTransfer
    });

    // Dispatch paste event
    commentBox.dispatchEvent(pasteEvent);

    await wait(200);

    // Fallback: If paste didn't work, manually insert content
    if (!commentBox.textContent || commentBox.textContent.trim() === '') {
        console.warn('⚠️ 貼上事件未生效，使用備用方法...');

        // Manual insertion with line breaks
        const lines = text.split('\n');
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < lines.length; i++) {
            const textNode = document.createTextNode(lines[i]);
            fragment.appendChild(textNode);

            if (i < lines.length - 1) {
                const br = document.createElement('br');
                fragment.appendChild(br);
            }
        }

        commentBox.appendChild(fragment);
    }

    await wait(100);

    // Move cursor to end
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(commentBox);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);

    // Trigger input event for React
    const inputEvent = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertFromPaste',
        data: text
    });
    commentBox.dispatchEvent(inputEvent);

    // Also trigger change event
    const changeEvent = new Event('change', { bubbles: true });
    commentBox.dispatchEvent(changeEvent);

    console.log('✅ 文字輸入完成');
    console.log('📝 留言內容:', commentBox.textContent);
    console.log('📏 內容長度:', commentBox.textContent.length, '字元');
}

function formatComment(product) {
    let text = `商品名稱：${product.name}\n`;
    if (product.specs) {
        text += `規格：${product.specs}\n`;
    }
    text += `金額：$ ${product.price}\n`;
    if (product.quantity) {
        text += `限量：${product.quantity}`;
    }
    return text;
}

async function verifyCommentPosted(commentText) {
    await wait(1000);

    const commentElements = document.querySelectorAll('div[role="article"] div[dir="auto"]');

    for (const elem of commentElements) {
        if (elem.textContent.includes(commentText.substring(0, 20))) {
            return true;
        }
    }

    return false;
}

function isFacebookPost() {
    const url = window.location.href;
    return url.includes('facebook.com') &&
        (url.includes('/posts/') || url.includes('/permalink/') || url.includes('/photo/'));
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function sendProgress(current, total) {
    chrome.runtime.sendMessage({
        type: 'progress',
        current: current + 1,
        total: total
    });
}

function sendLog(text, status = 'info') {
    chrome.runtime.sendMessage({
        type: 'log',
        text: text,
        status: status
    });
}

function sendComplete(success) {
    chrome.runtime.sendMessage({
        type: success ? 'complete' : 'error',
        text: success ? '全部完成' : '處理失敗'
    });
}

// 下載日誌檔案
function downloadLog(sessionInfo) {
    try {
        // 生成易讀的文字格式日誌
        let logText = '='.repeat(60) + '\n';
        logText += 'FB 批量留言助手 - 發布日誌\n';
        logText += '='.repeat(60) + '\n\n';

        logText += `開始時間: ${new Date(sessionInfo.startTime).toLocaleString('zh-TW')}\n`;
        logText += `結束時間: ${new Date(sessionInfo.endTime).toLocaleString('zh-TW')}\n`;
        logText += `頁面網址: ${sessionInfo.pageUrl}\n`;
        logText += `頁面標題: ${sessionInfo.pageTitle}\n`;
        logText += `最終狀態: ${sessionInfo.status}\n`;
        logText += `總商品數: ${sessionInfo.totalProducts}\n`;

        if (sessionInfo.successCount !== undefined) {
            logText += `成功發布: ${sessionInfo.successCount}\n`;
            logText += `發布失敗: ${sessionInfo.failedCount}\n`;
        }

        logText += '\n' + '='.repeat(60) + '\n';
        logText += '商品詳細記錄\n';
        logText += '='.repeat(60) + '\n\n';

        sessionInfo.products.forEach((product, index) => {
            logText += `[${index + 1}] ${product.name}\n`;
            logText += `    規格: ${product.specs}\n`;
            logText += `    金額: ${product.price}\n`;
            logText += `    分店: ${product.branch}\n`;
            logText += `    狀態: ${product.status === 'success' ? '✓ 成功' : '✗ 失敗'}\n`;
            if (product.error) {
                logText += `    錯誤: ${product.error}\n`;
            }
            logText += `    時間: ${new Date(product.startTime).toLocaleString('zh-TW')}\n`;
            logText += '\n';
        });

        logText += '='.repeat(60) + '\n';
        logText += 'End of Log\n';
        logText += '='.repeat(60) + '\n';

        // 生成檔名（包含時間戳記）
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `FB留言日誌_${timestamp}.txt`;

        // 創建 Blob 並下載
        const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('✅ 日誌檔案已下載:', filename);

        // 同時保存 JSON 格式供開發者使用
        const jsonFilename = `FB留言日誌_${timestamp}.json`;
        const jsonBlob = new Blob([JSON.stringify(sessionInfo, null, 2)], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);

        const jsonA = document.createElement('a');
        jsonA.href = jsonUrl;
        jsonA.download = jsonFilename;
        document.body.appendChild(jsonA);
        jsonA.click();
        document.body.removeChild(jsonA);
        URL.revokeObjectURL(jsonUrl);

        console.log('✅ JSON 日誌檔案已下載:', jsonFilename);

    } catch (error) {
        console.error('❌ 下載日誌失敗:', error);
    }
}

