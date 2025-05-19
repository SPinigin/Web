<?php
// Начинаем сессию
session_start();

// Проверяем, авторизован ли пользователь
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: admin.php');
    exit;
}

// Функция для отправки email-уведомлений
function sendEmail($to, $subject, $message) {
    // Логируем попытку отправки email
    error_log("Trying to send email to: $to");
    
    // Проверяем, установлен ли PHPMailer через Composer
    if (file_exists(__DIR__ . '/vendor/autoload.php')) {
        require __DIR__ . '/vendor/autoload.php';
        
        try {
            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            
            // Настройки сервера
            $mail->isSMTP();
            $mail->Host = 'smtp.yandex.ru'; // Замените на ваш SMTP сервер
            $mail->SMTPAuth = true;
            $mail->Username = 'pinigin09@yandex.ru'; // Замените на ваш email
            $mail->Password = 'ваш_пароль_приложения'; // Замените на пароль приложения (не обычный пароль)
            $mail->SMTPSecure = 'ssl';
            $mail->Port = 465;
            $mail->CharSet = 'UTF-8';
            
            // Отправитель и получатель
            $mail->setFrom('pinigin09@yandex.ru', 'Коттедж для бронирования');
            $mail->addAddress($to);
            
            // Содержимое
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $message;
            
            // Отправка
            $mail->send();
            error_log("Email successfully sent to $to");
            return true;
        } catch (Exception $e) {
            error_log("Failed to send email: " . $mail->ErrorInfo);
            return false;
        }
    } else {
        // Запасной вариант - используем стандартную функцию mail()
        error_log("PHPMailer not found, using standard mail() function");
        
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= 'From: Коттедж для бронирования <pinigin09@yandex.ru>' . "\r\n";
        
        $result = mail($to, $subject, $message, $headers);
        error_log("Standard mail() function result: " . ($result ? "success" : "failure"));
        return $result;
    }
}

