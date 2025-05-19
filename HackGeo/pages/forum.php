<?php
include_once "../includes/db_connect.php";

// Запрос на получение тем форума
$query = "SELECT id, title, description, created_at FROM forum_topics ORDER BY created_at DESC";
$statement = oci_parse($conn, $query);
oci_execute($statement);
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Форум</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <?php include "../includes/header.php"; ?>
    <main>
        <h2>Форум</h2>
        <a href="create_topic.php" class="create-topic-btn">Создать новую тему</a>
        <div class="forum-topics">
            <?php while ($row = oci_fetch_assoc($statement)): ?>
                <div class="forum-topic">
                    <h3><a href="/pages/topic.php?id=<?php echo $row['ID']; ?>"><?php echo htmlspecialchars($row['TITLE']); ?></a></h3>
                    <p><?php echo htmlspecialchars($row['DESCRIPTION']); ?></p>
                    <p><small>Создано: <?php echo date('d.m.Y', strtotime($row['CREATED_AT'])); ?></small></p>
                </div>
            <?php endwhile; ?>
        </div>
    </main>
    <?php include "../includes/footer.php"; ?>
</body>
</html>

<?php oci_free_statement($statement); ?>
<?php oci_close($conn); ?>
