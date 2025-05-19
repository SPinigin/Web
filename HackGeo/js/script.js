// script.js

document.addEventListener("DOMContentLoaded", function () {
    const body = document.body;
    const themeToggle = document.getElementById("theme-toggle");

    // Проверка сохраненных настроек
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        body.classList.add(savedTheme);
        themeToggle.checked = savedTheme === "dark-theme";
    }

    // Переключение темы
    themeToggle.addEventListener("change", () => {
        if (themeToggle.checked) {
            body.classList.add("dark-theme");
            body.classList.remove("light-theme");
            localStorage.setItem("theme", "dark-theme");
        } else {
            body.classList.add("light-theme");
            body.classList.remove("dark-theme");
            localStorage.setItem("theme", "light-theme");
        }
    });
});
