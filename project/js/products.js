/**
 * Products.js - Управление товарами
 */

const products = {
    currentEditId: null,
    sortField: 'name',
    sortDirection: 'asc',

    init() {
        const form = document.getElementById('productForm');
        const searchInput = document.getElementById('productSearch');
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        const warehouseFilter = document.getElementById('warehouseFilter');

        if (!form || !searchInput) return;

        this.render();
        
        form.addEventListener('submit', (e) => this.save(e));
        searchInput.addEventListener('input', () => this.render());
        categoryFilter?.addEventListener('change', () => this.render());
        statusFilter?.addEventListener('change', () => this.render());
        warehouseFilter?.addEventListener('change', () => this.render());
    },

    // Валидация формы
    validateForm() {
        const name = document.getElementById('productName').value.trim();
        const category = document.getElementById('productCategory').value;
        const quantity = document.getElementById('productQuantity').value;
        const warehouse = document.getElementById('productWarehouse').value;

        if (!name || name.length < 2) {
            app.showToast('Название товара должно быть минимум 2 символа', 'error');
            return false;
        }

        if (!category) {
            app.showToast('Выберите категорию', 'error');
            return false;
        }

        if (quantity === '' || quantity < 0) {
            app.showToast('Количество должно быть положительным числом', 'error');
            return false;
        }

        if (!warehouse) {
            app.showToast('Выберите склад', 'error');
            return false;
        }

        return true;
    },

    // Открыть модальное окно для добавления товара
    openAddModal() {
        this.currentEditId = null;
        document.getElementById('productForm').reset();
        document.getElementById('productModalTitle').textContent = 'Добавить товар';
        app.openModal('productModal');
    },

    // Редактирование товара
    editProduct(id) {
        const product = storage.getProduct(id);
        if (!product) return;

        this.currentEditId = id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('productWarehouse').value = product.warehouse;
        document.getElementById('productStatus').value = product.status;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productModalTitle').textContent = 'Редактировать товар';
        app.openModal('productModal');
    },

    // Сохранение товара
    save(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        const data = {
            name: document.getElementById('productName').value.trim(),
            category: document.getElementById('productCategory').value,
            quantity: parseInt(document.getElementById('productQuantity').value),
            warehouse: document.getElementById('productWarehouse').value,
            description: document.getElementById('productDescription').value.trim()
        };

        try {
            if (this.currentEditId) {
                const result = storage.updateProduct(this.currentEditId, data);
                if (result) {
                    app.showToast('Товар обновлен', 'success');
                } else {
                    app.showToast('Ошибка при обновлении товара', 'error');
                    return;
                }
            } else {
                const result = storage.addProduct(data);
                if (result) {
                    app.showToast('Товар добавлен', 'success');
                } else {
                    app.showToast('Ошибка при добавлении товара', 'error');
                    return;
                }
            }

            app.closeModal('productModal');
            this.render();
        } catch (error) {
            console.error('Ошибка при сохранении товара:', error);
            app.showToast('Произошла ошибка', 'error');
        }
    },

    // Удаление товара
    deleteProduct(id) {
        if (!id) {
            app.showToast('Ошибка: некорректный ID товара', 'error');
            return;
        }

        app.confirm('Удалить товар?', 'Это действие нельзя отменить', () => {
            try {
                const result = storage.deleteProduct(id);
                if (result) {
                    app.showToast('Товар удален', 'success');
                    this.render();
                } else {
                    app.showToast('Ошибка при удалении товара', 'error');
                }
            } catch (error) {
                console.error('Ошибка при удалении товара:', error);
                app.showToast('Произошла ошибка', 'error');
            }
        });
    },

    // Просмотр деталей товара
    viewProductDetails(id) {
        const product = storage.getProduct(id);
        if (!product) return;

        const content = `
            <div class="details-grid">
                <div class="detail-item">
                    <div class="detail-label">ID</div>
                    <div class="detail-value">${product.id}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Название</div>
                    <div class="detail-value">${product.name}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Категория</div>
                    <div class="detail-value">${product.category}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Количество</div>
                    <div class="detail-value">${product.quantity} шт</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Склад</div>
                    <div class="detail-value">${product.warehouse}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Дата добавления</div>
                    <div class="detail-value">${new Date(product.dateAdded).toLocaleDateString('ru-RU')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Статус</div>
                    <div class="detail-value">
                        <span class="status-badge ${this.getStatusClass(product.status)}">${product.status}</span>
                    </div>
                </div>
                ${product.description ? `
                <div class="detail-item">
                    <div class="detail-label">Описание</div>
                    <div class="detail-value">${product.description}</div>
                </div>
                ` : ''}
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="app.closeModal('productDetailsModal')">Закрыть</button>
                <button class="btn btn-primary" onclick="products.editProduct('${id}')">Редактировать</button>
            </div>
        `;

        document.getElementById('detailsContent').innerHTML = content;
        app.openModal('productDetailsModal');
    },

    // Сортировка
    sort(field) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }
        this.render();
    },

    // Отрисовка таблицы товаров
    render() {
        try {
            const searchInput = document.getElementById('productSearch');
            const categoryFilter = document.getElementById('categoryFilter');
            const statusFilter = document.getElementById('statusFilter');
            const warehouseFilter = document.getElementById('warehouseFilter');
            const table = document.getElementById('productsTable');

            if (!table) return;

            const search = searchInput ? searchInput.value.toLowerCase() : '';
            const category = categoryFilter ? categoryFilter.value : '';
            const status = statusFilter ? statusFilter.value : '';
            const warehouse = warehouseFilter ? warehouseFilter.value : '';

            let items = storage.getProducts();

            // Фильтрация
            items = items.filter(p =>
                (p.name.toLowerCase().includes(search) || p.id.includes(search)) &&
                (!category || p.category === category) &&
                (!status || p.status === status) &&
                (!warehouse || p.warehouse === warehouse)
            );

            // Сортировка
            items.sort((a, b) => {
                let aVal = a[this.sortField];
                let bVal = b[this.sortField];

                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }

                if (this.sortDirection === 'asc') {
                    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                } else {
                    return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
                }
            });

            if (items.length === 0) {
                table.innerHTML = '<tr><td colspan="8" class="empty-state">Нет товаров. Добавьте первый товар!</td></tr>';
                return;
            }

            table.innerHTML = items.map(p => `
                <tr onclick="products.viewProductDetails('${this.escapeHtml(p.id)}')" style="cursor: pointer;">
                    <td><strong>${this.escapeHtml(p.id.substring(0, 8))}</strong></td>
                    <td>${this.escapeHtml(p.name)}</td>
                    <td>${this.escapeHtml(p.category)}</td>
                    <td>${p.quantity}</td>
                    <td>${this.escapeHtml(p.warehouse)}</td>
                    <td>${new Date(p.dateAdded).toLocaleDateString('ru-RU')}</td>
                    <td>
                        <span class="status-badge ${this.getStatusClass(p.status)}">${this.escapeHtml(p.status)}</span>
                    </td>
                    <td class="action-cell" onclick="event.stopPropagation();">
                        <button class="action-btn" onclick="products.editProduct('${this.escapeHtml(p.id)}')" title="Редактировать">✏️</button>
                        <button class="action-btn danger" onclick="products.deleteProduct('${this.escapeHtml(p.id)}')" title="Удалить">🗑️</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Ошибка при отрисовке таблицы товаров:', error);
            app.showToast('Ошибка при загрузке товаров', 'error');
        }
    },

    // Экранирование HTML
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    // Получить класс статуса
    getStatusClass(status) {
        if (status === 'В наличии') return 'status-delivered';
        if (status === 'Низкий запас') return 'status-transit';
        if (status === 'Отсутствует') return 'status-processing';
        return '';
    }
};

// Инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('productsTable')) {
            products.init();
        }
    });
} else {
    if (document.getElementById('productsTable')) {
        products.init();
    }
}
