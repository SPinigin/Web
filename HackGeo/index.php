<!-- index.php -->
<?php include 'includes/header.php'; ?>
<main>
    <h2>Добро пожаловать в библиотеку!</h2>
    <p>На нашем сайте вы найдете учебные материалы, статьи и многое другое.</p>
</main>
<?php
$query = "SELECT id, title, created_at FROM news ORDER BY created_at DESC FETCH FIRST 5 ROWS ONLY";
$statement = oci_parse($conn, $query);
oci_execute($statement);
?>

<h2>Последние новости</h2>
<ul>
    <?php while ($news = oci_fetch_assoc($statement)): ?>
        <li>
            <a href="/pages/news.php?id=<?php echo $news['ID']; ?>"><?php echo htmlspecialchars($news['TITLE']); ?></a>
            <p><?php echo date('d-m-Y', strtotime($news['CREATED_AT'])); ?></p>
        </li>
    <?php endwhile; ?>
</ul>

<?php oci_free_statement($statement); ?>
<?php include 'includes/footer.php'; ?>
