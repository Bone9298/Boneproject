/**
 * API 客戶端 - 與後端 Flask API 通訊
 */
class APIClient {
    constructor(baseURL) {
        // 自動偵測環境
        if (!baseURL) {
            // 只有本地開發 (port 8000) 使用完整 URL
            // 其他環境（Docker port 80、伺服器 port 7000 等）都用相對路徑
            const port = window.location.port;
            const isLocalDev = port === '8000';
            baseURL = isLocalDev ? 'http://localhost:5000/api' : '/api';
        }
        this.baseURL = baseURL;
        console.log('API Client initialized with baseURL:', this.baseURL);
    }

    /**
     * 取得所有商品
     */
    async getProducts() {
        try {
            const response = await fetch(`${this.baseURL}/products`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.products || [];
        } catch (error) {
            console.error('Failed to get products:', error);
            throw error;
        }
    }

    /**
     * 新增商品
     */
    async createProduct(product) {
        try {
            const response = await fetch(`${this.baseURL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to create product:', error);
            throw error;
        }
    }

    /**
     * 更新商品
     */
    async updateProduct(id, product) {
        try {
            const response = await fetch(`${this.baseURL}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to update product:', error);
            throw error;
        }
    }

    /**
     * 刪除商品
     */
    async deleteProduct(id) {
        try {
            const response = await fetch(`${this.baseURL}/products/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to delete product:', error);
            throw error;
        }
    }

    /**
     * 批量更新商品
     */
    async batchUpdate(products) {
        try {
            const response = await fetch(`${this.baseURL}/products/batch-update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to batch update:', error);
            throw error;
        }
    }
}

// 建立全域 API 客戶端實例
const apiClient = new APIClient();
