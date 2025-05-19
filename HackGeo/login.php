<?php
include_once "../includes/db_connect.php";
session_start();

$error = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    if ($email && $password) {
        // Поиск пользователя по email
        $query = "SELECT id, username, password FROM users WHERE email = :email";
        $statement = oci_parse($conn, $query);
        oci_bind_by_name($statement, ":email", $email);
        oci_execute($statement);

        $user = oci_fetch_assoc($statement);

        if ($user && password_verify($password, $user['PASSWORD'])) {
            // Успешная авторизация
            $_SESSION['user_id'] = $user['ID'];
            $_SESSION['username'] = $user['USERNAME'];
            header("Location: /index.php");
            exit;
        } else {
            $error = "Неверный логин или пароль.";
        }
        
        oci_free_statement($statement);
    } else {
        $error = "Пожалуйста, введите логин и пароль.";
    }
}
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вход</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <?php include "../includes/header.php"; ?>
    <main>
        <h2>Вход в систему</h2>

        <?php if ($error): ?>
            <p class="error"><?php echo htmlspecialchars($error); ?></p>
        <?php endif; ?>

        <form method="POST" action="/pages/login.php">
            <label for="email">Электронная почта:</label>
            <input type="email" id="email" name="email" required>
            
            <label for="password">Пароль:</label>
            <input type="password" id="password" name="password" required>
            
            <button type="submit">Войти</button>
        </form>
    </main>
    <?php include "../includes/footer.php"; ?>
</body>
</html>
