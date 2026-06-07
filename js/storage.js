/**
 * Storage.js - Управление данными в LocalStorage
 * Все операции с товарами, складами и поставками
 */

const storage = {
    // Инициализация с примерными данными
    init() {
        try {
            if (!localStorage.getItem('logisticshub_init')) {
                this.initSampleData();
                localStorage.setItem('logisticshub_init', 'true');
            }
        } catch (error) {
            console.error('Ошибка инициализации localStorage:', error);
            alert('Ошибка: браузер не поддерживает LocalStorage или переполнен.');
        }
    },

    // Инициализация примерных данных
    initSampleData() {
        // Примерные склады
        const warehouses = [
            { id: this.generateId(), name: 'Основной', address: 'Москва, ул. Примерная 1', capacity: 100, type: 'Основной', description: 'Главный распределительный центр' },
            { id: this.generateId(), name: 'Резервный', address: 'Тверь, ул. Центральная 5', capacity: 50, type: 'Резервный', description: 'Резервный склад' },
            { id: this.generateId(), name: 'Восточный', address: 'Казань, ул. Советская 10', capacity: 75, type: 'Основной', description: 'Восточный филиал' }
        ];

        // Примерные товары
        const products = [
            { id: this.generateId(), name: 'Ноутбук HP Pavilion', category: 'Электроника', quantity: 15, warehouseId: warehouses[0].id, warehouse: 'Основной', dateAdded: new Date().toISOString().split('T')[0], status: 'В наличии', description: 'Портативный компьютер' },
            { id: this.generateId(), name: 'Футболка XL', category: 'Одежда', quantity: 42, warehouseId: warehouses[0].id, warehouse: 'Основной', dateAdded: new Date().toISOString().split('T')[0], status: 'В наличии', description: 'Хлопчатобумажная футболка' },
            { id: this.generateId(), name: 'Кофе зёрна 1кг', category: 'Продукты', quantity: 8, warehouseId: warehouses[1].id, warehouse: 'Резервный', dateAdded: new Date().toISOString().split('T')[0], status: 'Низкий запас', description: 'Натуральный кофе' },
            { id: this.generateId(), name: 'Стол офисный', category: 'Мебель', quantity: 5, warehouseId: warehouses[2].id, warehouse: 'Восточный', dateAdded: new Date().toISOString().split('T')[0], status: 'В наличии', description: 'Письменный стол' },
            { id: this.generateId(), name: 'Смартфон Samsung', category: 'Электроника', quantity: 0, warehouseId: warehouses[0].id, warehouse: 'Основной', dateAdded: new Date().toISOString().split('T')[0], status: 'Отсутствует', description: 'Мобильный телефон' }
        ];

        // Примерные поставки
        const deliveries = [
            { id: this.generateId(), number: 'DEL-001', supplier: 'ООО Электроника+', warehouse: 'Основной', date: new Date().toISOString().split('T')[0], status: 'Доставлено', quantity: 20, notes: 'Полная поставка' },
            { id: this.generateId(), number: 'DEL-002', supplier: 'ЗАО Ткани мира', warehouse: 'Основной', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'В пути', quantity: 50, notes: '' },
            { id: this.generateId(), number: 'DEL-003', supplier: 'Кофейная компания', warehouse: 'Резервный', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Обработка', quantity: 30, notes: 'Ожидание отправки' }
        ];

        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('warehouses', JSON.stringify(warehouses));
        localStorage.setItem('deliveries', JSON.stringify(deliveries));
    },

    // Генерация уникального ID
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Безопасное получение из localStorage
    safeGet(key, defaultValue = []) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Ошибка при чтении ${key}:`, error);
            return defaultValue;
        }
    },

    // Безопасное сохранение в localStorage
    safeSave(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Ошибка при сохранении ${key}:`, error);
            if (error.name === 'QuotaExceededError') {
                alert('Местоположение переполнено. Удалите некоторые данные.');
            }
            return false;
        }
    },

    // =============== ТОВАРЫ ===============

    getProducts() {
        return this.safeGet('products', []);
    },

    getProduct(id) {
        if (!id) return null;
        const products = this.getProducts();
        return products.find(p => p.id === id) || null;
    },

    addProduct(data) {
        if (!data || !data.name || !data.quantity) {
            console.error('Ошибка: некорректные данные товара');
            return null;
        }

        const products = this.getProducts();
        const product = {
            id: this.generateId(),
            ...data,
            warehouseId: this.getWarehouses().find(w => w.name === data.warehouse)?.id || '',
            dateAdded: new Date().toISOString().split('T')[0],
            status: data.quantity > 5 ? 'В наличии' : (data.quantity > 0 ? 'Низкий запас' : 'Отсутствует')
        };
        products.push(product);
        this.safeSave('products', products);
        return product;
    },

    updateProduct(id, data) {
        if (!id) return false;
        
        let products = this.getProducts();
        let found = false;

        products = products.map(p => {
            if (p.id === id) {
                found = true;
                return {
                    ...p,
                    ...data,
                    status: data.quantity > 5 ? 'В наличии' : (data.quantity > 0 ? 'Низкий запас' : 'Отсутствует')
                };
            }
            return p;
        });

        if (found) {
            this.safeSave('products', products);
        }
        return found;
    },

    deleteProduct(id) {
        if (!id) return false;

        let products = this.getProducts();
        const initialLength = products.length;
        products = products.filter(p => p.id !== id);

        if (products.length < initialLength) {
            this.safeSave('products', products);
            return true;
        }
        return false;
    },

    getProductsByWarehouse(warehouseId) {
        if (!warehouseId) return [];
        return this.getProducts().filter(p => p.warehouseId === warehouseId);
    },

    // =============== СКЛАДЫ ===============

    getWarehouses() {
        return this.safeGet('warehouses', []);
    },

    getWarehouse(id) {
        if (!id) return null;
        const warehouses = this.getWarehouses();
        return warehouses.find(w => w.id === id) || null;
    },

    addWarehouse(data) {
        if (!data || !data.name || !data.capacity) {
            console.error('Ошибка: некорректные данные склада');
            return null;
        }

        const warehouses = this.getWarehouses();
        const warehouse = {
            id: this.generateId(),
            ...data
        };
        warehouses.push(warehouse);
        this.safeSave('warehouses', warehouses);
        return warehouse;
    },

    updateWarehouse(id, data) {
        if (!id) return false;

        let warehouses = this.getWarehouses();
        let found = false;

        warehouses = warehouses.map(w => {
            if (w.id === id) {
                found = true;
                return { ...w, ...data };
            }
            return w;
        });

        if (found) {
            this.safeSave('warehouses', warehouses);
        }
        return found;
    },

    deleteWarehouse(id) {
        if (!id) return false;

        let warehouses = this.getWarehouses();
        const initialLength = warehouses.length;
        warehouses = warehouses.filter(w => w.id !== id);

        if (warehouses.length < initialLength) {
            this.safeSave('warehouses', warehouses);
            return true;
        }
        return false;
    },

    // =============== ПОСТАВКИ ===============

    getDeliveries() {
        return this.safeGet('deliveries', []);
    },

    getDelivery(id) {
        if (!id) return null;
        const deliveries = this.getDeliveries();
        return deliveries.find(d => d.id === id) || null;
    },

    addDelivery(data) {
        if (!data || !data.supplier || !data.date) {
            console.error('Ошибка: некорректные данные поставки');
            return null;
        }

        const deliveries = this.getDeliveries();
        const number = 'DEL-' + String(deliveries.length + 1).padStart(3, '0');
        const delivery = {
            id: this.generateId(),
            number: number,
            ...data
        };
        deliveries.push(delivery);
        this.safeSave('deliveries', deliveries);
        return delivery;
    },

    updateDelivery(id, data) {
        if (!id) return false;

        let deliveries = this.getDeliveries();
        let found = false;

        deliveries = deliveries.map(d => {
            if (d.id === id) {
                found = true;
                return { ...d, ...data };
            }
            return d;
        });

        if (found) {
            this.safeSave('deliveries', deliveries);
        }
        return found;
    },

    deleteDelivery(id) {
        if (!id) return false;

        let deliveries = this.getDeliveries();
        const initialLength = deliveries.length;
        deliveries = deliveries.filter(d => d.id !== id);

        if (deliveries.length < initialLength) {
            this.safeSave('deliveries', deliveries);
            return true;
        }
        return false;
    },

    // =============== НАСТРОЙКИ ===============

    saveSetting(key, value) {
        if (!key) return false;
        const settings = this.safeGet('settings', {});
        settings[key] = value;
        return this.safeSave('settings', settings);
    },

    getSetting(key, defaultValue) {
        if (!key) return defaultValue;
        const settings = this.safeGet('settings', {});
        return settings[key] !== undefined ? settings[key] : defaultValue;
    }
};

// Инициализация при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => storage.init());
} else {
    storage.init();
}
