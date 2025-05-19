<?php
include_once "../includes/db_connect.php";
session_start();

$query = "SELECT id, title, created_at FROM articles ORDER BY created_at DESC";
$statement = oci_parse($conn, $query);
oci_execute($statement);
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Полезные статьи</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <?php include "../includes/header.php"; ?>
    <main>
        <h2>Полезные статьи</h2>
        <ul>
            <?php while ($article = oci_fetch_assoc($statement)): ?>
                <li>
                    <a href="/pages/article.php?id=<?php echo $article['ID']; ?>"><?php echo htmlspecialchars($article['TITLE']); ?></a>
                    <p><?php echo date('d-m-Y', strtotime($article['CREATED_AT'])); ?></p>
                </li>
            <?php endwhile; ?>
        </ul>
    </main>
    <?php include "../includes/footer.php"; ?>
</body>
</html>

<?php oci_free_statement($statement); ?>
