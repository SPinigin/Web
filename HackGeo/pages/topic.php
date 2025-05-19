<?php
include_once "../includes/db_connect.php";

$topic_id = $_GET['id'] ?? null;

if (!$topic_id) {
    die("Тема не найдена.");
}

// Получаем информацию о теме
$query = "SELECT title, description, created_at FROM forum_topics WHERE id = :topic_id";
$statement = oci_parse($conn, $query);
oci_bind_by_name($statement, ":topic_id", $topic_id);
oci_execute($statement);

$topic = oci_fetch_assoc($statement);
oci_free_statement($statement);

// Получаем комментарии к теме
$query = "SELECT author, comment, created_at FROM forum_comments WHERE topic_id = :topic_id ORDER BY created_at DESC";
$statement = oci_parse($conn, $query);
oci_bind_by_name($statement, ":topic_id", $topic_id);
oci_execute($statement);
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($topic['TITLE']); ?></title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <?php include "../includes/header.php"; ?>
    <main>
        <h2><?php echo htmlspecialchars($topic['TITLE']); ?></h2>
        <p><?php echo htmlspecialchars($topic['DESCRIPTION']); ?></p>
        <p><small>Создано: <?php echo date('d.m.Y', strtotime($topic['CREATED_AT'])); ?></small></p>

        <h3>Комментарии</h3>
        <div class="forum-comments">
            <?php while ($comment = oci_fetch_assoc($statement)): ?>
                <div class="comment">
                    <p><strong><?php echo htmlspecialchars($comment['AUTHOR']); ?></strong></p>
                    <p><?php echo htmlspecialchars($comment['COMMENT']); ?></p>
                    <p><small><?php echo date('d.m.Y H:i', strtotime($comment['CREATED_AT'])); ?></small></p>
                </div>
            <?php endwhile; ?>
        </div>

        <h3>Добавить комментарий</h3>
        <form method="POST" action="/pages/add_comment.php">
            <input type="hidden" name="topic_id" value="<?php echo $topic_id; ?>">
            <label for="author">Имя:</label>
            <input type="text" id="author" name="author" required>
            <label for="comment">Комментарий:</label>
            <textarea id="comment" name="comment" required></textarea>
            <button type="submit">Отправить</button>
        </form>
    </main>
    <?php include "../includes/footer.php"; ?>
</body>
</html>

<?php oci_free_statement($statement); ?>
<?php oci_close($conn); ?>
