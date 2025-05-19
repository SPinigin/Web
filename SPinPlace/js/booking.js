document.addEventListener('DOMContentLoaded', function() {
    // Объявляем переменные для элементов страницы
    const checkInDateElement = document.getElementById('check-in-date');
    const checkOutDateElement = document.getElementById('check-out-date');
    const totalNightsElement = document.getElementById('total-nights');
    const totalPriceElement = document.getElementById('total-price');
    const checkInInput = document.getElementById('check-in');
    const checkOutInput = document.getElementById('check-out');
    const nightsInput = document.getElementById('nights');
    const priceInput = document.getElementById('price');
    const displayCheckIn = document.getElementById('display-check-in');
    const displayCheckOut = document.getElementById('display-check-out');
    const displayPrice = document.getElementById('display-price');
    
    // Цены в зависимости от дня недели
    const weekdayPrice = 9000; // Пн-Чт: 9000 рублей
    const weekendPrice = 12000; // Пт-Вс: 12000 рублей
    
    // Текущая дата (для ограничения календаря)
    const today = new Date();
    
    // Инициализация календаря с помощью Flatpickr
    const bookingCalendar = flatpickr("#booking-calendar", {
        inline: true, // Всегда показывать календарь
        mode: "range",
        minDate: "today",
        dateFormat: "d.m.Y",
        locale: "ru",
        disableMobile: true, // Отключаем нативный мобильный календарь
        showMonths: window.innerWidth < 768 ? 1 : 2, // На мобильных устройствах показываем 1 месяц
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length === 2) {
                // Форматирование дат
                const checkInDate = formatDate(selectedDates[0]);
                const checkOutDate = formatDate(selectedDates[1]);
                
                // Рассчитываем количество ночей
                const nights = calculateNights(selectedDates[0], selectedDates[1]);
                
                // Обновляем информацию о выбранных датах
                checkInDateElement.textContent = checkInDate;
                checkOutDateElement.textContent = checkOutDate;
                totalNightsElement.textContent = nights;
                
                // Обновляем скрытые поля формы
                checkInInput.value = formatDateForServer(selectedDates[0]);
                checkOutInput.value = formatDateForServer(selectedDates[1]);
                nightsInput.value = nights;
                
                // Обновляем отображение в форме
                displayCheckIn.textContent = checkInDate;
                displayCheckOut.textContent = checkOutDate;
                
                // Рассчитываем стоимость с учетом дней недели
                const price = calculatePriceByDays(selectedDates[0], selectedDates[1]);
                
                // ВАЖНО: Устанавливаем значение цены во все элементы интерфейса
                totalPriceElement.textContent = formatPrice(price);
                displayPrice.textContent = formatPrice(price);
                priceInput.value = price;
                
                // Проверяем, что цена действительно обновилась в DOM
                // console.log('Updated DOM elements:', {
                //     totalPriceElement: totalPriceElement.textContent,
                //     displayPrice: displayPrice.textContent,
                //     priceInput: priceInput.value
                // });
            }
        }
    });
    
    // Функция для форматирования даты в читаемый формат
    function formatDate(date) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('ru-RU', options);
    }
    
    // Функция для форматирования даты для отправки на сервер (YYYY-MM-DD)
    function formatDateForServer(date) {
        return date.toISOString().split('T')[0];
    }
    
    // Функция для форматирования цены (добавление разделителей тысяч и символа валюты)
    function formatPrice(price) {
        return `${Number(price).toLocaleString('ru-RU')} ₽`;
    }
    
    // Функция для расчета количества ночей между датами
    function calculateNights(checkIn, checkOut) {
        const timeDiff = Math.abs(checkOut.getTime() - checkIn.getTime());
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    
    // Функция для определения, является ли день выходным (Пт, Сб, Вс)
    function isWeekend(date) {
        const day = date.getDay();
        // 5 = пятница, 6 = суббота, 0 = воскресенье
        return day === 5 || day === 6 || day === 0;
    }
    
    // Функция для расчета стоимости с учетом дней недели
    function calculatePriceByDays(checkIn, checkOut) {
        if (!checkIn || !checkOut) {
            return 0;
        }
        
        let totalPrice = 0;
        let currentDate = new Date(checkIn);
        
        // Перебираем каждый день проживания
        while (currentDate < checkOut) {
            // Определяем цену в зависимости от дня недели
            if (isWeekend(currentDate)) {
                totalPrice += weekendPrice;
            } else {
                totalPrice += weekdayPrice;
            }
            
            // Переходим к следующему дню
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Применяем скидки за длительное проживание
        const nights = calculateNights(checkIn, checkOut);
        
        if (nights >= 7) {
            // Скидка 10% при бронировании от 7 ночей
            totalPrice = Math.round(totalPrice * 0.9);
        } else if (nights >= 3) {
            // Скидка 5% при бронировании от 3 до 6 ночей
            totalPrice = Math.round(totalPrice * 0.95);
        }
        
        return totalPrice;
    }

    // Функция для форматирования даты для отправки на сервер (YYYY-MM-DD)
    function formatDateForServer(date) {
    // Создаем копию даты и устанавливаем время на полдень, чтобы избежать проблем с часовыми поясами
        const d = new Date(date);
        d.setHours(12, 0, 0, 0);
        return d.toISOString().split('T')[0];
    }
    
    // Маска для телефона с поддержкой различных форматов
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Получаем только цифры из введенного значения
            let digits = e.target.value.replace(/\D/g, '');
            
            // Ограничиваем длину до 11 цифр
            if (digits.length > 11) {
                digits = digits.substring(0, 11);
            }
            
            // Форматируем по маске в зависимости от количества цифр
            let formatted = '';
            
            if (digits.length === 0) {
                formatted = '';
            } else if (digits.length <= 1) {
                formatted = '+' + digits;
            } else if (digits.length <= 4) {
                formatted = '+' + digits[0] + ' (' + digits.substring(1);
            } else if (digits.length <= 7) {
                formatted = '+' + digits[0] + ' (' + digits.substring(1, 4) + ') ' + digits.substring(4);
            } else if (digits.length <= 9) {
                formatted = '+' + digits[0] + ' (' + digits.substring(1, 4) + ') ' + digits.substring(4, 7) + '-' + digits.substring(7);
            } else {
                formatted = '+' + digits[0] + ' (' + digits.substring(1, 4) + ') ' + digits.substring(4, 7) + '-' + 
                        digits.substring(7, 9) + '-' + digits.substring(9);
            }
            
            e.target.value = formatted;
        });
    }

    // Валидация и отправка формы
    const bookingForm = document.getElementById('booking-form');
    const submitButton = bookingForm && bookingForm.querySelector('button[type="submit"]');

    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Проверка выбора дат
            if (!checkInInput.value || !checkOutInput.value) {
                showMessage('error', 'Пожалуйста, выберите даты заезда и выезда');
                return;
            }
            
            // Получаем значения полей
            const guests = document.getElementById('guests').value;
            const lastname = document.getElementById('lastname').value.trim();
            const firstname = document.getElementById('firstname').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();
            const comments = document.getElementById('comments').value.trim();
            const agree = document.getElementById('agree').checked;
            
            // Проверка обязательных полей
            if (!guests) {
                showMessage('error', 'Пожалуйста, выберите количество гостей');
                return;
            }
            
            if (!lastname) {
                showMessage('error', 'Пожалуйста, введите фамилию');
                return;
            }
            
            if (!firstname) {
                showMessage('error', 'Пожалуйста, введите имя');
                return;
            }
            
            if (!phone) {
                showMessage('error', 'Пожалуйста, введите номер телефона');
                return;
            }
            
            if (!agree) {
                showMessage('error', 'Необходимо согласиться с правилами проживания');
                return;
            }
            
            // Проверка формата телефона - принимаем любой формат, содержащий не менее 10 цифр
            const phoneDigits = phone.replace(/\D/g, '');
            if (phoneDigits.length < 10) {
                showMessage('error', 'Пожалуйста, введите корректный номер телефона (не менее 10 цифр)');
                return;
            }
            
            // Если email заполнен, проверяем его формат
            if (email) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(email)) {
                    showMessage('error', 'Пожалуйста, введите корректный email');
                    return;
                }
            }
            
            // Принудительно пересчитываем стоимость перед отправкой
            const checkInDate = checkInInput.value ? new Date(checkInInput.value) : null;
            const checkOutDate = checkOutInput.value ? new Date(checkOutInput.value) : null;
            
            if (checkInDate && checkOutDate) {
                const price = calculatePriceByDays(checkInDate, checkOutDate);
                priceInput.value = price;
                totalPriceElement.textContent = formatPrice(price);
                displayPrice.textContent = formatPrice(price);
            }
            
            // Блокируем кнопку отправки и меняем текст
            submitButton.disabled = true;
            submitButton.innerHTML = 'Отправка...';
            
            // Создаем объект FormData для отправки данных формы
            const formData = new FormData(bookingForm);
            
            // Проверяем, что цена и ночи добавлены в formData
            if (!formData.has('price') || formData.get('price') === '0' || formData.get('price') === '') {
                const recalculatedPrice = checkInDate && checkOutDate ? 
                    calculatePriceByDays(checkInDate, checkOutDate) : 0;
                formData.set('price', recalculatedPrice);
            }
            
            if (!formData.has('nights') || formData.get('nights') === '0' || formData.get('nights') === '') {
                const nights = checkInDate && checkOutDate ? calculateNights(checkInDate, checkOutDate) : 0;
                formData.set('nights', nights);
            }
            
            // Отправляем данные на сервер с помощью Fetch API
            fetch('bookingprocess.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    let successMessage = data.message;
                    
                    // Если есть номер бронирования, добавляем его в сообщение
                    if (data.booking_id) {
                        successMessage += ` Номер вашего бронирования: ${data.booking_id}.`;
                    }
                    
                    showMessage('success', successMessage);
                    bookingForm.reset();
                    
                    // Сбрасываем календарь и информацию о датах
                    bookingCalendar.clear();
                    checkInDateElement.textContent = 'Не выбрано';
                    checkOutDateElement.textContent = 'Не выбрано';
                    totalNightsElement.textContent = '0';
                    totalPriceElement.textContent = '0 ₽';
                    displayCheckIn.textContent = 'Выберите дату';
                    displayCheckOut.textContent = 'Выберите дату';
                    displayPrice.textContent = '0 ₽';
                }
            })
            .catch(error => {
                showMessage('error', 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.');
                console.error('Error:', error);
            })
            .finally(() => {
                // Разблокируем кнопку отправки и возвращаем исходный текст
                submitButton.disabled = false;
                submitButton.innerHTML = 'Забронировать';
            });
        });
    }
    
    // Функция для отображения сообщений
    function showMessage(type, text) {
        // Удаляем предыдущие сообщения
        const oldMessages = document.querySelectorAll('.form-message');
        oldMessages.forEach(msg => msg.remove());
        
        // Создаем новое сообщение
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type === 'success' ? 'form-message-success' : 'form-message-error'}`;
        messageDiv.textContent = text;
        
        // Добавляем сообщение после кнопки отправки
        const submitButton = document.querySelector('.btn-book');
        if (submitButton) {
            submitButton.parentNode.insertAdjacentElement('afterend', messageDiv);
            
            // Прокручиваем к сообщению
            messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // Если сообщение успешное, удаляем его через 10 секунд
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.remove();
            }, 10000);
        }
    }
    
    // Обновление размера календаря при изменении размера окна
    window.addEventListener('resize', function() {
        bookingCalendar.set('showMonths', window.innerWidth < 768 ? 1 : 2);
        bookingCalendar.redraw();
    });
});
