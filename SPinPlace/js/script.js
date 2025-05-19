document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, доступен ли объект Swiper и существует ли контейнер для карусели
    const swiperContainer = document.querySelector('.swiper-container');
    
    if (typeof Swiper !== 'undefined' && swiperContainer) {
        
        // Инициализация карусели Swiper
        const swiper = new Swiper('.swiper-container', {
            // Параметры карусели
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            loop: true,
            speed: 800,
            coverflowEffect: {
                rotate: 20,
                stretch: 0,
                depth: 200,
                modifier: 1,
                slideShadows: true,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });

        // Переменная для отслеживания таймаута
        let mouseTimeout;
        // Флаг для отслеживания, можно ли переключать слайды
        let canSlide = true;

        // Добавление эффекта реагирования на движение мыши
        swiperContainer.addEventListener('mousemove', function(e) {
            const { left, top, width, height } = this.getBoundingClientRect();
            const x = (e.clientX - left) / width - 0.5;
            const y = (e.clientY - top) / height - 0.5;
            
            // Скорость перемещения карусели в зависимости от положения мыши
            const slideSpeed = 5; // Коэффициент влияния движения мыши
            
            // Применяем 3D-трансформацию к контейнеру карусели
            this.style.transform = `perspective(1000px) rotateY(${x * slideSpeed}deg) rotateX(${-y * slideSpeed}deg)`;
            
            // Управление переключением слайдов с задержкой и проверкой возможности переключения
            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => {
                if (canSlide) {
                    if (x > 0.3) {
                        // Если мышь находится справа, переключаемся на следующий слайд
                        swiper.slideNext();
                        // Временно блокируем переключение
                        canSlide = false;
                        setTimeout(() => { canSlide = true; }, 500); // Разрешаем переключение через 500 мс
                    } else if (x < -0.3) {
                        // Если мышь находится слева, переключаемся на предыдущий слайд
                        swiper.slidePrev();
                        // Временно блокируем переключение
                        canSlide = false;
                        setTimeout(() => { canSlide = true; }, 500); // Разрешаем переключение через 500 мс
                    }
                }
            }, 100); // Задержка в 100 мс перед переключением слайда
        });
        
        swiperContainer.addEventListener('mouseleave', function() {
            // Возвращаем начальное положение при уходе мыши
            this.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
            // Очищаем таймаут при уходе мыши
            clearTimeout(mouseTimeout);
        });
    } else if (!swiperContainer) {
        console.log('Элемент .swiper-container не найден на странице.');
    } else {
        console.warn('Swiper не найден. Убедитесь, что библиотека Swiper.js подключена правильно.');
    }
});
