<?php
include_once "../includes/db_connect.php";

$error = "";
$success = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $confirm_password = trim($_POST['confirm_password']);

    // Проверка полей и соответствия пароля
    if (!$username || !$email || !$password || !$confirm_password) {
        $error = "Пожалуйста, заполните все поля.";
    } elseif ($password !== $confirm_password) {
        $error = "Пароли не совпадают.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Некорректный адрес электронной почты.";
    } else {
        // Хэшируем пароль
        $password_hash = password_hash($password, PASSWORD_DEFAULT);

        // Вставка пользователя в базу данных
        $query = "INSERT INTO users (username, email, password, created_at) VALUES (:username, :email, :password, SYSDATE)";
        $statement = oci_parse($conn, $query);
        oci_bind_by_name($statement, ":username", $username);
        oci_bind_by_name($statement, ":email", $email);
        oci_bind_by_name($statement, ":password", $password_hash);

        if (oci_execute($statement)) {
            $success = "Регистрация прошла успешно! Теперь вы можете войти в систему.";
        } else {
            $error = "Произошла ошибка при регистрации.";
        }

        oci_free_statement($statement);
    }
}
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Регистрация</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <?php include "../includes/header.php"; ?>
    <main>
        <h2>Регистрация</h2>

        <?php if ($error): ?>
            <p class="error"><?php echo htmlspecialchars($error); ?></p>
        <?php endif; ?>

        <?php if ($success): ?>
            <p class="success"><?php echo htmlspecialchars($success); ?></p>
        <?php endif; ?>

        <form method="POST" action="/pages/register.php">
            <label for="username">Имя пользователя:</label>
            <input type="text" id="username" name="username" required>
            
            <label for="email">Электронная почта:</label>
            <input type="email" id="email" name="email" required>
            
            <label for="password">Пароль:</label>
            <input type="password" id="password" name="password" required>
            
            <label for="confirm_password">Подтверждение пароля:</label>
            <input type="password" id="confirm_password" name="confirm_password" required>
            
            <button type="submit">Зарегистрироваться</button>
        </form>
    </main>
    <?php include "../includes/footer.php"; ?>
</body>
</html>
