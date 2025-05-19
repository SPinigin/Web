<?php
include_once "../includes/db_connect.php";

$error = "";
$success = "";

// Обработка формы
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $message = trim($_POST['message']);

    // Проверка обязательных полей
    if (!$name || !$email || !$message) {
        $error = "Пожалуйста, заполните все поля.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Неверный формат электронной почты.";
    } else {
        // Вставка данных в базу
        $query = "INSERT INTO feedback (name, email, message, date) VALUES (:name, :email, :message, SYSDATE)";
        $statement = oci_parse($conn, $query);
        oci_bind_by_name($statement, ":name", $name);
        oci_bind_by_name($statement, ":email", $email);
        oci_bind_by_name($statement, ":message", $message);
        
        if (oci_execute($statement)) {
            $success = "Спасибо за ваше сообщение!";
        } else {
            $error = "Произошла ошибка при отправке сообщения.";
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
    <title>Обратная связь</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <?php include "../includes/header.php"; ?>
    <main>
        <h2>Обратная связь</h2>

        <?php if ($error): ?>
            <p class="error"><?php echo htmlspecialchars($error); ?></p>
        <?php endif; ?>
        
        <?php if ($success): ?>
            <p class="success"><?php echo htmlspecialchars($success); ?></p>
        <?php endif; ?>

        <form method="POST" action="/pages/contact.php" id="contact-form">
            <label for="name">Имя:</label>
            <input type="text" id="name" name="name" required>
            
            <label for="email">Электронная почта:</label>
            <input type="email" id="email" name="email" required>
            
            <label for="message">Сообщение:</label>
            <textarea id="message" name="message" required></textarea>
            
            <button type="submit">Отправить</button>
        </form>
    </main>
    <?php include "../includes/footer.php"; ?>
    <script src="/js/form-validation.js"></script>
</body>
</html>
