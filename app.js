// ========================================
// FB Product Manager System
// ========================================

class ProductManager {
    constructor() {
        this.products = [];
        this.currentEditId = null;
        this.currentTab = 'normal';
        this.currentCategory = '0';
        this.currentBranch = 'all';
        this.searchQuery = '';
        this.currentPage = 1;
        this.itemsPerPage = 9;
        this.isSaving = false;  // 🔥 防止重複保存
        this.init();
    }

    // ========================================
    // Initialization
    // ========================================
    init() {
        this.loadProducts();
        this.attachEventListeners();
        this.render();
    }

    // ========================================
    // API Operations - MariaDB Only
    // ========================================
    async loadProducts() {
        try {
            this.products = await apiClient.getProducts();
            this.render();
        } catch (error) {
            console.error('Failed to load products:', error);
            this.showToast('載入商品失敗，請確認後端 API 是否運行', 'error');
            this.products = [];
            this.render();
        }
    }

    // ========================================
    // Progress Modal
    // ========================================
    showProgress(title, total) {
        console.log('📊 showProgress called:', title, 'total:', total);
        const modal = document.getElementById('progressModal');
        const titleEl = document.getElementById('progressTitle');
        const textEl = document.getElementById('progressText');
        const countEl = document.getElementById('progressCount');
        const barEl = document.getElementById('progressBar');

        console.log('Modal element:', modal);

        titleEl.textContent = title;
        textEl.textContent = '準備中...';
        countEl.textContent = `0 / ${total}`;
        barEl.style.width = '0%';
        modal.classList.add('active');

        console.log('✅ Modal should be visible now');
    }

    updateProgress(current, total, message) {
        const textEl = document.getElementById('progressText');
        const countEl = document.getElementById('progressCount');
        const barEl = document.getElementById('progressBar');

        const percentage = (current / total) * 100;
        textEl.textContent = message;
        countEl.textContent = `${current} / ${total}`;
        barEl.style.width = `${percentage}%`;
    }

    hideProgress() {
        const modal = document.getElementById('progressModal');
        modal.classList.remove('active');
    }

    async saveProducts(showProgress = false) {
        console.log('🔧 saveProducts called with showProgress:', showProgress);

        // 🔥 防止重複保存
        if (this.isSaving) {
            console.log('Already saving, skipping...');
            return;
        }

        this.isSaving = true;
        let successCount = 0;
        let failCount = 0;
        const total = this.products.length;

        try {
            if (showProgress) {
                console.log('🎯 About to show progress modal for', total, 'products');
                this.showProgress('正在保存商品...', total);
            }

            // 逐一更新商品，避免批次失敗
            for (let i = 0; i < this.products.length; i++) {
                const product = this.products[i];
                try {
                    await apiClient.updateProduct(product.id, product);
                    successCount++;

                    if (showProgress) {
                        this.updateProgress(
                            successCount + failCount,
                            total,
                            `正在保存: ${product.name || `商品 ${product.id}`}`
                        );
                    }
                } catch (error) {
                    console.error(`Failed to save product ${product.id}:`, error);
                    failCount++;

                    if (showProgress) {
                        this.updateProgress(
                            successCount + failCount,
                            total,
                            `失敗: ${product.name || `商品 ${product.id}`}`
                        );
                    }
                }
            }

            console.log(`Save complete: ${successCount} success, ${failCount} failed`);

            if (showProgress) {
                this.updateProgress(total, total, '✅ 保存完成！');
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.hideProgress();
            }

            if (failCount > 0) {
                this.showToast(`保存完成：${successCount} 成功，${failCount} 失敗`, 'warning');
            }

            // 重新載入商品以確保資料同步
            await this.loadProducts();
        } catch (error) {
            console.error('Failed to save products:', error);
            if (showProgress) {
                this.hideProgress();
            }
            this.showToast('儲存到資料庫失敗', 'error');
        } finally {
            this.isSaving = false;
        }
    }

