document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contact-form");

    form.addEventListener("submit", function (event) {
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const message = form.message.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Валидация полей
        if (!name || !email || !message) {
            alert("Пожалуйста, заполните все поля.");
            event.preventDefault();
        } else if (!emailPattern.test(email)) {
            alert("Введите корректный адрес электронной почты.");
            event.preventDefault();
        }
    });
});
