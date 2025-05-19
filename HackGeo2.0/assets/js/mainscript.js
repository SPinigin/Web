// Функция переключения темы
function toggleBrightMode() {
    document.body.classList.toggle('dark-mode');
    
    const checkbox = document.getElementById('theme-toggle-checkbox');
    if (checkbox) {
        checkbox.checked = document.body.classList.contains('dark-mode');
    }
    
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

// Функция для проверки размера экрана и адаптации меню
function checkScreenSize() {
    const isMobile = window.innerWidth <= 992;
    const menuButton = document.getElementById('main-menu-button');
    const horizontalMenu = document.querySelector('.horizontal-menu');
    
    if (isMobile) {
        if (horizontalMenu) horizontalMenu.style.display = 'none';
        if (menuButton) menuButton.style.display = 'block';
    } else {
        if (horizontalMenu) horizontalMenu.style.display = 'flex';
        if (menuButton) menuButton.style.display = 'none';
        // Закрываем мобильное меню если оно было открыто
        document.querySelector('.wrap-main-menu').classList.remove('active');
        document.querySelector('.backgroundmenu').style.display = 'none';
    }
}

// Проверяем предпочтение пользователя при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Применяем сохраненную тему
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        
        // Обновляем состояние чекбокса
        const checkbox = document.getElementById('theme-toggle-checkbox');
        if (checkbox) {
            checkbox.checked = true;
        }
    }
    
    // Добавляем обработчик для переключателя темы
    const themeToggle = document.getElementById('theme-toggle-checkbox');
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleBrightMode);
    }
    
    // Инициализация проверки размера экрана
    checkScreenSize();
    
    // Обработчик для кнопки меню
    document.getElementById('main-menu-button').addEventListener('click', function() {
        document.querySelector('.wrap-main-menu').classList.toggle('active');
        document.querySelector('.backgroundmenu').style.display = 
            document.querySelector('.wrap-main-menu').classList.contains('active') ? 'block' : 'none';
    });
    
    // Закрытие меню при клике на фон
    document.querySelector('.backgroundmenu').addEventListener('click', function() {
        document.querySelector('.wrap-main-menu').classList.remove('active');
        this.style.display = 'none';
    });
});

// Функция для проверки авторизации пользователя
function checkAuth() {
    // Здесь должна быть проверка авторизации через ваш бэкенд
    // Пока используем localStorage для демонстрации
    return localStorage.getItem('isAuthenticated') === 'true';
}

// Функция для обновления UI в зависимости от статуса авторизации
function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const isAuthenticated = checkAuth();

    if (isAuthenticated) {
        authButtons.style.display = 'none';
        userProfile.style.display = 'block';
        
        // Обновляем имя пользователя
        const userName = localStorage.getItem('userName') || 'Пользователь';
        document.querySelector('.profile-name').textContent = userName;
    } else {
        authButtons.style.display = 'flex';
        userProfile.style.display = 'none';
    }
}

// Обработчик для выпадающего меню профиля
function setupProfileDropdown() {
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        // Закрытие при клике вне меню
        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });
    }
}

// Обработчик для кнопки выхода
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Здесь должен быть запрос на выход через ваш бэкенд
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userName');
            window.location.href = '/signin.html';
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Существующий код...

    // Добавляем новые инициализации
    updateAuthUI();
    setupProfileDropdown();
    setupLogout();
});


// Отслеживаем изменение размера окна
window.addEventListener('resize', checkScreenSize);
