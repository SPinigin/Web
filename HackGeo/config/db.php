<!-- config/db.php -->
<?php
$conn = oci_connect('username', 'password', '//localhost/XE');
if (!$conn) {
    $e = oci_error();
    echo "Ошибка подключения: " . htmlentities($e['message']);
    exit;
}
?>
