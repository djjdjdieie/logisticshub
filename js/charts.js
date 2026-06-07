/**
 * Charts.js - Управление графиками на Dashboard
 */

const chartsModule = {
    charts: {},

    init() {
        try {
            this.renderDashboard();
        } catch (error) {
            console.error('Ошибка инициализации графиков:', error);
        }
    },

    renderDashboard() {
        // Обновление KPI
        this.updateKPI();
        // Создание графиков
        this.createCharts();
        // Обновление таблиц
        this.updateTables();
    },

    // Обновление KPI карточек
    updateKPI() {
        try {
            const products = storage.getProducts();
            const warehouses = storage.getWarehouses();
            const deliveries = storage.getDeliveries();

            const totalProductsEl = document.getElementById('totalProducts');
            const totalWarehousesEl = document.getElementById('totalWarehouses');
            const activeDeliveriesEl = document.getElementById('activeDeliveries');

            if (totalProductsEl) totalProductsEl.textContent = products.length;
            if (totalWarehousesEl) totalWarehousesEl.textContent = warehouses.length;
            if (activeDeliveriesEl) activeDeliveriesEl.textContent = deliveries.filter(d => d.status !== 'Доставлено').length;

            // Мини-графики (sparklines)
            this.createSparklines();
        } catch (error) {
            console.error('Ошибка обновления KPI:', error);
        }
    },

    // Создание мини-графиков
    createSparklines() {
        try {
            const data = [45, 52, 48, 61, 55, 67];

            // Sparkline товаров
            const ctx1 = document.getElementById('sparklineProducts');
            if (ctx1 && ctx1.chart) {
                ctx1.chart.destroy();
            }
            if (ctx1) {
                ctx1.chart = new Chart(ctx1, {
                    type: 'line',
                    data: {
                        labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
                        datasets: [{
                            data: data,
                            borderColor: '#7C3AED',
                            backgroundColor: 'rgba(124, 58, 237, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 0,
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { display: false },
                            y: { display: false, beginAtZero: true }
                        }
                    }
                });
            }

            // Sparkline складов
            const ctx2 = document.getElementById('sparklineWarehouses');
            if (ctx2 && ctx2.chart) {
                ctx2.chart.destroy();
            }
            if (ctx2) {
                ctx2.chart = new Chart(ctx2, {
                    type: 'line',
                    data: {
                        labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
                        datasets: [{
                            data: [30, 32, 31, 35, 33, 37],
                            borderColor: '#06B6D4',
                            backgroundColor: 'rgba(6, 182, 212, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 0,
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { display: false },
                            y: { display: false, beginAtZero: true }
                        }
                    }
                });
            }

            // Sparkline поставок
            const ctx3 = document.getElementById('sparklineDeliveries');
            if (ctx3 && ctx3.chart) {
                ctx3.chart.destroy();
            }
            if (ctx3) {
                ctx3.chart = new Chart(ctx3, {
                    type: 'line',
                    data: {
                        labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
                        datasets: [{
                            data: [5, 6, 5, 7, 6, 8],
                            borderColor: '#8B5CF6',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 0,
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { display: false },
                            y: { display: false, beginAtZero: true }
                        }
                    }
                });
            }

            // Sparkline сотрудников
            const ctx4 = document.getElementById('sparklineEmployees');
            if (ctx4 && ctx4.chart) {
                ctx4.chart.destroy();
            }
            if (ctx4) {
                ctx4.chart = new Chart(ctx4, {
                    type: 'line',
                    data: {
                        labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
                        datasets: [{
                            data: [12, 12, 12, 13, 12, 12],
                            borderColor: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 0,
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { display: false },
                            y: { display: false, beginAtZero: true }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Ошибка создания sparklines:', error);
        }
    },

    // Создание основных графиков
    createCharts() {
        try {
            // Уничтожить старые графики
            if (this.charts.movement) this.charts.movement.destroy();
            if (this.charts.inventory) this.charts.inventory.destroy();

            // Движение товаров
            const movementCtx = document.getElementById('movementChart');
            if (movementCtx) {
                const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];
                const addedData = [45, 52, 48, 61, 55, 67];
                const shippedData = [35, 42, 38, 51, 45, 57];

                this.charts.movement = new Chart(movementCtx, {
                    type: 'line',
                    data: {
                        labels: months,
                        datasets: [
                            {
                                label: 'Добавлено товаров',
                                data: addedData,
                                borderColor: '#7C3AED',
                                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                                fill: true,
                                tension: 0.4,
                                pointBackgroundColor: '#7C3AED',
                                pointBorderColor: '#fff',
                                pointRadius: 6,
                                pointHoverRadius: 8
                            },
                            {
                                label: 'Отправлено товаров',
                                data: shippedData,
                                borderColor: '#06B6D4',
                                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                                fill: true,
                                tension: 0.4,
                                pointBackgroundColor: '#06B6D4',
                                pointBorderColor: '#fff',
                                pointRadius: 6,
                                pointHoverRadius: 8
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                labels: { color: 'rgba(255, 255, 255, 0.7)', padding: 20 }
                            }
                        },
                        scales: {
                            y: {
                                ticks: { color: 'rgba(255, 255, 255, 0.5)' },
                                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                beginAtZero: true
                            },
                            x: {
                                ticks: { color: 'rgba(255, 255, 255, 0.5)' },
                                grid: { color: 'rgba(255, 255, 255, 0.1)' }
                            }
                        }
                    }
                });
            }

            // Остатки товаров
            const inventoryCtx = document.getElementById('inventoryChart');
            if (inventoryCtx) {
                const categories = ['Электроника', 'Одежда', 'Продукты', 'Мебель', 'Прочее'];
                const products = storage.getProducts();
                
                const categoryData = categories.map(cat => 
                    products.filter(p => p.category === cat).length
                );

                this.charts.inventory = new Chart(inventoryCtx, {
                    type: 'doughnut',
                    data: {
                        labels: categories,
                        datasets: [{
                            data: categoryData,
                            backgroundColor: [
                                '#7C3AED',
                                '#8B5CF6',
                                '#06B6D4',
                                '#00D9FF',
                                '#A78BFA'
                            ],
                            borderColor: 'rgba(15, 23, 42, 1)',
                            borderWidth: 3
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                labels: { color: 'rgba(255, 255, 255, 0.7)', padding: 20 }
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Ошибка создания графиков:', error);
        }
    },

    // Обновление таблиц
    updateTables(filterQuery = '') {
        try {
            const query = filterQuery.toLowerCase();

            // Последние поставки
            let deliveries = storage.getDeliveries()
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            if (query) {
                deliveries = deliveries.filter(d =>
                    d.number.toLowerCase().includes(query) ||
                    d.supplier.toLowerCase().includes(query) ||
                    d.warehouse.toLowerCase().includes(query) ||
                    d.status.toLowerCase().includes(query)
                );
            }

            deliveries = deliveries.slice(0, 5);

            const deliveriesTable = document.getElementById('recentDeliveries');
            if (deliveriesTable) {
                if (deliveries.length === 0) {
                    deliveriesTable.innerHTML = '<tr><td colspan="5" class="empty-state">Нет поставок</td></tr>';
                } else {
                    deliveriesTable.innerHTML = deliveries.map(d => {
                        let statusClass = '';
                        if (d.status === 'Доставлено') statusClass = 'status-delivered';
                        else if (d.status === 'В пути') statusClass = 'status-transit';
                        else if (d.status === 'Обработка') statusClass = 'status-processing';

                        return `
                            <tr>
                                <td><strong>${this.escapeHtml(d.number)}</strong></td>
                                <td>${this.escapeHtml(d.supplier)}</td>
                                <td>${this.escapeHtml(d.warehouse)}</td>
                                <td>${new Date(d.date).toLocaleDateString('ru-RU')}</td>
                                <td><span class="status-badge ${statusClass}">${this.escapeHtml(d.status)}</span></td>
                            </tr>
                        `;
                    }).join('');
                }
            }

            // Популярные товары
            let popularProducts = storage.getProducts()
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5);

            if (query) {
                popularProducts = popularProducts.filter(p =>
                    p.name.toLowerCase().includes(query) ||
                    p.category.toLowerCase().includes(query) ||
                    p.warehouse.toLowerCase().includes(query) ||
                    p.status.toLowerCase().includes(query)
                );
            }

            const productsTable = document.getElementById('popularProducts');
            if (productsTable) {
                if (popularProducts.length === 0) {
                    productsTable.innerHTML = '<tr><td colspan="5" class="empty-state">Нет товаров</td></tr>';
                } else {
                    productsTable.innerHTML = popularProducts.map(p => `
                        <tr>
                            <td>${this.escapeHtml(p.name)}</td>
                            <td>${this.escapeHtml(p.category)}</td>
                            <td>${p.quantity}</td>
                            <td>${this.escapeHtml(p.warehouse)}</td>
                            <td>
                                <span class="status-badge ${this.getStatusClass(p.status)}">${this.escapeHtml(p.status)}</span>
                            </td>
                        </tr>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Ошибка обновления таблиц:', error);
        }
    },

    getStatusClass(status) {
        if (status === 'В наличии') return 'status-delivered';
        if (status === 'Низкий запас') return 'status-transit';
        if (status === 'Отсутствует') return 'status-processing';
        return '';
    },

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
};

// Инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('movementChart')) {
            chartsModule.init();
        }
    });
} else {
    if (document.getElementById('movementChart')) {
        chartsModule.init();
    }
}
