<?php
// Начинаем сессию
session_start();

// Проверяем, авторизован ли пользователь
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: admin.php');
    exit;
}

// Проверяем время сессии (автоматический выход через 2 часа)
$session_lifetime = 7200; // 2 часа в секундах
if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time'] > $session_lifetime)) {
    // Сессия истекла, выходим из системы
    session_unset();
    session_destroy();
    header('Location: admin.php?expired=1');
    exit;
}

// Обновляем время активности
$_SESSION['login_time'] = time();

// Подключение к базе данных
$db_host = "localhost";
$db_user = "root"; 
$db_pass = ""; 
$db_name = "cottage_booking";

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Получаем список бронирований с информацией о гостях
    $sql = "SELECT b.id, b.check_in, b.check_out, b.person_count, 
                  b.booking_date, b.status, b.price, b.nights, b.comments,
                  g.first_name, g.last_name, c.phone, c.email
           FROM Booking b
           JOIN Guests g ON b.guest_id = g.id
           JOIN Contacts c ON g.id = c.guest_id
           ORDER BY b.booking_date DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
} catch (PDOException $e) {
    die("Ошибка подключения к базе данных: " . $e->getMessage());
}

// Получаем сообщение об успешном действии, если оно есть
$success_message = isset($_SESSION['success_message']) ? $_SESSION['success_message'] : '';
unset($_SESSION['success_message']);

