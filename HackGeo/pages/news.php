<?php
include_once "../includes/db_connect.php";
session_start();

$news_id = $_GET['id'] ?? null;

if (!$news_id) {
    header("Location: /index.php");
    exit;
}

// Получение данных о новости
$query = "SELECT title, content, created_at FROM news WHERE id = :id";
$statement = oci_parse($conn, $query);
oci_bind_by_name($statement, ":id", $news_id);
oci_execute($statement);
$news = oci_fetch_assoc($statement);
oci_free_statement($statement);

if (!$news) {
    echo "Новость не найдена.";
    exit;
}

// Обработка добавления комментария
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user_id'])) {
    $comment_content = trim($_POST['comment_content']);

    if ($comment_content) {
        $user_id = $_SESSION['user_id'];
        $query = "INSERT INTO comments (news_id, user_id, content, created_at) VALUES (:news_id, :user_id, :content, SYSDATE)";
        $statement = oci_parse($conn, $query);
        oci_bind_by_name($statement, ":news_id", $news_id);
        oci_bind_by_name($statement, ":user_id", $user_id);
        oci_bind_by_name($statement, ":content", $comment_content);
        oci_execute($statement);
        oci_free_statement($statement);
    }
}
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($news['TITLE']); ?></title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <?php include "../includes/header.php"; ?>
    <main>
        <h2><?php echo htmlspecialchars($news['TITLE']); ?></h2>
        <p><?php echo date('d-m-Y', strtotime($news['CREATED_AT'])); ?></p>
        <div><?php echo nl2br(htmlspecialchars($news['CONTENT'])); ?></div>

        <h3>Комментарии</h3>

        <?php if (isset($_SESSION['user_id'])): ?>
            <form method="POST" action="/pages/news.php?id=<?php echo $news_id; ?>">
                <textarea name="comment_content" required></textarea>
                <button type="submit">Добавить комментарий</button>
            </form>
        <?php else: ?>
            <p>Чтобы оставить комментарий, <a href="/pages/login.php">войдите</a> в систему.</p>
        <?php endif; ?>

        <?php
        // Отображение комментариев
        $query = "SELECT content, created_at FROM comments WHERE news_id = :news_id ORDER BY created_at DESC";
        $statement = oci_parse($conn, $query);
        oci_bind_by_name($statement, ":news_id", $news_id);
        oci_execute($statement);

        while ($comment = oci_fetch_assoc($statement)): ?>
            <div class="comment">
                <p><?php echo htmlspecialchars($comment['CONTENT']); ?></p>
                <span><?php echo date('d-m-Y H:i', strtotime($comment['CREATED_AT'])); ?></span>
            </div>
        <?php endwhile;

        oci_free_statement($statement);
        ?>
    </main>
    <?php include "../includes/footer.php"; ?>
</body>
</html>

<?php oci_close($conn); ?>
