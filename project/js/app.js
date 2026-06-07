/**
 * App.js - Основное приложение
 * Управление интерфейсом, модальными окнами, уведомлениями
 */

const app = {
    initialized: false,
    
    // Инициализация приложения
    init() {
        if (this.initialized) return;
        this.initialized = true;
        
        try {
            this.updateCurrentDate();
            this.setupTheme();
            this.setupEventListeners();
            this.setupSidebarToggle();
            this.setupSearch();
            this.checkLoginState();
            this.animateCounters();
            setInterval(() => this.updateCurrentDate(), 60000);
        } catch (error) {
            console.error('Ошибка инициализации приложения:', error);
        }
    },

    // Обновление текущей даты
    updateCurrentDate() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date().toLocaleDateString('ru-RU', options);
        const elements = document.querySelectorAll('#currentDate');
        elements.forEach(el => el.textContent = date);
    },

    // Настройка темы
    setupTheme() {
        const themeToggles = document.querySelectorAll('#theme-toggle');
        if (themeToggles.length === 0) return;

        document.body.classList.remove('light-theme');
        themeToggles.forEach(toggle => {
            toggle.textContent = '🌙';
            toggle.style.cursor = 'default';
        });

        const primaryColor = storage.getSetting('primaryColor', '#7C3AED');
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        this.syncThemeControls();
    },

    applyTheme() {
        document.body.classList.remove('light-theme');
    },

    syncThemeControls() {
        const darkToggle = document.getElementById('darkThemeToggle');
        if (darkToggle) {
            darkToggle.checked = true;
            darkToggle.disabled = true;
        }

        const themeToggles = document.querySelectorAll('#theme-toggle');
        themeToggles.forEach(toggle => {
            toggle.textContent = '🌙';
        });
    },

    // Установка слушателей событий
    setupEventListeners() {
        // Закрытие модального окна при клике на фон
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
                this.closeModal(e.target.id);
            }
        }, true);

        // Клавиша Escape для закрытия модальных окон
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModals = document.querySelectorAll('.modal.active');
                if (activeModals.length > 0) {
                    this.closeModal(activeModals[activeModals.length - 1].id);
                }
            }
        });

        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.login(e));
        }

        const navLinks = document.querySelectorAll('.sidebar-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.closeSidebar();
                }
            });
        });
    },

    setupSidebarToggle() {
        const topBar = document.querySelector('.top-bar');
        const sidebar = document.querySelector('.sidebar');
        if (!topBar || !sidebar) return;

        if (!document.querySelector('.sidebar-toggle-btn')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'sidebar-toggle-btn';
            btn.setAttribute('aria-label', 'Открыть меню');
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-controls', 'sidebar');
            btn.textContent = '☰';
            topBar.prepend(btn);
            btn.addEventListener('click', () => this.toggleSidebar(btn));
        }

        if (!document.querySelector('.sidebar-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'sidebar-backdrop';
            backdrop.addEventListener('click', () => this.closeSidebar());
            document.body.appendChild(backdrop);
        }

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeSidebar();
            }
        });
    },

    toggleSidebar(button) {
        const isOpen = document.body.classList.toggle('sidebar-open');
        if (button) {
            button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
    },

    closeSidebar() {
        document.body.classList.remove('sidebar-open');
        const button = document.querySelector('.sidebar-toggle-btn');
        if (button) {
            button.setAttribute('aria-expanded', 'false');
        }
    },

    // =============== МОДАЛЬНЫЕ ОКНА ===============

    openModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    },

    // Функция подтверждения
    confirm(title, message, callback) {
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        const btn = document.getElementById('confirmBtn');
        
        if (!titleEl || !messageEl || !btn) return;
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', () => {
            try {
                callback();
            } catch (error) {
                console.error('Ошибка при выполнении callback:', error);
                this.showToast('Произошла ошибка', 'error');
            } finally {
                this.closeModal('confirmModal');
            }
        });

        this.openModal('confirmModal');
    },

    // Показать загрузку
    showLoading(text = 'Загрузка...') {
        const loadingText = document.getElementById('loadingText');
        if (loadingText) {
            loadingText.textContent = text;
            this.openModal('loadingModal');
        }
    },

    // Скрыть загрузку
    hideLoading() {
        this.closeModal('loadingModal');
    },

    setupSearch() {
        const searchInput = document.getElementById('dashboardSearch');
        if (!searchInput) return;

        searchInput.addEventListener('input', () => {
            if (typeof chartsModule !== 'undefined' && chartsModule.updateTables) {
                chartsModule.updateTables(searchInput.value.trim());
            }
        });
    },

    checkLoginState() {
        const isLoggedIn = storage.getSetting('loggedIn', false);
        if (!isLoggedIn) {
            this.openLoginPanel();
        }
    },

    openLoginPanel() {
        const panel = document.getElementById('loginPanel');
        if (panel) {
            panel.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    closeLoginPanel() {
        const panel = document.getElementById('loginPanel');
        if (panel) {
            panel.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    },

    login(event) {
        if (event) event.preventDefault();
        const username = document.getElementById('loginUsername')?.value.trim();
        const password = document.getElementById('loginPassword')?.value.trim();

        const validUsers = {
            '123': '123'
        };

        if (!username || !password) {
            this.showToast('Введите логин и пароль', 'warning');
            return;
        }

        if (validUsers[username] === password) {
            storage.saveSetting('loggedIn', true);
            this.closeLoginPanel();
            this.showToast(`Добро пожаловать, ${username}!`, 'success');
            return;
        }

        this.showToast('Неверный логин или пароль', 'error');
    },

    // =============== УВЕДОМЛЕНИЯ (TOAST) ===============

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠'
        };

        const escape = (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${escape(message)}</span>
            <button class="toast-close">✕</button>
        `;

        container.appendChild(toast);
        
        // Ограничить количество тостов
        const toasts = container.querySelectorAll('.toast');
        if (toasts.length > 5) {
            toasts[0].classList.add('removing');
            setTimeout(() => toasts[0].remove(), 300);
        }

        const closeToast = () => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        };

        toast.querySelector('.toast-close').addEventListener('click', closeToast);

        setTimeout(() => {
            if (toast.parentNode) {
                closeToast();
            }
        }, 4000);
    },

    // =============== АНИМАЦИЯ СЧЁТЧИКОВ ===============

    animateCounters() {
        const elements = document.querySelectorAll('[data-counter]');
        elements.forEach(el => {
            const target = parseInt(el.textContent);
            const duration = 1000;
            const start = 0;
            const increment = target / (duration / 16);

            let current = start;

            const counter = setInterval(() => {
                current += increment;
                if (current >= target) {
                    el.textContent = target;
                    clearInterval(counter);
                } else {
                    el.textContent = Math.floor(current);
                }
            }, 16);
        });
    },

    // =============== РАЗЛОГИРОВАНИЕ ===============

    logout() {
        this.confirm(
            'Выход из системы',
            'Вы уверены, что хотите выйти?',
            () => {
                storage.saveSetting('loggedIn', false);
                this.showToast('Вы вышли из системы', 'info');
                setTimeout(() => {
                    location.href = 'index.html';
                }, 1500);
            }
        );
    }
};

// Инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}
