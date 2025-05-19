<?php
include_once "../includes/db_connect.php";
session_start();

// Проверка на администратора
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    header("Location: /pages/login.php");
    exit;
}

$error = "";
$success = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title']);
    $content = trim($_POST['content']);

    if (!$title || !$content) {
        $error = "Пожалуйста, заполните все поля.";
    } else {
        $author_id = $_SESSION['user_id'];
        
        // Запись новости в базу данных
        $query = "INSERT INTO news (title, content, author_id, created_at) VALUES (:title, :content, :author_id, SYSDATE)";
        $statement = oci_parse($conn, $query);
        oci_bind_by_name($statement, ":title", $title);
        oci_bind_by_name($statement, ":content", $content);
        oci_bind_by_name($statement, ":author_id", $author_id);

        if (oci_execute($statement)) {
            $success = "Новость успешно добавлена!";
        } else {
            $error = "Произошла ошибка при добавлении новости.";
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
    <title>Создание новости</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <?php include "../includes/header.php"; ?>
    <main>
        <h2>Создание новости</h2>

        <?php if ($error): ?>
            <p class="error"><?php echo htmlspecialchars($error); ?></p>
        <?php endif; ?>

        <?php if ($success): ?>
            <p class="success"><?php echo htmlspecialchars($success); ?></p>
        <?php endif; ?>

        <form method="POST" action="/pages/create_news.php">
            <label for="title">Заголовок:</label>
            <input type="text" id="title" name="title" required>
            
            <label for="content">Содержимое:</label>
            <textarea id="content" name="content" rows="10" required></textarea>
            
            <button type="submit">Добавить новость</button>
        </form>
    </main>
    <?php include "../includes/footer.php"; ?>
</body>
</html>
