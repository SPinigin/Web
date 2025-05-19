<?php
include_once "../includes/db_connect.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $topic_id = $_POST['topic_id'] ?? null;
    $author = trim($_POST['author']);
    $comment = trim($_POST['comment']);

    if ($topic_id && $author && $comment) {
        $query = "INSERT INTO forum_comments (topic_id, author, comment, created_at) VALUES (:topic_id, :author, :comment, SYSDATE)";
        $statement = oci_parse($conn, $query);
        oci_bind_by_name($statement, ":topic_id", $topic_id);
        oci_bind_by_name($statement, ":author", $author);
        oci_bind_by_name($statement, ":comment", $comment);

        if (oci_execute($statement)) {
            header("Location: /pages/topic.php?id=" . urlencode($topic_id));
            exit;
        } else {
            echo "Произошла ошибка при добавлении комментария.";
        }
        oci_free_statement($statement);
    } else {
        echo "Пожалуйста, заполните все поля.";
    }
}

oci_close($conn);
