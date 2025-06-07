        // Инициализация карты 2ГИС
        DG.then(function () {
            var map = DG.map('map', {
                center: [57.165380, 65.484710],
                zoom: 16
            });
            
            DG.marker([57.165380, 65.484710]).addTo(map)
                .bindPopup('Коттедж для отдыха<br>с. Перевалово, Боровская 15');
        });

        // Обработка формы
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            // Здесь добавьте код для отправки формы
            alert('Спасибо за сообщение! Мы свяжемся с вами в ближайшее время.');
            this.reset();
        });