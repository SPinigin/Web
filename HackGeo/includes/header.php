<!-- includes/header.php -->
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Студенческая библиотека</title>
    <link rel="stylesheet" href="/css/style.css">
    <script src="/js/script.js" defer></script>
</head>
<body class="dark-theme">
    <header>
        <h1>Добро пожаловать в студенческую библиотеку</h1>
        
        <!-- Переключатель стиля -->
        <label class="theme-switch">
            <input type="checkbox" id="theme-toggle">
            <span class="slider"></span>
        </label>

        <nav>
            <ul>
                <li><a href="/index.php">Главная</a></li>
                <li><a href="/pages/catalog.php">Каталог книг</a></li>
                <li><a href="/pages/news.php">Новости</a></li>
                <li><a href="/pages/forum.php">Форум</a></li>
                <li><a href="/pages/contact.php">Обратная связь</a></li>
            </ul>
        </nav>
    </header>