    // ========================================
    // Event Listeners
    // ========================================
    attachEventListeners() {
        // Form submission
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Image upload
        document.getElementById('imageUploadArea').addEventListener('click', () => {
            document.getElementById('productImage').click();
        });

        document.getElementById('productImage').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });

        document.getElementById('removeImageBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeImage();
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Select/Deselect All
        document.getElementById('selectAllBtn').addEventListener('click', () => {
            this.selectAll();
        });

        document.getElementById('deselectAllBtn').addEventListener('click', () => {
            this.deselectAll();
        });

        // Cancel Edit
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.cancelEdit();
        });

        // Publish Button
        document.getElementById('publishBtn').addEventListener('click', () => {
            this.handlePublish();
        });

        // Sync to Extension Button

        // Select/Deselect All Buttons
        document.getElementById('selectAllBtn').addEventListener('click', () => {
            this.selectAll();
        });

        document.getElementById('deselectAllBtn').addEventListener('click', () => {
            this.deselectAll();
        });

        // Batch Return Button (for pending orders)
        const batchReturnBtn = document.getElementById('batchReturnBtn');
        if (batchReturnBtn) {
            batchReturnBtn.addEventListener('click', () => {
                this.returnMultipleToNormal();
            });
        }

        // Category Filter
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleCategoryFilter(e.target.dataset.category);
            });
        });

        // Branch Filter (Dropdown)
        const branchFilterSelect = document.getElementById('branchFilterSelect');
        if (branchFilterSelect) {
            branchFilterSelect.addEventListener('change', (e) => {
                this.handleBranchFilter(e.target.value);
            });
        }

        // Tab Navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    // ========================================
    // Form Handling
    // ========================================
    async handleFormSubmit() {
        const name = document.getElementById('productName').value.trim();
        const specs = document.getElementById('productSpecs').value.trim();
        const price = document.getElementById('productPrice').value.trim();
        const quantity = document.getElementById('productQuantity').value.trim();
        const category = document.getElementById('productCategory').value;
        const branch = document.getElementById('productBranch').value;
        const priority = document.getElementById('productPriority').checked;
        const imagePreview = document.getElementById('imagePreview');
        const imageData = imagePreview.style.display === 'block' ? imagePreview.src : null;

        if (!name || !specs || !price || !quantity) {
            this.showToast('Please fill all required fields', 'error');
            return;
        }

        if (imageData && imageData.length > 5 * 1024 * 1024) {
            this.showToast('Image too large (max 5MB)', 'error');
            return;
        }

        const productData = {
            id: this.currentEditId || Date.now().toString(),
            name,
            specs,
            price,
            quantity,
            category,
            branch,
            priority,
            image: imageData,
            selected: false,
            pending: false,
            customerReserved: false,
            createdAt: this.currentEditId ?
                this.products.find(p => p.id === this.currentEditId).createdAt :
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            if (this.currentEditId) {
                // Update existing product via API
                await apiClient.updateProduct(this.currentEditId, productData);
                const index = this.products.findIndex(p => p.id === this.currentEditId);
                this.products[index] = productData;
                this.showToast('Product updated', 'success');
            } else {
                // Create new product via API
                await apiClient.createProduct(productData);
                this.products.unshift(productData);
                this.showToast('Product added', 'success');
            }

            this.resetForm();
            this.render();
        } catch (error) {
            console.error('Failed to save product:', error);
            this.showToast('儲存失敗，請確認後端 API 是否運行', 'error');
        }
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            this.showToast('Image too large (max 5MB)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('imagePreview').src = event.target.result;
            document.getElementById('imagePreview').style.display = 'block';
            document.getElementById('uploadPlaceholder').style.display = 'none';
            document.getElementById('removeImageBtn').style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        document.getElementById('imagePreview').src = '';
        document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('uploadPlaceholder').style.display = 'flex';
        document.getElementById('removeImageBtn').style.display = 'none';
        document.getElementById('productImage').value = '';
    }

    resetForm() {
        document.getElementById('productForm').reset();
        this.removeImage();
        this.currentEditId = null;
        document.getElementById('formTitle').textContent = '新增商品';
        document.getElementById('submitBtn').querySelector('span').textContent = '儲存商品';
        document.getElementById('cancelBtn').style.display = 'none';
    }

    cancelEdit() {
        this.resetForm();
        this.showToast('Edit cancelled', 'success');
    }

    // ========================================
    // Product Operations
    // ========================================
    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        this.currentEditId = id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productSpecs').value = product.specs;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productQuantity').value = product.quantity || '';
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productBranch').value = product.branch || '大寮';
        document.getElementById('productPriority').checked = product.priority || false;

        if (product.image) {
            document.getElementById('imagePreview').src = product.image;
            document.getElementById('imagePreview').style.display = 'block';
            document.getElementById('uploadPlaceholder').style.display = 'none';
            document.getElementById('removeImageBtn').style.display = 'flex';
        }

        document.getElementById('formTitle').textContent = 'Edit Product';
        document.getElementById('submitBtn').querySelector('span').textContent = 'Update Product';
        document.getElementById('cancelBtn').style.display = 'inline-block';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async deleteProduct(id) {
        if (!confirm('Delete this product?')) return;

        try {
            // Delete from API
            await apiClient.deleteProduct(id);
            this.products = this.products.filter(p => p.id !== id);
            this.render();
            this.showToast('Product deleted', 'success');
        } catch (error) {
            console.error('Failed to delete product:', error);
            this.showToast('刪除失敗，請確認後端 API 是否運行', 'error');
        }
    }

    toggleProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (product && !product.reserved) {
            product.selected = !product.selected;
            // 🔥 移除自動保存，避免與 handlePublish 的進度條衝突
            // 商品選擇狀態只是暫時的，會在發布時一起保存
            this.render();

            // Update button visibility based on current tab
            if (this.currentTab === 'pending') {
                this.updateBatchReturnButtonVisibility();
            } else {
                this.updatePublishButtonVisibility();
            }
        }
    }

    updateBatchReturnButtonVisibility() {
        const selectedPending = this.products.filter(p => p.pending && p.selected && !p.reserved);
        const batchReturnBtn = document.getElementById('batchReturnBtn');
        const batchReturnCount = document.getElementById('batchReturnCount');
        const publishBtn = document.getElementById('publishBtn');

        if (batchReturnBtn) {
            batchReturnBtn.style.display = selectedPending.length > 0 ? 'flex' : 'none';
            if (batchReturnCount) {
                batchReturnCount.textContent = selectedPending.length;
            }
        }

        // CRITICAL: Hide publish button in pending tab
        if (publishBtn) {
            publishBtn.style.display = 'none';
        }
    }

    updatePublishButtonVisibility() {
        const selectedNormal = this.products.filter(p => !p.pending && p.selected);
        const publishBtn = document.getElementById('publishBtn');
        const publishCount = document.getElementById('publishCount');
        const batchReturnBtn = document.getElementById('batchReturnBtn');

        // CRITICAL: Always show publish button in normal tab
        if (publishBtn) {
            publishBtn.style.display = 'flex';
            publishBtn.disabled = selectedNormal.length === 0;
            if (publishCount) {
                publishCount.textContent = selectedNormal.length;
            }
        }

        // CRITICAL: Hide batch return button in normal tab
        if (batchReturnBtn) {
            batchReturnBtn.style.display = 'none';
        }
    }
    selectAll() {
        const visibleProducts = this.getFilteredProducts();

        if (this.currentTab === 'pending') {
            // In pending tab, select all non-reserved pending items
            visibleProducts.filter(p => p.pending && !p.reserved).forEach(p => p.selected = true);
        } else {
            // In normal tab, select all non-pending items
            visibleProducts.filter(p => !p.pending).forEach(p => p.selected = true);
        }

        // 🔥 移除自動保存，只更新顯示
        this.render();

        // Update appropriate button visibility
        if (this.currentTab === 'pending') {
            this.updateBatchReturnButtonVisibility();
        } else {
            this.updatePublishButtonVisibility();
        }
    }

    deselectAll() {
        const visibleProducts = this.getFilteredProducts();

        if (this.currentTab === 'pending') {
            // In pending tab, deselect all pending items
            visibleProducts.filter(p => p.pending).forEach(p => p.selected = false);
        } else {
            // In normal tab, deselect all non-pending items
            visibleProducts.filter(p => !p.pending).forEach(p => p.selected = false);
        }

        // 🔥 移除自動保存，只更新顯示
        this.render();

        // Update appropriate button visibility
        if (this.currentTab === 'pending') {
            this.updateBatchReturnButtonVisibility();
        } else {
            this.updatePublishButtonVisibility();
        }
    }

    // ========================================
    // Pending Order Operations (with auto-sync to extension)
    // ========================================
    async handlePublish() {
        const selected = this.products.filter(p => p.selected && !p.pending);
        if (selected.length === 0) {
            this.showToast('No products selected', 'error');
            return;
        }

        // CRITICAL FIX: Separate priority and normal products FIRST
        const priorityProducts = selected.filter(p => p.priority);
        const normalProducts = selected.filter(p => !p.priority);

        // Shuffle ONLY normal products
        const shuffledNormal = normalProducts.sort(() => Math.random() - 0.5);

        // IMPORTANT: Priority products go FIRST (max 5), then shuffled normal products
        const publishOrder = [
            ...priorityProducts.slice(0, 5),  // Top 5 priority products
            ...shuffledNormal                  // All normal products (shuffled)
        ];

        console.log('📊 發布順序:', {
            total: publishOrder.length,
            priority: priorityProducts.length,
            normal: shuffledNormal.length,
            firstFive: publishOrder.slice(0, 5).map(p => ({ name: p.name, priority: p.priority }))
        });

        // 🔥 設定發布順序編號並更新狀態
        publishOrder.forEach((p, index) => {
            p.pending = true;
            p.selected = false;
            p.publishOrder = index + 1;  // 1, 2, 3, 4... 依序編號
        });

        // 🔥 使用進度條保存
        await this.saveProducts(true);
        this.switchTab('pending');

        this.showToast(`已將 ${publishOrder.length} 個商品移入待處理 (${priorityProducts.length} 優先, ${shuffledNormal.length} 一般)\n請打開擴充功能開始留言`, 'success');
    }

    toggleReservation(id) {
        const product = this.products.find(p => p.id === id);
        if (product && product.pending) {
            product.customerReserved = !product.customerReserved;
            this.saveProducts();
            this.render();
            this.showToast(product.customerReserved ? 'Marked as reserved' : 'Reservation cancelled', 'success');
        }
    }

    returnToNormal(id) {
        const product = this.products.find(p => p.id === id);
        if (product && product.pending) {
            product.pending = false;
            product.customerReserved = false;
            product.selected = false;
            this.saveProducts();
            this.switchTab('normal');
            this.showToast('已退回到商品目錄', 'success');
        }
    }

    async returnMultipleToNormal() {
        const selectedPending = this.products.filter(p => p.pending && p.selected && !p.reserved);

        if (selectedPending.length === 0) {
            this.showToast('請先勾選要退回的商品', 'error');
            return;
        }

        if (confirm(`確定要將 ${selectedPending.length} 個商品退回到商品目錄嗎？`)) {
            selectedPending.forEach(product => {
                product.pending = false;
                product.customerReserved = false;
                product.selected = false;
                product.publishOrder = null;  // 🔥 清除發布順序
            });

            // 🔥 使用進度條保存
            await this.saveProducts(true);
            this.switchTab('normal');
            this.showToast(`✅ 已退回 ${selectedPending.length} 個商品到商品目錄`, 'success');
        }
    }

    // ========================================
    // Tab & Filter Management
    // ========================================
    switchTab(tab) {
        this.currentTab = tab;
        this.currentPage = 1;

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update button visibility based on tab
        if (tab === 'pending') {
            this.updateBatchReturnButtonVisibility();
        } else {
            this.updatePublishButtonVisibility();
        }

        this.render();
    }

    handleCategoryFilter(category) {
        this.currentCategory = category;
        this.currentPage = 1;

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        this.render();
    }

    handleBranchFilter(branch) {
        this.currentBranch = branch;
        this.currentPage = 1;
        this.render();
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase();
        this.currentPage = 1;
        this.render();
    }

    getFilteredProducts() {
        let filtered = this.products;

        // Tab filter
        if (this.currentTab === 'pending') {
            filtered = filtered.filter(p => p.pending);
        } else {
            filtered = filtered.filter(p => !p.pending);
        }

        // Category filter
        if (this.currentCategory !== '0') {
            filtered = filtered.filter(p => p.category === this.currentCategory);
        }

        // Branch filter
        if (this.currentBranch !== 'all') {
            filtered = filtered.filter(p => p.branch === this.currentBranch);
        }

        // Search filter
        if (this.searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(this.searchQuery) ||
                p.specs.toLowerCase().includes(this.searchQuery) ||
                p.price.toLowerCase().includes(this.searchQuery)
            );
        }

        return filtered;
    }

    // ========================================
    // Rendering
    // ========================================
    render() {
        this.renderProducts();
        this.updateStats();
        this.renderPagination();
    }

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        const emptyState = document.getElementById('emptyState');
        const filtered = this.getFilteredProducts();

        if (filtered.length === 0) {
            grid.innerHTML = '';
            if (emptyState) {
                emptyState.style.display = 'flex';
                const emptyTitle = emptyState.querySelector('h3');
                const emptyText = emptyState.querySelector('p');
                if (emptyTitle && emptyText) {
                    if (this.currentTab === 'pending') {
                        emptyTitle.textContent = 'No Pending Orders';
                        emptyText.textContent = 'Published products will appear here';
                    } else {
                        emptyTitle.textContent = 'No Products Yet';
                        emptyText.textContent = 'Add your first product using the form';
                    }
                }
            }
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        if (emptyState) emptyState.style.display = 'none';

        // Pagination Logic: Slice the array
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedProducts = filtered.slice(startIndex, endIndex);

        grid.innerHTML = paginatedProducts.map(product => {
            const isPending = product.pending;
            const isReserved = product.customerReserved;

            return `
                <div class="product-card ${product.selected ? 'selected' : ''} ${isPending ? 'pending' : ''}">
                    ${!isReserved ? `
                        <div class="product-select">
                            <input type="checkbox" 
                                ${product.selected ? 'checked' : ''} 
                                onchange="productManager.toggleProduct('${product.id}')">
                        </div>
                    ` : ''}
                    
                    <div class="product-header">
                        <div class="product-badges">
                            <span class="badge ${product.category === '1' ? 'badge-warm' : 'badge-frozen'}">
                                ${product.category === '1' ? '🌡️ 常溫' : '❄️ 冷凍'}
                            </span>
                            <span class="badge badge-branch">
                                🏢 ${product.branch || '未設定'}
                            </span>
                            ${product.priority ? '<span class="badge badge-priority">⭐ 優先</span>' : ''}
                            ${isReserved ? '<span class="badge badge-reserved">Reserved</span>' : ''}
                        </div>
                    </div>

                    ${product.image ? `
                        <div class="product-image">
                            <img src="${product.image}" alt="${product.name}">
                        </div>
                    ` : ''}

                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-specs">${product.specs}</p>
                        <p class="product-price">${product.price}</p>
                        <p class="product-quantity">📦 數量：${product.quantity || '未設定'}</p>
                    </div>

                    <div class="product-actions">
                        ${!isPending ? `
                            <button class="btn-icon" onclick="productManager.editProduct('${product.id}')" title="Edit">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="btn-icon" onclick="productManager.deleteProduct('${product.id}')" title="Delete">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        ` : `
                            <button class="btn-small ${isReserved ? 'btn-warning' : 'btn-outline'}" 
                                onclick="productManager.toggleReservation('${product.id}')">
                                ${isReserved ? '取消預約' : '標記預約'}
                            </button>
                            <button class="btn-small btn-outline" onclick="productManager.returnToNormal('${product.id}')">
                                返回列表
                            </button>
                            <button class="btn-small btn-danger" onclick="productManager.deleteProduct('${product.id}')">
                                刪除
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    }
    renderPagination() {
        const filtered = this.getFilteredProducts();
        const totalPages = Math.ceil(filtered.length / this.itemsPerPage);

        const paginationDiv = document.getElementById('paginationControls');
        if (!paginationDiv) return;

        if (totalPages <= 1) {
            paginationDiv.style.display = 'none';
            return;
        }

        paginationDiv.style.display = 'flex';
        // Ensure currentPage is within bounds (in case deletes/filters changed total pages)
        if (this.currentPage > totalPages) {
            this.currentPage = totalPages;
        }
        if (this.currentPage < 1) {
            this.currentPage = 1;
        }

        paginationDiv.innerHTML = `
            <button class="pagination-btn" onclick="productManager.changePage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>
                &laquo; 上一頁
            </button>
            <span class="pagination-info">
                第 ${this.currentPage} 頁 / 共 ${totalPages} 頁 (共 ${filtered.length} 筆)
            </span>
            <button class="pagination-btn" onclick="productManager.changePage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled' : ''}>
                下一頁 &raquo;
            </button>
        `;
    }

    changePage(page) {
        const filtered = this.getFilteredProducts();
        const totalPages = Math.ceil(filtered.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        this.currentPage = page;
        this.render();
        const grid = document.getElementById('productsGrid');
        if (grid) { grid.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }

    updateStats() {
        const total = this.products.filter(p => !p.pending).length;
        const pending = this.products.filter(p => p.pending).length;
        const selected = this.products.filter(p => p.selected).length;

        document.getElementById('totalProducts').textContent = total;
        document.getElementById('pendingProducts').textContent = pending;
        document.getElementById('selectedProducts').textContent = selected;

        document.getElementById('normalCount').textContent = total;
        document.getElementById('pendingCount').textContent = pending;

        document.getElementById('publishCount').textContent = selected;
        document.getElementById('publishBtn').disabled = selected === 0;
    }

    // ========================================
    // Sync to Chrome Extension
    // ========================================
    syncToExtension() {
        const selectedProducts = this.products.filter(p => p.selected && !p.pending);

        if (selectedProducts.length === 0) {
            this.showToast('請先勾選商品', 'error');
            return;
        }

        // Check if chrome.storage is available
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({
                'fbProducts': selectedProducts,
                'syncTime': new Date().toISOString()
            }, () => {
                if (chrome.runtime.lastError) {
                    this.showToast('同步失敗：' + chrome.runtime.lastError.message, 'error');
                } else {
                    this.showToast(`已同步 ${selectedProducts.length} 個商品到擴充功能`, 'success');
                }
            });
        } else {
            this.showToast('請確認已安裝 Chrome 擴充功能', 'error');
        }
    }

    // ========================================
    // Toast Notifications
    // ========================================
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');

        toast.className = `toast show ${type}`;
        toastMessage.textContent = message;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// ========================================
// Initialize App
// ========================================
let productManager;

document.addEventListener('DOMContentLoaded', () => {
    productManager = new ProductManager();
    console.log('System initialized successfully');
});
