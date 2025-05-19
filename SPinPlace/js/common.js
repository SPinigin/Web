document.addEventListener('DOMContentLoaded', function() {
    // Обработчики для мобильного меню
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    // Проверяем наличие необходимых элементов перед добавлением обработчиков событий
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
        });
    }
    
    if (mobileMenuClose && mobileMenu) {
        mobileMenuClose.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = ''; // Разблокируем прокрутку страницы
        });
    }
    
    // Закрытие меню при клике на пункт меню
    const mobileMenuItems = document.querySelectorAll('.mobile-menu-items a');
    if (mobileMenuItems && mobileMenuItems.length > 0 && mobileMenu) {
        mobileMenuItems.forEach(item => {
            item.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
    
    // Закрытие меню при клике вне его области
    if (mobileMenu && mobileMenuToggle) {
        document.addEventListener('click', function(e) {
            if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target) && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Код для активной ссылки меню
    const currentLocation = window.location.pathname;
    const menuItems = document.querySelectorAll('.menu a, .mobile-menu-items a');
    
    if (menuItems && menuItems.length > 0) {
        menuItems.forEach(item => {
            const href = item.getAttribute('href');
            if (currentLocation.includes(href) || 
                (currentLocation === '/' && href === 'index.html')) {
                item.classList.add('active');
            }
        });
    }
    
    // Плавная прокрутка для ссылок
    const anchors = document.querySelectorAll('a[href^="#"]');
    if (anchors && anchors.length > 0) {
        anchors.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId !== '#' && document.querySelector(targetId)) {
                    e.preventDefault();
                    document.querySelector(targetId).scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
});
