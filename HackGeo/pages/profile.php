<?php
include_once "../includes/db_connect.php";
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: /pages/login.php");
    exit;
}

$user_id = $_SESSION['user_id'];
$query = "SELECT username, email FROM users WHERE id = :user_id";
$statement = oci_parse($conn, $query);
oci_bind_by_name($statement, ":user_id", $user_id);
oci_execute($statement);
$user = oci_fetch_assoc($statement);
oci_free_statement($statement);
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Профиль пользователя</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <?php include "../includes/header.php"; ?>
    <main>
        <h2>Профиль</h2>
        <p>Имя пользователя: <?php echo htmlspecialchars($user['USERNAME']); ?></p>
        <p>Электронная почта: <?php echo htmlspecialchars($user['EMAIL']); ?></p>
        <a href="update_profile.php">Изменить данные</a>
    </main>
    <?php include "../includes/footer.php"; ?>
</body>
</html>

<?php oci_close($conn); ?>
