// Дата и время мероприятия
const eventDate = new Date('2026-02-15T15:00:00');
const eventLocation = 'Бар «Инкогнито», Орджоникидзе, 63а';

// Функция обновления счетчика
function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate.getTime() - now;

    if (distance < 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
}

// Обновляем счетчик каждую минуту
updateCountdown();
setInterval(updateCountdown, 60000);

// Определение устройства и добавление в календарь
function detectDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Android
    if (/android/i.test(userAgent)) {
        return 'android';
    }
    
    // iOS
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'ios';
    }
    
    // Desktop (Google Calendar)
    return 'desktop';
}

// Форматирование даты для календаря
function formatDateForCalendar(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}00`;
}

// Создание ICS файла для календаря
function createICSFile() {
    const startDate = formatDateForCalendar(eventDate);
    const endDate = formatDateForCalendar(new Date(eventDate.getTime() + 3 * 60 * 60 * 1000)); // +3 часа
    
    const title = 'Wedding AfterParty';
    const location = eventLocation;
    const description = 'Приглашение на свадебную вечеринку';
    
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Wedding AfterParty//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${title}`,
        `LOCATION:${location}`,
        `DESCRIPTION:${description}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');
    
    return icsContent;
}

// Создание ссылки для добавления в календарь
function createCalendarLink() {
    const device = detectDevice();
    const startDate = formatDateForCalendar(eventDate);
    const endDate = formatDateForCalendar(new Date(eventDate.getTime() + 3 * 60 * 60 * 1000)); // +3 часа
    
    const title = encodeURIComponent('Wedding AfterParty');
    const location = encodeURIComponent(eventLocation);
    const description = encodeURIComponent('Приглашение на свадебную вечеринку');
    
    if (device === 'android' || device === 'desktop') {
        // Google Calendar для Android и Desktop
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${description}&location=${location}`;
    }
    
    // Для iOS возвращаем null, будем использовать ICS файл
    return null;
}

// Обработчик кнопки "Добавить в календарь"
document.getElementById('addToCalendar').addEventListener('click', function() {
    const device = detectDevice();
    const link = createCalendarLink();
    
    if (device === 'ios') {
        // Для iOS создаем и скачиваем .ics файл
        const icsContent = createICSFile();
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wedding-afterparty.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Очищаем URL через некоторое время
        setTimeout(() => URL.revokeObjectURL(url), 100);
    } else {
        // Для Android и Desktop открываем Google Calendar
        window.open(link, '_blank');
    }
});

// Анимация рукописного текста
function animateSignature() {
    const text = 'С любовью, семья Сатаевых';
    const signatureElement = document.getElementById('signatureText');
    let index = 0;
    let hasStarted = false;
    
    signatureElement.textContent = '';
    
    function typeChar() {
        if (index < text.length) {
            signatureElement.textContent += text.charAt(index);
            index++;
            // Разная скорость для разных символов (имитация рукописного письма)
            const delay = text.charAt(index - 1) === ' ' ? 150 : Math.random() * 50 + 80;
            setTimeout(typeChar, delay);
        } else {
            // Убираем курсор после завершения
            setTimeout(() => {
                signatureElement.classList.add('completed');
            }, 1000);
        }
    }
    
    // Запускаем анимацию при загрузке или когда блок виден
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasStarted) {
                hasStarted = true;
                // Небольшая задержка перед началом анимации
                setTimeout(typeChar, 500);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    observer.observe(signatureElement.parentElement);
}

// Параллакс эффект при скролле (только для первого блока)
function initParallax() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) {
        console.error('Hero section not found!');
        return;
    }
    
    const heroContent = heroSection.querySelector('.hero-content');
    const isMobile = window.innerWidth <= 768;
    
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        
        // Простая и надежная формула параллакса
        // Фон двигается медленнее, чем скролл (создает эффект глубины)
        if (isMobile) {
            // Для мобильных - более заметный эффект
            const parallaxY = scrolled * 0.6;
            heroSection.style.backgroundPosition = `center ${50 - parallaxY * 0.15}%`;
            
            if (heroContent) {
                const contentOffset = scrolled * 0.3;
                heroContent.style.transform = `translateY(${contentOffset}px)`;
            }
        } else {
            // Для десктопа
            const parallaxY = scrolled * 0.5;
            heroSection.style.backgroundPosition = `center ${50 - parallaxY * 0.12}%`;
            
            if (heroContent) {
                const contentOffset = scrolled * 0.25;
                heroContent.style.transform = `translateY(${contentOffset}px)`;
            }
        }
        
        ticking = false;
    }
    
    // Обработчик скролла
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
    
    // Вызываем сразу для начальной позиции
    updateParallax();
    
    // Обновляем при изменении размера окна
    window.addEventListener('resize', () => {
        updateParallax();
    }, { passive: true });
    
    console.log('Parallax initialized for hero section');
}

// Анимация появления элементов второго блока
function initFadeInItems() {
    const items = document.querySelectorAll('.fade-in-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Добавляем задержку для каждого элемента
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 400); // 400ms задержка между элементами (было 200ms)
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    });
    
    items.forEach(item => {
        observer.observe(item);
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    animateSignature();
    initParallax();
    initFadeInItems();
});
