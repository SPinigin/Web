const eventDate = new Date('2026-02-15T15:00:00');
const eventLocation = 'Бар «Инкогнито», Орджоникидзе, 63а';

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

updateCountdown();
setInterval(updateCountdown, 60000);

function detectDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    if (/android/i.test(userAgent)) {
        return 'android';
    }
    
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'ios';
    }
    
    return 'desktop';
}

function formatDateForCalendar(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}00`;
}

function createICSFile() {
    const startDate = formatDateForCalendar(eventDate);
    const endDate = formatDateForCalendar(new Date(eventDate.getTime() + 3 * 60 * 60 * 1000));
    
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

function createCalendarLink() {
    const device = detectDevice();
    const startDate = formatDateForCalendar(eventDate);
    const endDate = formatDateForCalendar(new Date(eventDate.getTime() + 3 * 60 * 60 * 1000));
    
    const title = encodeURIComponent('Wedding AfterParty');
    const location = encodeURIComponent(eventLocation);
    const description = encodeURIComponent('Приглашение на свадебную вечеринку');
    
    if (device === 'android' || device === 'desktop') {
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${description}&location=${location}`;
    }
    
    return null;
}

document.getElementById('addToCalendar').addEventListener('click', function() {
    const device = detectDevice();
    const link = createCalendarLink();
    
    if (device === 'ios') {
        const icsContent = createICSFile();
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wedding-afterparty.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
    } else {
        window.open(link, '_blank');
    }
});

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
            const delay = text.charAt(index - 1) === ' ' ? 150 : Math.random() * 50 + 80;
            setTimeout(typeChar, delay);
        } else {
            setTimeout(() => {
                signatureElement.classList.add('completed');
            }, 1000);
        }
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasStarted) {
                hasStarted = true;
                setTimeout(typeChar, 500);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    observer.observe(signatureElement.parentElement);
}

function initParallax() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) {
        return;
    }
    
    const heroContent = heroSection.querySelector('.hero-content');
    const isMobile = window.innerWidth <= 768;
    
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        
        if (isMobile) {
            const parallaxY = scrolled * 0.6;
            heroSection.style.backgroundPosition = `center ${50 - parallaxY * 0.15}%`;
            
            if (heroContent) {
                const contentOffset = scrolled * 0.3;
                heroContent.style.transform = `translateY(${contentOffset}px)`;
            }
        } else {
            const parallaxY = scrolled * 0.5;
            heroSection.style.backgroundPosition = `center ${50 - parallaxY * 0.12}%`;
            
            if (heroContent) {
                const contentOffset = scrolled * 0.25;
                heroContent.style.transform = `translateY(${contentOffset}px)`;
            }
        }
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
    
    updateParallax();
    
    window.addEventListener('resize', () => {
        updateParallax();
    }, { passive: true });
}

function initFadeInItems() {
    const items = document.querySelectorAll('.fade-in-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 400);
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

document.addEventListener('DOMContentLoaded', () => {
    animateSignature();
    initParallax();
    initFadeInItems();
});
