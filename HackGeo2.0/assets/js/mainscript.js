// переключатель темы
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

// адаптация
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
        document.querySelector('.wrap-main-menu').classList.remove('active');
        document.querySelector('.backgroundmenu').style.display = 'none';
    }
}

// тема из localstorage
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');

        const checkbox = document.getElementById('theme-toggle-checkbox');
        if (checkbox) {
            checkbox.checked = true;
        }
    }
    
    const themeToggle = document.getElementById('theme-toggle-checkbox');
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleBrightMode);
    }
    
    checkScreenSize();
    
    document.getElementById('main-menu-button').addEventListener('click', function() {
        document.querySelector('.wrap-main-menu').classList.toggle('active');
        document.querySelector('.backgroundmenu').style.display = 
            document.querySelector('.wrap-main-menu').classList.contains('active') ? 'block' : 'none';
    });
    
    // закрыть меню при клике на фон
    document.querySelector('.backgroundmenu').addEventListener('click', function() {
        document.querySelector('.wrap-main-menu').classList.remove('active');
        this.style.display = 'none';
    });
});


function checkAuth() {
    // доделать
    return localStorage.getItem('isAuthenticated') === 'true';
}

// доделать
function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const isAuthenticated = checkAuth();

    if (isAuthenticated) {
        authButtons.style.display = 'none';
        userProfile.style.display = 'block';
        const userName = localStorage.getItem('userName') || 'Пользователь';
        document.querySelector('.profile-name').textContent = userName;
    } else {
        authButtons.style.display = 'flex';
        userProfile.style.display = 'none';
    }
}

function setupProfileDropdown() {
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });
    }
}

//signout
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

// Отслеживаем изменение размера окна
window.addEventListener('resize', checkScreenSize);

// // Переключение темы
// document.addEventListener('DOMContentLoaded', function() {
//     const themeToggle = document.getElementById('theme-toggle-checkbox');
    
//     // Проверка сохраненной темы
//     if (localStorage.getItem('theme') === 'dark') {
//         document.body.classList.add('dark-mode');
//         themeToggle.checked = true;
//     }
    
//     // Обработчик переключения темы
//     themeToggle.addEventListener('change', function() {
//         document.body.classList.toggle('dark-mode');
        
//         if (document.body.classList.contains('dark-mode')) {
//             localStorage.setItem('theme', 'dark');
//         } else {
//             localStorage.setItem('theme', 'light');
//         }
//     });
    
//     // Имитация авторизации (для демонстрации)
//     const authButtons = document.getElementById('auth-buttons');
//     const userProfile = document.getElementById('user-profile');
    
//     // Проверка авторизации
//     if (localStorage.getItem('isAuthenticated') === 'true') {
//         authButtons.style.display = 'none';
//         userProfile.style.display = 'block';
//         const userName = localStorage.getItem('userName') || 'Пользователь';
//         document.querySelector('.profile-name').textContent = userName;
//     }
    
//     // Обработчик выхода
//     const logoutBtn = document.getElementById('logout-btn');
//     if (logoutBtn) {
//         logoutBtn.addEventListener('click', () => {
//             localStorage.removeItem('isAuthenticated');
//             localStorage.removeItem('userName');
//             window.location.href = '/signin.html';
//         });
//     }
// });
