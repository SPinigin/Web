<?php
// Начинаем сессию
session_start();

// Очищаем все данные сессии
session_unset();
session_destroy();

// Перенаправляем на страницу входа
header('Location: admin.php');
exit;
?>