// Получаем сообщение об ошибке, если оно есть
$error_message = isset($_SESSION['error_message']) ? $_SESSION['error_message'] : '';
unset($_SESSION['error_message']);
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Панель администратора - Управление бронированиями</title>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/admin.css">
</head>
<body class="admin-panel">
    <header class="admin-header">
        <div class="container">
            <div class="admin-header-wrapper">
                <h1>Панель администратора</h1>
                <div class="admin-user-info">
                    <span>Администратор: <?php echo htmlspecialchars($_SESSION['admin_username']); ?></span>
                    <a href="logout.php" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Выход</a>
                </div>
            </div>
        </div>
    </header>
    
    <main class="admin-main">
        <div class="container">
            <section class="admin-dashboard">
                <div class="admin-dashboard-header">
                    <h2>Управление бронированиями</h2>
                    <div class="admin-actions">
                        <a href="index.html" class="btn btn-secondary"><i class="fas fa-home"></i> Перейти на сайт</a>
                    </div>
                </div>
                
                <?php if (!empty($success_message)): ?>
                    <div class="success-message">
                        <i class="fas fa-check-circle"></i> <?php echo $success_message; ?>
                    </div>
                <?php endif; ?>
                
                <?php if (!empty($error_message)): ?>
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i> <?php echo $error_message; ?>
                    </div>
                <?php endif; ?>
                
                <div class="admin-filter">
                    <input type="text" id="bookingSearch" class="booking-search" placeholder="Поиск по ФИО, телефону или email...">
                    <select id="statusFilter" class="status-filter">
                        <option value="all">Все статусы</option>
                        <option value="pending">Ожидает подтверждения</option>
                        <option value="confirmed">Подтверждено</option>
                        <option value="cancelled">Отменено</option>
                    </select>
                </div>
                
                <div class="bookings-table-wrapper">
                    <table class="bookings-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Заказчик</th>
                                <th>Контакты</th>
                                <th>Даты</th>
                                <th>Гости</th>
                                <th>Стоимость</th>
                                <th>Дата заявки</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (count($bookings) > 0): ?>
                                <?php foreach ($bookings as $booking): ?>
                                    <?php 
                                        // Определяем класс строки в зависимости от статуса
                                        $row_class = '';
                                        $status_text = 'Ожидает подтверждения';
                                        
                                        if ($booking['status'] === 'confirmed') {
                                            $row_class = 'status-confirmed';
                                            $status_text = 'Подтверждено';
                                        } elseif ($booking['status'] === 'cancelled') {
                                            $row_class = 'status-cancelled';
                                            $status_text = 'Отменено';
                                        } elseif (!isset($booking['status']) || $booking['status'] === 'pending') {
                                            $row_class = 'status-pending';
                                        }
                                        
                                        // Форматируем даты
                                        $check_in = new DateTime($booking['check_in']);
                                        $check_out = new DateTime($booking['check_out']);
                                        $booking_date = new DateTime($booking['booking_date']);
                                    ?>
                                    <tr class="<?php echo $row_class; ?>" data-status="<?php echo isset($booking['status']) ? $booking['status'] : 'pending'; ?>">
                                        <td class="booking-id"><?php echo $booking['id']; ?></td>
                                        <td class="guest-name"><?php echo htmlspecialchars($booking['last_name'] . ' ' . $booking['first_name']); ?></td>
                                        <td class="guest-contacts">
                                            <div><?php echo htmlspecialchars($booking['phone']); ?></div>
                                            <?php if (!empty($booking['email'])): ?>
                                                <div><?php echo htmlspecialchars($booking['email']); ?></div>
                                            <?php endif; ?>
                                        </td>
                                        <td class="booking-dates">
                                            <div>С: <?php echo $check_in->format('d.m.Y'); ?></div>
                                            <div>По: <?php echo $check_out->format('d.m.Y'); ?></div>
                                            <div>Ночей: <?php echo $booking['nights']; ?></div>
                                        </td>
                                        <td class="guest-count"><?php echo $booking['person_count']; ?></td>
                                        <td class="booking-price"><?php echo number_format($booking['price'], 0, ',', ' '); ?> ₽</td>
                                        <td class="booking-date"><?php echo $booking_date->format('d.m.Y H:i'); ?></td>
                                        <td class="booking-status"><?php echo $status_text; ?></td>
                                        <td class="booking-actions">
                                            <?php if (!isset($booking['status']) || $booking['status'] === 'pending'): ?>
                                                <form action="admin-actions.php" method="POST" class="action-form">
                                                    <input type="hidden" name="booking_id" value="<?php echo $booking['id']; ?>">
                                                    <input type="hidden" name="action" value="confirm">
                                                    <button type="submit" class="btn-action btn-confirm" title="Подтвердить бронирование">
                                                        <i class="fas fa-check"></i>
                                                    </button>
                                                </form>
                                                <form action="admin-actions.php" method="POST" class="action-form">
                                                    <input type="hidden" name="booking_id" value="<?php echo $booking['id']; ?>">
                                                    <input type="hidden" name="action" value="cancel">
                                                    <button type="submit" class="btn-action btn-cancel" title="Отменить бронирование">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                </form>
                                            <?php elseif ($booking['status'] === 'confirmed'): ?>
                                                <form action="admin-actions.php" method="POST" class="action-form">
                                                    <input type="hidden" name="booking_id" value="<?php echo $booking['id']; ?>">
                                                    <input type="hidden" name="action" value="cancel">
                                                    <button type="submit" class="btn-action btn-cancel" title="Отменить бронирование">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                </form>
                                            <?php elseif ($booking['status'] === 'cancelled'): ?>
                                                <form action="admin-actions.php" method="POST" class="action-form">
                                                    <input type="hidden" name="booking_id" value="<?php echo $booking['id']; ?>">
                                                    <input type="hidden" name="action" value="confirm">
                                                    <button type="submit" class="btn-action btn-confirm" title="Восстановить бронирование">
                                                        <i class="fas fa-undo"></i>
                                                    </button>
                                                </form>
                                            <?php endif; ?>
                                            
                                            <button class="btn-action btn-details" title="Подробнее" data-booking-id="<?php echo $booking['id']; ?>">
                                                <i class="fas fa-info-circle"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr class="booking-details" id="details-<?php echo $booking['id']; ?>">
                                        <td colspan="9">
                                            <div class="details-content">
                                                <h4>Подробная информация о бронировании #<?php echo $booking['id']; ?></h4>
                                                <div class="details-grid">
                                                    <div class="details-column">
                                                        <h5>Информация о госте</h5>
                                                        <p><strong>ФИО:</strong> <?php echo htmlspecialchars($booking['last_name'] . ' ' . $booking['first_name']); ?></p>
                                                        <p><strong>Телефон:</strong> <?php echo htmlspecialchars($booking['phone']); ?></p>
                                                        <?php if (!empty($booking['email'])): ?>
                                                            <p><strong>Email:</strong> <?php echo htmlspecialchars($booking['email']); ?></p>
                                                        <?php endif; ?>
                                                    </div>
                                                    <div class="details-column">
                                                        <h5>Информация о бронировании</h5>
                                                        <p><strong>Дата заезда:</strong> <?php echo $check_in->format('d.m.Y'); ?></p>
                                                        <p><strong>Дата выезда:</strong> <?php echo $check_out->format('d.m.Y'); ?></p>
                                                        <p><strong>Количество ночей:</strong> <?php echo $booking['nights']; ?></p>
                                                        <p><strong>Количество гостей:</strong> <?php echo $booking['person_count']; ?></p>
                                                        <p><strong>Стоимость:</strong> <?php echo number_format($booking['price'], 0, ',', ' '); ?> ₽</p>
                                                    </div>
                                                    <div class="details-column">
                                                        <h5>Дополнительная информация</h5>
                                                        <p><strong>Дата создания заявки:</strong> <?php echo $booking_date->format('d.m.Y H:i'); ?></p>
                                                        <p><strong>Статус:</strong> <?php echo $status_text; ?></p>
                                                        <?php if (!empty($booking['comments'])): ?>
                                                            <p><strong>Комментарии гостя:</strong><br><?php echo nl2br(htmlspecialchars($booking['comments'])); ?></p>
                                                        <?php else: ?>
                                                            <p><strong>Комментарии гостя:</strong> Нет</p>
                                                        <?php endif; ?>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="9" class="no-bookings">Нет доступных бронирований</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </main>
    
    <footer class="admin-footer">
        <div class="container">
            <p>&copy; <?php echo date('Y'); ?> Панель администратора коттеджа. Все права защищены.</p>
        </div>
    </footer>
    
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // Обработчик для кнопок "Подробнее"
        const detailButtons = document.querySelectorAll('.btn-details');
        detailButtons.forEach(button => {
            button.addEventListener('click', function() {
                const bookingId = this.getAttribute('data-booking-id');
                const detailsRow = document.getElementById('details-' + bookingId);
                
                if (detailsRow.classList.contains('active')) {
                    detailsRow.classList.remove('active');
                } else {
                    // Сначала закрываем все открытые детали
                    const activeRows = document.querySelectorAll('.booking-details.active');
                    activeRows.forEach(row => row.classList.remove('active'));
                    
                    // Затем открываем нужную строку
                    detailsRow.classList.add('active');
                }
            });
        });
        
        // Фильтрация по статусу
        const statusFilter = document.getElementById('statusFilter');
        statusFilter.addEventListener('change', function() {
            const selectedStatus = this.value;
            const rows = document.querySelectorAll('.bookings-table tbody tr:not(.booking-details)');
            
            rows.forEach(row => {
                if (selectedStatus === 'all' || row.getAttribute('data-status') === selectedStatus) {
                    row.style.display = '';
                    // Также скрываем соответствующую строку с деталями
                    const detailsId = 'details-' + row.querySelector('.booking-id').textContent;
                    const detailsRow = document.getElementById(detailsId);
                    if (detailsRow) {
                        detailsRow.style.display = '';
                    }
                } else {
                    row.style.display = 'none';
                    // Также скрываем соответствующую строку с деталями
                    const detailsId = 'details-' + row.querySelector('.booking-id').textContent;
                    const detailsRow = document.getElementById(detailsId);
                    if (detailsRow) {
                        detailsRow.style.display = 'none';
                    }
                }
            });
        });
        
        // Поиск по бронированиям
        const searchInput = document.getElementById('bookingSearch');
        searchInput.addEventListener('input', function() {
            const searchText = this.value.toLowerCase();
            const rows = document.querySelectorAll('.bookings-table tbody tr:not(.booking-details)');
            
            rows.forEach(row => {
                const guestName = row.querySelector('.guest-name').textContent.toLowerCase();
                const guestContacts = row.querySelector('.guest-contacts').textContent.toLowerCase();
                
                if (guestName.includes(searchText) || guestContacts.includes(searchText)) {
                    row.style.display = '';
                    // Также показываем соответствующую строку с деталями
                    const detailsId = 'details-' + row.querySelector('.booking-id').textContent;
                    const detailsRow = document.getElementById(detailsId);
                    if (detailsRow) {
                        detailsRow.style.display = '';
                    }
                } else {
                    row.style.display = 'none';
                    // Также скрываем соответствующую строку с деталями
                    const detailsId = 'details-' + row.querySelector('.booking-id').textContent;
                    const detailsRow = document.getElementById(detailsId);
                    if (detailsRow) {
                        detailsRow.style.display = 'none';
                    }
                }
            });
        });
    });
    </script>
</body>
</html>
