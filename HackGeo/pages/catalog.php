<?php
include_once "../includes/db_connect.php"; // Подключение к базе данных

// Запрос на получение списка книг
$query = "SELECT id, title, author, year, genre, description FROM books";
$statement = oci_parse($conn, $query);
oci_execute($statement);
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Каталог книг</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <?php include "../includes/header.php"; ?>
    <main>
        <h2>Каталог книг</h2>
        <div class="book-list">
            <?php while ($row = oci_fetch_assoc($statement)): ?>
                <div class="book-item">
                    <h3><?php echo htmlspecialchars($row['TITLE']); ?></h3>
                    <p><strong>Автор:</strong> <?php echo htmlspecialchars($row['AUTHOR']); ?></p>
                    <p><strong>Год издания:</strong> <?php echo htmlspecialchars($row['YEAR']); ?></p>
                    <p><strong>Жанр:</strong> <?php echo htmlspecialchars($row['GENRE']); ?></p>
                    <p><?php echo htmlspecialchars($row['DESCRIPTION']); ?></p>
                </div>
            <?php endwhile; ?>
        </div>
    </main>
    <?php include "../includes/footer.php"; ?>
</body>
</html>

<?php oci_free_statement($statement); ?>
<?php oci_close($conn); ?>
