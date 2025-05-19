<?php
// Начинаем сессию
session_start();

// Проверяем, был ли отправлен POST-запрос
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Получаем данные из формы
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    
    // Проверяем учетные данные (в реальном проекте храните хеши паролей в базе данных)
    $correct_username = 'admin'; // Измените на ваш логин
    $correct_password = 'admin123'; // Измените на ваш пароль (в реальном проекте используйте хеширование)
    
    if ($username === $correct_username && $password === $correct_password) {
        // Авторизация успешна, устанавливаем сессию и перенаправляем на панель администратора
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        
        // Устанавливаем время входа в систему
        $_SESSION['login_time'] = time();
        
        header('Location: admin-dashboard.php');
        exit;
    } else {
        // Авторизация не удалась, устанавливаем сообщение об ошибке и перенаправляем обратно
        $_SESSION['error_message'] = 'Неверный логин или пароль';
        header('Location: admin.php');
        exit;
    }
} else {
    // Если запрос не POST, перенаправляем на страницу входа
    header('Location: admin.php');
    exit;
}
?>
