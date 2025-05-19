<?php
include_once "../includes/db_connect.php";
session_start();

$article_id = $_GET['id'] ?? null;

if (!$article_id) {
    header("Location: /pages/articles.php");
    exit;
}

$query = "SELECT title, content, created_at FROM articles WHERE id = :id";
$statement = oci_parse($conn, $query);
oci_bind_by_name($statement, ":id", $article_id);
oci_execute($statement);
$article = oci_fetch_assoc($statement);
oci_free_statement($statement);

if (!$article) {
    echo "Статья не найдена.";
    exit;
}
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($article['TITLE']); ?></title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <?php include "../includes/header.php"; ?>
    <main>
        <h2><?php echo htmlspecialchars($article['TITLE']); ?></h2>
        <p><?php echo date('d-m-Y', strtotime($article['CREATED_AT'])); ?></p>
        <div><?php echo nl2br(htmlspecialchars($article['CONTENT'])); ?></div>
    </main>
    <?php include "../includes/footer.php"; ?>
</body>
</html>

<?php oci_close($conn); ?>
