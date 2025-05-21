$(document).ready(function() {
    // Инициализация AOS для анимаций при скролле
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });

    // Активация текущего пункта меню
    const currentLocation = window.location.pathname;
    $('.nav-link').each(function() {
        const link = $(this).attr('href');
        if (currentLocation.includes(link)) {
            $(this).addClass('active');
        }
    });

    // Изменение navbar при скролле
    $(window).scroll(function() {
        if ($(window).scrollTop() > 50) {
            $('.navbar').addClass('navbar-scrolled').removeClass('navbar-transparent');
        } else {
            $('.navbar').removeClass('navbar-scrolled').addClass('navbar-transparent');
        }
    });

    // Плавная прокрутка для якорных ссылок
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const target = $(this.hash);
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 90
            }, 800);
        }
    });

    // Кнопка "Наверх"
    const scrollToTopBtn = $('#scrollToTop');
    
    $(window).scroll(function() {
        if ($(window).scrollTop() > 300) {
            scrollToTopBtn.fadeIn();
        } else {
            scrollToTopBtn.fadeOut();
        }
    });

    scrollToTopBtn.click(function() {
        $('html, body').animate({ scrollTop: 0 }, 800);
        return false;
    });

    // Инициализация тултипов и попоперов Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Обработка мобильного меню
    $('.navbar-toggler').click(function() {
        $('body').toggleClass('menu-open');
    });

    // Закрытие мобильного меню при клике на пункт меню
    $('.nav-link').click(function() {
        if ($('body').hasClass('menu-open')) {
            $('.navbar-toggler').click();
        }
    });

    // Обработка форм
    $('form').on('submit', function(e) {
        const form = $(this);
        if (!form.hasClass('no-ajax')) {
            e.preventDefault();
            
            const submitBtn = form.find('button[type="submit"]');
            const originalBtnText = submitBtn.html();
            
            submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Отправка...');
            
            $.ajax({
                url: form.attr('action'),
                method: form.attr('method'),
                data: form.serialize(),
                success: function(response) {
                    if (response.success) {
                        showNotification('success', response.message);
                        form[0].reset();
                    } else {
                        showNotification('danger', response.message || 'Произошла ошибка');
                    }
                },
                error: function() {
                    showNotification('danger', 'Произошла ошибка при отправке формы');
                },
                complete: function() {
                    submitBtn.prop('disabled', false).html(originalBtnText);
                }
            });
        }
    });

    // Функция для показа уведомлений
    function showNotification(type, message) {
        const notification = $(`
            <div class="notification notification-${type}">
                <div class="notification-content">
                    ${message}
                </div>
                <button type="button" class="notification-close">×</button>
            </div>
        `).hide();

        $('.notifications-container').append(notification);
        notification.slideDown();

        setTimeout(() => {
            notification.slideUp(() => notification.remove());
        }, 5000);

        notification.find('.notification-close').click(function() {
            notification.slideUp(() => notification.remove());
        });
    }
});
