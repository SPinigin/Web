<?php
// Настройки подключения к базе данных
$db_host = "localhost";
$db_user = "root"; 
$db_pass = ""; 
$db_name = "cottage_booking";

// Устанавливаем часовой пояс для PHP
date_default_timezone_set('Asia/Yekaterinburg');

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


// Функция для отправки уведомления администратору о новом бронировании
function sendAdminNotification($booking_id, $guest_name, $check_in, $check_out, $guests_count, $phone, $email, $price) {
    // Email администратора
    $admin_email = "pinigin09@yandex.ru";
    
    // Форматирование дат для отображения
    $check_in_formatted = date('d.m.Y', strtotime($check_in));
    $check_out_formatted = date('d.m.Y', strtotime($check_out));
    
    // Тема письма
    $subject = "Новое бронирование #$booking_id";
    
    // Содержимое письма
    $message = "
    <html>
    <head>
        <title>Новое бронирование</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .booking-info { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
            h2 { color: #D2691E; }
            table { border-collapse: collapse; width: 100%; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <h2>Новое бронирование #$booking_id</h2>
        <div class='booking-info'>
            <p>Поступило новое бронирование от гостя:</p>
            <table>
                <tr>
                    <th>ФИО гостя:</th>
                    <td>$guest_name</td>
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
                    <th>Телефон:</th>
                    <td>$phone</td>
                </tr>";
    
    if (!empty($email)) {
        $message .= "
                <tr>
                    <th>Email:</th>
                    <td>$email</td>
                </tr>";
    }
    
    $message .= "
                <tr>
                    <th>Стоимость:</th>
                    <td>" . number_format($price, 0, ',', ' ') . " ₽</td>
                </tr>
            </table>
            <p>Для подтверждения или отмены бронирования перейдите в <a href='http://your-domain.com/admin.php'>панель администратора</a>.</p>
        </div>
    </body>
    </html>
    ";
    
    // Отправка email администратору
    return sendEmail($admin_email, $subject, $message);
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
                    <li>Адрес: [укажите адрес коттеджа]</li>
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

// Проверка метода запроса
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Получение данных из формы и их очистка
    $check_in = filter_input(INPUT_POST, 'check_in', FILTER_SANITIZE_STRING);
    $check_out = filter_input(INPUT_POST, 'check_out', FILTER_SANITIZE_STRING);
    $nights = filter_input(INPUT_POST, 'nights', FILTER_SANITIZE_NUMBER_INT);
    $price = filter_input(INPUT_POST, 'price', FILTER_SANITIZE_NUMBER_INT);
    $guests_count = filter_input(INPUT_POST, 'guests', FILTER_SANITIZE_NUMBER_INT);
    $lastname = filter_input(INPUT_POST, 'lastname', FILTER_SANITIZE_STRING);
    $firstname = filter_input(INPUT_POST, 'firstname', FILTER_SANITIZE_STRING);
    
    // Обеспечиваем корректную обработку дат - добавляем время 12:00 для избежания проблем с часовыми поясами
    if (!empty($check_in)) {
        $check_in_date = new DateTime($check_in . ' 12:00:00');
        $check_in = $check_in_date->format('Y-m-d');
    }
    
    if (!empty($check_out)) {
        $check_out_date = new DateTime($check_out . ' 12:00:00');
        $check_out = $check_out_date->format('Y-m-d');
    }
    
    // Если количество ночей не указано, рассчитываем его на основе дат
    if (empty($nights) || $nights == 0) {
        if (!empty($check_in) && !empty($check_out)) {
            $check_in_date = new DateTime($check_in . ' 12:00:00');
            $check_out_date = new DateTime($check_out . ' 12:00:00');
            $interval = $check_in_date->diff($check_out_date);
            $nights = $interval->days;
        } else {
            $nights = 0;
        }
    }
    
    // Проверяем и устанавливаем цену, если она не установлена или равна 0
    if (empty($price) || $price == 0) {
        // Базовые цены - точно такие же, как в JavaScript
        $weekdayPrice = 13000; // Пн-Чт
        $weekendPrice = 15000; // Пт-Вс
        
        // Рассчитываем стоимость с учетом дней недели
        $totalPrice = 0;
        
        if (!empty($check_in) && !empty($check_out)) {
            $currentDate = new DateTime($check_in . ' 12:00:00');
            $endDate = new DateTime($check_out . ' 12:00:00');
            
            while ($currentDate < $endDate) {
                $dayOfWeek = (int)$currentDate->format('w'); // 0 (воскресенье) до 6 (суббота)
                
                // Определяем, является ли день выходным (Пт, Сб, Вс)
                $isWeekend = ($dayOfWeek === 5 || $dayOfWeek === 6 || $dayOfWeek === 0);
                
                if ($isWeekend) {
                    $totalPrice += $weekendPrice;
                } else {
                    $totalPrice += $weekdayPrice;
                }
                
                $currentDate->modify('+1 day');
            }
            
            // Применяем скидки за длительное проживание
            if ($nights >= 7) {
                // Скидка 15% при бронировании от 7 ночей
                $totalPrice = round($totalPrice * 0.9);
            } else if ($nights >= 3) {
                // Скидка 10% при бронировании от 3 до 6 ночей
                $totalPrice = round($totalPrice * 0.95);
            }
            
            $price = $totalPrice;
        }
    }
    
    // Логируем полученные данные для отладки
    error_log("Booking data: check_in=$check_in, check_out=$check_out, nights=$nights, price=$price, guests=$guests_count");
    
    // Получаем телефон и очищаем от всех символов, кроме цифр
    $phone_raw = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING);
    $phone = preg_replace('/[^0-9]/', '', $phone_raw); // Оставляем только цифры
    
    // Если телефон начинается с 7 или 8, считаем его российским
    if (strlen($phone) >= 10) {
        // Если первая цифра 8, заменяем на 7
        if (substr($phone, 0, 1) == '8' && strlen($phone) == 11) {
            $phone = '7' . substr($phone, 1);
        }
        // Если телефон не начинается с 7, и его длина 10 цифр, добавляем 7 в начало
        else if (substr($phone, 0, 1) != '7' && strlen($phone) == 10) {
            $phone = '7' . $phone;
        }
    }
    
    // Форматируем телефон для сохранения в базу и отображения
    $formatted_phone = '';
    if (strlen($phone) == 11 && substr($phone, 0, 1) == '7') {
        $formatted_phone = '+' . substr($phone, 0, 1) . ' (' . substr($phone, 1, 3) . ') ' . 
                         substr($phone, 4, 3) . '-' . substr($phone, 7, 2) . '-' . substr($phone, 9, 2);
    } else {
        // Если формат не распознан, сохраняем как есть
        $formatted_phone = $phone_raw;
    }
    
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $comments = filter_input(INPUT_POST, 'comments', FILTER_SANITIZE_STRING);
    
    // Проверка обязательных полей
    if (empty($check_in) || empty($check_out) || empty($guests_count) || empty($lastname) || empty($firstname) || empty($phone)) {
        echo json_encode(['success' => false, 'message' => 'Пожалуйста, заполните все обязательные поля']);
        exit;
    }
    
    // Подключение к базе данных
    try {
        $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Начинаем транзакцию для обеспечения целостности данных
        $pdo->beginTransaction();
        
        // 1. Проверяем, существует ли уже гость с такими данными
        $stmt = $pdo->prepare("SELECT id FROM Guests WHERE first_name = ? AND last_name = ?");
        $stmt->execute([$firstname, $lastname]);
        $guest = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Если гость не найден, добавляем нового
        if (!$guest) {
            $stmt = $pdo->prepare("INSERT INTO Guests (first_name, last_name) VALUES (?, ?)");
            $stmt->execute([$firstname, $lastname]);
            $guest_id = $pdo->lastInsertId();
        } else {
            $guest_id = $guest['id'];
        }
        
        // 2. Проверяем, существуют ли контакты для этого гостя
        $stmt = $pdo->prepare("SELECT id FROM Contacts WHERE guest_id = ? AND phone = ?");
        $stmt->execute([$guest_id, $formatted_phone]);
        $contact = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Если контакты не найдены, добавляем новые
        if (!$contact) {
            $stmt = $pdo->prepare("INSERT INTO Contacts (guest_id, phone, email) VALUES (?, ?, ?)");
            $stmt->execute([$guest_id, $formatted_phone, $email]);
        } else {
            // Если email изменился, обновляем его
            if (!empty($email)) {
                $stmt = $pdo->prepare("UPDATE Contacts SET email = ? WHERE id = ?");
                $stmt->execute([$email, $contact['id']]);
            }
        }
        
        // 3. Добавляем новое бронирование
        $booking_date = date('Y-m-d H:i:s'); // Текущая дата и время с учетом установленного часового пояса
        
        $sql = "INSERT INTO Booking (guest_id, check_in, check_out, person_count, booking_date, comments, price, nights) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$guest_id, $check_in, $check_out, $guests_count, $booking_date, $comments, $price, $nights]);
        
        $booking_id = $pdo->lastInsertId();
        
        // Логируем успешное бронирование
        error_log("Booking successful: ID=$booking_id, Guest=$guest_id, Price=$price, Nights=$nights, Date=$booking_date, CheckIn=$check_in, CheckOut=$check_out");
        
        // Завершаем транзакцию
        $pdo->commit();
        
        // Отправляем уведомление администратору о новом бронировании
        $guest_name = $lastname . ' ' . $firstname;
        $admin_notification_sent = sendAdminNotification($booking_id, $guest_name, $check_in, $check_out, $guests_count, $formatted_phone, $email, $price);
        
        // Логируем результат отправки уведомления
        error_log("Admin notification sent: " . ($admin_notification_sent ? "Yes" : "No"));
        
        // Возвращаем успешный ответ
        echo json_encode([
            'success' => true, 
            'message' => 'Спасибо! Ваша заявка на бронирование успешно отправлена.',
            'booking_id' => $booking_id,
            'debug' => [
                'price' => $price, 
                'nights' => $nights,
                'booking_date' => $booking_date,
                'check_in' => $check_in,
                'check_out' => $check_out,
                'timezone' => date_default_timezone_get()
            ]
        ]);
        
    } catch (PDOException $e) {
        // Если произошла ошибка с базой данных
        if (isset($pdo)) {
            $pdo->rollBack(); // Откатываем транзакцию
        }
        
        // Логируем ошибку
        error_log("Database Error: " . $e->getMessage());
        
        // Возвращаем ошибку
        echo json_encode([
            'success' => false, 
            'message' => 'Произошла ошибка при сохранении данных. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.',
            'debug' => $e->getMessage() // Добавляем отладочную информацию
        ]);
    }
} else {
    // Если запрос не POST
    echo json_encode(['success' => false, 'message' => 'Неверный метод запроса']);
}
?>