// Функция для отправки уведомления гостю о подтверждении бронирования
function sendGuestConfirmation($to, $booking_id, $guest_name, $check_in, $check_out, $guests_count, $price) {
    // Форматирование дат для отображения
    $check_in_formatted = date('d.m.Y', strtotime($check_in));
    $check_out_formatted = date('d.m.Y', strtotime($check_out));
    
    // Тема письма
    $subject = "Подтверждение бронирования #$booking_id";
    
    // Содержимое письма
    $message = "
    <html>
    <head>
        <title>Подтверждение бронирования</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .booking-info { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
            h2 { color: #D2691E; }
            table { border-collapse: collapse; width: 100%; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .confirmation-note { background-color: #e8f5e9; padding: 10px; border-radius: 5px; margin-top: 15px; }
        </style>
    </head>
    <body>
        <h2>Ваше бронирование подтверждено!</h2>
        <div class='booking-info'>
            <p>Уважаемый(ая) $guest_name,</p>
            <p>Мы рады сообщить, что ваше бронирование было подтверждено. Ниже приведены детали вашего бронирования:</p>
            <table>
                <tr>
                    <th>Номер бронирования:</th>
                    <td>#$booking_id</td>
                </tr>
                <tr>
                    <th>Даты проживания:</th>
                    <td>$check_in_formatted - $check_out_formatted</td>
                </tr>
                <tr>
                    <th>Количество гостей:</th>
                    <td>$guests_count</td>
                </tr>
                <tr>
                    <th>Стоимость:</th>
                    <td>" . number_format($price, 0, ',', ' ') . " ₽</td>
                </tr>
            </table>
            <div class='confirmation-note'>
                <p>Важная информация:</p>
                <ul>
                    <li>Время заезда: после 14:00</li>
                    <li>Время выезда: до 12:00</li>
                    <li>Адрес: с.Перевалово, Боровская 15</li>
                </ul>
                <p>Если у вас возникнут вопросы, пожалуйста, свяжитесь с нами по телефону +7 (932) 477-96-22 или по email pinigin09@yandex.ru.</p>
            </div>
            <p>Спасибо, что выбрали наш коттедж для отдыха!</p>
        </div>
    </body>
    </html>
    ";
    
    // Отправка email гостю
    return sendEmail($to, $subject, $message);
}

// Проверяем, был ли отправлен POST-запрос
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Получаем данные из формы
    $booking_id = isset($_POST['booking_id']) ? (int)$_POST['booking_id'] : 0;
    $action = isset($_POST['action']) ? $_POST['action'] : '';
    
    // Проверяем корректность данных
    if ($booking_id <= 0 || !in_array($action, ['confirm', 'cancel'])) {
        $_SESSION['error_message'] = 'Некорректные данные для выполнения действия';
        header('Location: admin-dashboard.php');
        exit;
    }
    
    // Подключение к базе данных
    $db_host = "localhost";
    $db_user = "root"; 
    $db_pass = ""; 
    $db_name = "cottage_booking";
    
    try {
        $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Получаем информацию о бронировании перед обновлением статуса
        $stmt = $pdo->prepare("
            SELECT b.id, b.status, b.check_in, b.check_out, b.person_count, b.price, 
                   g.first_name, g.last_name, c.email
            FROM Booking b
            JOIN Guests g ON b.guest_id = g.id
            JOIN Contacts c ON g.id = c.guest_id
            WHERE b.id = ?
        ");
        $stmt->execute([$booking_id]);
        $booking = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$booking) {
            $_SESSION['error_message'] = 'Бронирование не найдено';
            header('Location: admin-dashboard.php');
            exit;
        }
        
        // Определяем новый статус и проверяем его допустимость
        $new_status = ($action === 'confirm') ? 'confirmed' : 'cancelled';

        // Проверяем текущий статус и значения ENUM в базе данных
        $stmt = $pdo->prepare("SHOW COLUMNS FROM Booking LIKE 'status'");
        $stmt->execute();
        $column_info = $stmt->fetch(PDO::FETCH_ASSOC);

        // Если поле status имеет тип ENUM, извлекаем допустимые значения
        $valid_statuses = [];
        if ($column_info && strpos($column_info['Type'], 'enum') === 0) {
            preg_match("/^enum$$(.*)$$$/", $column_info['Type'], $matches);
            if (isset($matches[1])) {
                $enum_str = $matches[1];
                $enum_values = explode(',', $enum_str);
                foreach ($enum_values as $value) {
                    $valid_statuses[] = trim($value, "'\"");
                }
            }
        }

        // Проверяем, является ли новый статус допустимым
        if (!empty($valid_statuses) && !in_array($new_status, $valid_statuses)) {
            throw new Exception("Недопустимое значение статуса: $new_status. Допустимые значения: " . implode(', ', $valid_statuses));
        }

        // Обновляем статус бронирования
        $stmt = $pdo->prepare("UPDATE Booking SET status = ? WHERE id = ?");
        $stmt->execute([$new_status, $booking_id]);
        
        // Если действие - подтверждение и у гостя указан email, отправляем уведомление
        if ($action === 'confirm' && !empty($booking['email'])) {
            // Формируем полное имя гостя
            $guest_name = $booking['last_name'] . ' ' . $booking['first_name'];
            
            // Отправляем уведомление гостю
            $notification_sent = sendGuestConfirmation(
                $booking['email'],
                $booking_id,
                $guest_name,
                $booking['check_in'],
                $booking['check_out'],
                $booking['person_count'],
                $booking['price']
            );
            
            // Логируем результат отправки
            error_log("Guest confirmation email sent to {$booking['email']}: " . ($notification_sent ? "Yes" : "No"));
            
            // Добавляем информацию об отправке уведомления в сообщение
            $action_text = "подтверждено";
            $email_text = $notification_sent ? 
                " Уведомление отправлено на email гостя." : 
                " Не удалось отправить уведомление на email гостя.";
        } else {
            $action_text = ($action === 'confirm') ? 'подтверждено' : 'отменено';
            $email_text = '';
        }
        
        // Подготавливаем сообщение об успешном действии
        $_SESSION['success_message'] = "Бронирование №{$booking_id} успешно {$action_text}.{$email_text}";
        
    } catch (PDOException $e) {
        $_SESSION['error_message'] = 'Ошибка при выполнении действия: ' . $e->getMessage();
    }
    
    // Перенаправляем обратно на панель администратора
    header('Location: admin-dashboard.php');
    exit;
} else {
    // Если запрос не POST, перенаправляем на панель администратора
    header('Location: admin-dashboard.php');
    exit;
}
?>
