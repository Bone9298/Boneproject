// background.js - Extension Background Service Worker

console.log('[Background] Service worker started');

// Listen for messages from web pages
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    console.log('[Background] Received external message:', request);

    if (request.action === 'syncProducts') {
        const products = request.products;
        console.log('[Background] Syncing', products.length, 'products to chrome.storage...');

        chrome.storage.local.set({
            'fbProducts': products,
            'syncTime': new Date().toISOString()
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('[Background] Sync failed:', chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                console.log('[Background] ✅ Sync successful');
                sendResponse({ success: true, count: products.length });
            }
        });

        return true; // Keep channel open for async response
    }
});

// Also listen for internal messages (from popup or content scripts)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Background] Received internal message:', message);

    if (message.action === 'startCommenting') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, message);
        });
    }

    // Forward messages from content script to popup
    if (message.type === 'progress' || message.type === 'log' || message.type === 'complete' || message.type === 'error') {
        chrome.runtime.sendMessage(message);
    }
});
