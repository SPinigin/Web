<?php
// Начинаем сессию
session_start();

// Если пользователь уже авторизован, перенаправляем на панель администратора
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header('Location: admin-dashboard.php');
    exit;
}

// Проверяем, есть ли сообщение об ошибке
$error_message = isset($_SESSION['error_message']) ? $_SESSION['error_message'] : '';
// Очищаем сообщение об ошибке после показа
unset($_SESSION['error_message']);
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вход в панель администратора</title>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/admin.css">
</head>
<body class="admin-login-page">
    <div class="admin-login-container">
        <div class="admin-login-form-wrapper">
            <h1>Панель администратора</h1>
            <h2>Вход в систему</h2>
            
            <?php if (!empty($error_message)): ?>
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i> <?php echo $error_message; ?>
                </div>
            <?php endif; ?>
            
            <form class="admin-login-form" action="admin-auth.php" method="POST">
                <div class="form-group">
                    <label for="username">Логин</label>
                    <div class="input-with-icon">
                        <i class="fas fa-user input-icon"></i>
                        <input type="text" id="username" name="username" class="form-control" placeholder="Введите логин" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="password">Пароль</label>
                    <div class="input-with-icon">
                        <i class="fas fa-lock input-icon"></i>
                        <input type="password" id="password" name="password" class="form-control" placeholder="Введите пароль" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <button type="submit" class="btn btn-login">Войти</button>
                </div>
            </form>
            
            <div class="back-to-site">
                <a href="index.html"><i class="fas fa-arrow-left"></i> Вернуться на сайт</a>
            </div>
        </div>
    </div>
</body>
</html>
