$(document).ready(function() {
    // Константы для цен и настроек
    const PRICES = {
        weekday: 9000,  // Цена в будни
        weekend: 12000, // Цена в выходные
        discounts: {
            '3-6': 0.95,  // Скидка 5% для 3-6 ночей
            '7+': 0.90    // Скидка 10% для 7+ ночей
        }
    };

   // Инициализация календаря Flatpickr
const bookingCalendar = flatpickr("#booking-calendar", {
    inline: true,
    mode: "range",
    minDate: "today",
    dateFormat: "Y-m-d",
    locale: "ru",
    showMonths: window.innerWidth < 768 ? 1 : 2,
    animate: true,
    disableMobile: true,
    static: true,
    monthSelectorType: "static",
    yearSelectorType: "static",
    nextArrow: '<i class="fas fa-chevron-right"></i>',
    prevArrow: '<i class="fas fa-chevron-left"></i>',
    disable: [], // Здесь можно добавить заблокированные даты
    onChange: handleDateSelection,
    onReady: function(selectedDates, dateStr, instance) {
        // Устанавливаем ширину календаря после инициализации
        const calendarWidth = instance.calendarContainer.offsetWidth;
        instance.calendarContainer.style.width = `${calendarWidth}px`;
        
        // Обновляем положение календаря
        instance.calendarContainer.style.left = '0';
        instance.calendarContainer.style.right = 'auto';
    }
});

// Обработка изменения размера окна
$(window).resize(function() {
    const width = window.innerWidth;
    bookingCalendar.set('showMonths', width < 768 ? 1 : 2);
    
    // Переустанавливаем размеры календаря после изменения окна
    setTimeout(() => {
        const calendarContainer = bookingCalendar.calendarContainer;
        const calendarWidth = calendarContainer.offsetWidth;
        calendarContainer.style.width = `${calendarWidth}px`;
        calendarContainer.style.left = '0';
        calendarContainer.style.right = 'auto';
    }, 100);
});

    // Инициализация маски для телефона
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        const phoneMask = IMask(phoneInput, {
            mask: '+{7} (000) 000-00-00',
            lazy: false,
            placeholderChar: '_',
            prepare: function(str) {
                return str.replace(/[^0-9]/g, '');
            },
            commit: function(value, masked) {
                validateField(phoneInput);
            },
            complete: function(value, masked) {
                $(phoneInput).removeClass('is-invalid').addClass('is-valid');
            }
        });
    }

    // Обработка выбора дат
    function handleDateSelection(selectedDates, dateStr, instance) {
        if (selectedDates.length === 2) {
            const [checkIn, checkOut] = selectedDates;
            
            // Проверяем корректность дат
            if (checkOut <= checkIn) {
                showNotification('danger', 'Дата выезда должна быть позже даты заезда');
                instance.clear();
                return;
            }

            updateDateDisplay(checkIn, checkOut);
            updatePriceDisplay(checkIn, checkOut);
            updateFormInputs(checkIn, checkOut);

            // Анимация обновления цены
            $('#total-price').addClass('price-updated');
            setTimeout(() => {
                $('#total-price').removeClass('price-updated');
            }, 500);
        }
    }

    // Обновление отображения дат
    function updateDateDisplay(checkIn, checkOut) {
        const checkInEl = $('#check-in-date');
        const checkOutEl = $('#check-out-date');
        const nightsEl = $('#total-nights');

        checkInEl.text(formatDate(checkIn)).addClass('date-updated');
        checkOutEl.text(formatDate(checkOut)).addClass('date-updated');
        nightsEl.text(calculateNights(checkIn, checkOut));

        setTimeout(() => {
            checkInEl.removeClass('date-updated');
            checkOutEl.removeClass('date-updated');
        }, 500);
    }

    // Обновление отображения цены
    function updatePriceDisplay(checkIn, checkOut) {
        const price = calculateTotalPrice(checkIn, checkOut);
        const priceEl = $('#total-price');
        const oldPrice = parseInt(priceEl.text().replace(/[^\d]/g, '')) || 0;

        // Анимация изменения цены
        $({price: oldPrice}).animate({price: price}, {
            duration: 500,
            easing: 'swing',
            step: function(now) {
                priceEl.text(formatPrice(Math.round(now)));
            }
        });

        $('#price').val(price);
    }

    // Обновление скрытых полей формы
    function updateFormInputs(checkIn, checkOut) {
        $('#check-in').val(formatDateForServer(checkIn));
        $('#check-out').val(formatDateForServer(checkOut));
        $('#nights').val(calculateNights(checkIn, checkOut));
    }

    // Расчет количества ночей
    function calculateNights(checkIn, checkOut) {
        return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    }

    // Расчет полной стоимости
    function calculateTotalPrice(checkIn, checkOut) {
        let totalPrice = 0;
        const nights = calculateNights(checkIn, checkOut);
        let currentDate = new Date(checkIn);

        // Расчет базовой стоимости
        while (currentDate < checkOut) {
            const dayOfWeek = currentDate.getDay();
            const isWeekend = (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0);
            totalPrice += isWeekend ? PRICES.weekend : PRICES.weekday;
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Применение скидок
        if (nights >= 7) {
            totalPrice *= PRICES.discounts['7+'];
        } else if (nights >= 3) {
            totalPrice *= PRICES.discounts['3-6'];
        }

        return Math.round(totalPrice);
    }

    // Форматирование даты для отображения
    function formatDate(date) {
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    // Форматирование даты для сервера
    function formatDateForServer(date) {
        return date.toISOString().split('T')[0];
    }

    // Форматирование цены
    function formatPrice(price) {
        return price.toLocaleString('ru-RU') + ' ₽';
    }

    // Валидация полей формы при вводе
    $('.form-control, .form-select').on('input change', function() {
        validateField(this);
    });

    // Функция валидации поля
    function validateField(field) {
        const $field = $(field);
        if (field.checkValidity()) {
            $field.removeClass('is-invalid').addClass('is-valid');
        } else {
            $field.removeClass('is-valid').addClass('is-invalid');
        }
    }

    // Обработка отправки формы
    $('#booking-form').on('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm(this)) {
            return;
        }

        const submitBtn = $(this).find('button[type="submit"]');
        const originalBtnText = submitBtn.html();
        
        // Анимация кнопки отправки
        submitBtn.prop('disabled', true)
            .html('<span class="spinner-border spinner-border-sm me-2"></span>Отправка...');

        // AJAX отправка формы
        $.ajax({
            url: $(this).attr('action'),
            method: 'POST',
            data: $(this).serialize(),
            success: function(response) {
                if (response.success) {
                    showNotification('success', response.message);
                    resetForm();
                } else {
                    showNotification('danger', response.message || 'Произошла ошибка при бронировании');
                }
            },
            error: function(xhr) {
                let errorMessage = 'Произошла ошибка при отправке формы';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                showNotification('danger', errorMessage);
            },
            complete: function() {
                submitBtn.prop('disabled', false).html(originalBtnText);
            }
        });
    });

    // Валидация формы
    function validateForm(form) {
        let isValid = true;
        const requiredFields = $(form).find('[required]');

        // Проверка всех обязательных полей
        requiredFields.each(function() {
            if (!this.checkValidity()) {
                $(this).addClass('is-invalid');
                isValid = false;
            } else {
                $(this).removeClass('is-invalid');
            }
        });

        // Проверка выбора дат
        if (!$('#check-in').val() || !$('#check-out').val()) {
            showNotification('danger', 'Пожалуйста, выберите даты проживания');
            isValid = false;
        }

        // Проверка согласия с правилами
        if (!$('#agree').is(':checked')) {
            $('#agree').addClass('is-invalid');
            showNotification('danger', 'Необходимо согласиться с правилами проживания');
            isValid = false;
        }

        if (!isValid) {
            // Прокрутка к первому невалидному полю
            const firstInvalid = $(form).find('.is-invalid').first();
            if (firstInvalid.length) {
                $('html, body').animate({
                    scrollTop: firstInvalid.offset().top - 100
                }, 500);
            }
        }

        return isValid;
    }

    // Сброс формы
    function resetForm() {
        const form = $('#booking-form')[0];
        form.reset();
        bookingCalendar.clear();
        
        // Сброс отображения дат и цены
        $('#check-in-date').text('Не выбрано');
        $('#check-out-date').text('Не выбрано');
        $('#total-nights').text('0');
        $('#total-price').text('0 ₽');
        
        // Удаление классов валидации
        $('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
    }

    // Показ уведомлений
    function showNotification(type, message) {
        const notificationHtml = `
            <div class="alert alert-${type} alert-dismissible fade show notification-slide" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        const notification = $(notificationHtml);
        $('.booking-notifications').append(notification);

        // Анимация появления
        setTimeout(() => notification.addClass('show'), 100);

        // Автоматическое скрытие
        setTimeout(() => {
            notification.removeClass('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Обработка изменения размера окна
    $(window).resize(function() {
        bookingCalendar.set('showMonths', window.innerWidth < 768 ? 1 : 2);
        bookingCalendar.redraw();
    });

    // Инициализация тултипов и попоперов
    $('[data-bs-toggle="tooltip"]').tooltip();
    $('[data-bs-toggle="popover"]').popover();
});
