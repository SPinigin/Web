$(document).ready(function() {
    // Загрузка книг
    loadBooks();
    
    // Обработка модальных окон
    const uploadModal = document.getElementById('upload-modal');
    const uploadBtn = document.getElementById('upload-book-btn');
    const closeBtn = uploadModal.querySelector('.close');
    const cancelBtn = uploadModal.querySelector('.cancel-btn');
    
    uploadBtn.addEventListener('click', function() {
        uploadModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
    
    closeBtn.addEventListener('click', function() {
        uploadModal.style.display = 'none';
        document.body.style.overflow = '';
    });
    
    cancelBtn.addEventListener('click', function() {
        uploadModal.style.display = 'none';
        document.body.style.overflow = '';
    });
    
    // Закрытие модального окна при клике вне его области
    window.addEventListener('click', function(event) {
        if (event.target === uploadModal) {
            uploadModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
    
    // Обработка выбора файла
    const bookFileInput = document.getElementById('book-file');
    const bookFileNameDisplay = bookFileInput.nextElementSibling.querySelector('.file-name');
    const bookCoverInput = document.getElementById('book-cover');
    const bookCoverNameDisplay = bookCoverInput.nextElementSibling.querySelector('.file-name');
    
    bookFileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            bookFileNameDisplay.textContent = this.files[0].name;
        } else {
            bookFileNameDisplay.textContent = 'Файл не выбран';
        }
    });
    
    bookCoverInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            bookCoverNameDisplay.textContent = this.files[0].name;
        } else {
            bookCoverNameDisplay.textContent = 'Файл не выбран';
        }
    });
    
    // Кнопка "Обзор"
    const browseButtons = document.querySelectorAll('.browse-btn');
    browseButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.file-input-container').querySelector('input[type="file"]').click();
        });
    });
    
    // Отправка формы загрузки книги
    const uploadForm = document.getElementById('upload-book-form');
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        // Имитация загрузки
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Загрузка...';
        submitBtn.disabled = true;
        
        // Имитация запроса к серверу
        setTimeout(() => {
            alert('Книга успешно загружена!');
            uploadModal.style.display = 'none';
            document.body.style.overflow = '';
            
            // Очистка формы
            uploadForm.reset();
            bookFileNameDisplay.textContent = 'Файл не выбран';
            bookCoverNameDisplay.textContent = 'Файл не выбран';
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            // Обновление списка книг
            loadBooks();
        }, 1500);
    });
    
    // Поиск книг
    const searchInput = document.getElementById('book-search');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterBooks(searchTerm);
    });
    
    // Фильтр по предметам
    const subjectFilter = document.getElementById('subject-filter');
    subjectFilter.addEventListener('change', function() {
        const selectedSubject = this.value;
        filterBySubject(selectedSubject);
    });
    
    // Модальное окно информации о книге
    const bookInfoModal = document.getElementById('book-info-modal');
    const bookInfoCloseBtn = bookInfoModal.querySelector('.close');
    
    bookInfoCloseBtn.addEventListener('click', function() {
        bookInfoModal.style.display = 'none';
        document.body.style.overflow = '';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === bookInfoModal) {
            bookInfoModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
    
    // Отключение стандартного контекстного меню только для книг
    $(document).on('contextmenu', '.book', function(e) {
        e.preventDefault();
        
        // Показываем кастомное контекстное меню
        const customContextMenu = $('#custom-context-menu');
        customContextMenu.css({
            'display': 'block',
            'left': e.pageX,
            'top': e.pageY
        });
        
        // Сохраняем ссылку на элемент, на котором вызвано контекстное меню
        customContextMenu.data('targetElement', $(this).attr('data-id'));
        
        return false;
    });
    
    // Скрываем контекстное меню при клике левой кнопкой мыши
    $(document).on('click', function() {
        $('#custom-context-menu').hide();
    });
    
    // Обработка пунктов контекстного меню
    $('#context-view').click(function() {
        const bookId = $('#custom-context-menu').data('targetElement');
        if (bookId) {
            const book = $(`.book[data-id="${bookId}"]`)[0];
            if (book) {
                showBookDetails(book);
            }
        }
    });
    
    $('#context-download').click(function() {
        const bookId = $('#custom-context-menu').data('targetElement');
        if (bookId) {
            const book = $(`.book[data-id="${bookId}"]`);
            if (book.length) {
                const filePath = book.attr('data-file-path');
                const link = document.createElement('a');
                link.href = filePath;
                link.download = '';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    });
    
    $('#context-share').click(function() {
        alert('Функция "Поделиться" будет доступна в следующей версии');
    });
    
    $('#context-favorite').click(function() {
        alert('Книга добавлена в избранное');
    });
    
    $('#context-report').click(function() {
        alert('Спасибо за сообщение о проблеме! Мы рассмотрим его в ближайшее время.');
    });
});

// Загрузка книг
function loadBooks() {
    // Используем демонстрационные данные
    renderBooks(getMockBooks());
}

// Рендеринг книг
function renderBooks(data) {
    const bookContainers = document.querySelectorAll('.books-flex');
    bookContainers.forEach(container => {
        container.innerHTML = '';
    });
    
    // Группировка книг по предметам
    const booksBySubject = {};
    
    data.books.forEach(book => {
        if (!booksBySubject[book.subject]) {
            booksBySubject[book.subject] = [];
        }
        booksBySubject[book.subject].push(book);
    });
    
    // Заполнение полок книгами
    Object.keys(booksBySubject).forEach(subject => {
        const container = document.getElementById(`${subject}-books`);
        if (container) {
            booksBySubject[subject].forEach(book => {
                container.appendChild(createBookElement(book));
            });
        }
    });
    
    // Добавление сообщения о пустых полках
    bookContainers.forEach(container => {
        if (container.children.length === 0) {
            const emptyShelf = document.createElement('div');
            emptyShelf.className = 'empty-shelf';
            emptyShelf.innerHTML = '<i class="ri-book-line"></i><p>На этой полке пока нет книг</p>';
            container.appendChild(emptyShelf);
        }
    });
}

// Создание элемента книги
function createBookElement(book) {
    const bookElement = document.createElement('div');
    bookElement.className = 'book';
    bookElement.setAttribute('data-id', book.id);
    bookElement.setAttribute('data-title', book.title);
    bookElement.setAttribute('data-author', book.author);
    bookElement.setAttribute('data-year', book.year);
    bookElement.setAttribute('data-subject', book.subject);
    bookElement.setAttribute('data-description', book.description || '');
    bookElement.setAttribute('data-file-path', book.file_path);
    
    bookElement.innerHTML = `
        <div class="book-cover">
            <img src="${book.cover_path || '/assets/img/default-book-cover.jpg'}" alt="${book.title}">
        </div>
        <div class="book-title">${book.title}</div>
        <div class="book-author">${book.author}</div>
    `;
    
    // Обработка клика по книге
    bookElement.addEventListener('click', function() {
        showBookDetails(this);
    });
    
    return bookElement;
}

// Отображение информации о книге
function showBookDetails(bookElement) {
    const modal = document.getElementById('book-info-modal');
    
    const bookId = bookElement.getAttribute('data-id');
    const bookTitle = bookElement.getAttribute('data-title');
    const bookAuthor = bookElement.getAttribute('data-author');
    const bookYear = bookElement.getAttribute('data-year');
    const bookSubject = bookElement.getAttribute('data-subject');
    const bookDescription = bookElement.getAttribute('data-description');
    const bookFilePath = bookElement.getAttribute('data-file-path');
    
    // Получение обложки
    const bookCoverImg = bookElement.querySelector('.book-cover img');
    const bookCoverPath = bookCoverImg.src;
    
    // Заполнение модального окна
    document.getElementById('modal-book-title').textContent = bookTitle;
    document.getElementById('modal-book-author').textContent = bookAuthor;
    document.getElementById('modal-book-year').textContent = bookYear;
    
    // Названия предметов для отображения
    const subjectNames = {
        'geology': 'Геология',
        'geophysics': 'Геофизика',
        'geochemistry': 'Геохимия',
        'hydrogeology': 'Гидрогеология',
        'nglaws': 'Горное право',
        'lythology': 'Литология',
        'mechanic': 'Механика',
        'mineralogy': 'Минералогия',
        'ngprovances': 'Нефтегазоносные провинции',
        'oilandgas': 'Нефтегазовое дело',
        'podschetzapasov': 'Подсчет запасов',
        'other': 'Разные дисциплины'
    };
    
    document.getElementById('modal-book-subject').textContent = subjectNames[bookSubject] || bookSubject;
    document.getElementById('modal-book-description').textContent = bookDescription || 'Описание отсутствует';
    document.getElementById('modal-book-cover').src = bookCoverPath;
    
    // Настройка кнопки скачивания
    const downloadLink = document.getElementById('modal-download-link');
    downloadLink.href = bookFilePath;
    downloadLink.setAttribute('download', '');
    
    // Настройка кнопки чтения онлайн
    const readOnlineBtn = document.getElementById('modal-read-online');
    readOnlineBtn.onclick = function() {
        const fileExt = bookFilePath.split('.').pop().toLowerCase();
        
        if (fileExt === 'pdf') {
            window.open(`/viewer/pdf-viewer.html?file=${encodeURIComponent(bookFilePath)}`, '_blank');
        } else {
            window.open(bookFilePath, '_blank');
        }
    };
    
    // Отображение модального окна
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Фильтрация книг по поисковому запросу
function filterBooks(searchTerm) {
    const books = document.querySelectorAll('.book');
    
    books.forEach(book => {
        const title = book.getAttribute('data-title').toLowerCase();
        const author = book.getAttribute('data-author').toLowerCase();
        
        if (title.includes(searchTerm) || author.includes(searchTerm)) {
            book.style.display = '';
        } else {
            book.style.display = 'none';
        }
    });
    
    checkEmptyShelves();
}

// Фильтрация по предмету
function filterBySubject(subject) {
    const flexSections = document.querySelectorAll('.flex-section');
    
    if (subject === 'all') {
        flexSections.forEach(section => {
            section.style.display = '';
        });
    } else {
        flexSections.forEach(section => {
            if (section.getAttribute('data-subject') === subject) {
                section.style.display = '';
            } else {
                section.style.display = 'none';
            }
        });
    }
}

// Проверка пустых полок после фильтрации
function checkEmptyShelves() {
    const bookContainers = document.querySelectorAll('.books-flex');
    
    bookContainers.forEach(container => {
        const visibleBooks = Array.from(container.querySelectorAll('.book')).filter(book => book.style.display !== 'none');
        const existingEmptyShelf = container.querySelector('.empty-shelf');
        
        if (visibleBooks.length === 0 && !existingEmptyShelf) {
            const emptyShelf = document.createElement('div');
            emptyShelf.className = 'empty-shelf';
            emptyShelf.innerHTML = '<i class="ri-book-line"></i><p>Книги не найдены</p>';
            container.appendChild(emptyShelf);
        } else if (visibleBooks.length > 0 && existingEmptyShelf) {
            existingEmptyShelf.remove();
        }
    });
}

// Тестовые данные книг
function getMockBooks() {
    return {
        success: true,
        books: [
            {
                id: 1,
                title: 'Основы геологии',
                author: 'Иванов И.И.',
                year: 2023,
                subject: 'geology',
                description: 'Фундаментальный учебник по основам геологии, включающий современные данные о строении Земли.',
                file_path: '#',
                cover_path: '/assets/img/bookscovers/generalGeology.jpeg'
            },
            {
                id: 2,
                title: 'Структурная геология',
                author: 'Корсаков А.К.',
                year: 2022,
                subject: 'geology',
                description: 'Учебное пособие по структурной геологии для студентов геологических специальностей.',
                file_path: '#',
                cover_path: '/assets/img/bookscovers/strukturnaya-geologiya_3.jpg'
            },
            {
                id: 3,
                title: 'Введение в разведочную геофизику',
                author: 'Вахромеев Г.С.',
                year: 2021,
                subject: 'geophysics',
                description: 'Вводный курс в геофизику для студентов нефтегазовых специальностей.',
                file_path: '#',
                cover_path: '/assets/img/bookscovers/34196.jpg'
            },
            {
                id: 4,
                title: 'Основы сейсморазведки',
                author: 'Бондарев В.И.',
                year: 2003,
                subject: 'geophysics',
                description: 'Современные методы сейсморазведки и их применение в нефтегазовой отрасли.',
                file_path: '#',
                cover_path: '/assets/img/bookscovers/osnovy-seysmorazvedki-uchebnoe-posobie-dlya-vuzov.jpg'
            },
            {
                id: 5,
                title: 'Основы геохимии',
                author: 'Войткевич Г.В.',
                year: 2000,
                subject: 'geochemistry',
                description: 'Базовый курс геохимии для студентов геологических специальностей.',
                file_path: '#',
                cover_path: '/assets/img/bookscovers/osnovy-geohimii_5.jpg'
            },
            {
                id: 6,
                title: 'Гидрогеология нефтяных и газовых месторождений',
                author: 'Карцев А.А.',
                year: 2002,
                subject: 'hydrogeology',
                description: 'Учебник по гидрогеологии нефтяных и газовых месторождений.',
                file_path: '#',
                cover_path: '/assets/img/bookscovers/gidrogeologiya-neftyanyh-i-gazovyh-mestorozhdeniy.jpg'
            },
            {
                id: 7,
                title: 'Горное право',
                author: 'Певзнер М.Е.',
                year: 2021,
                subject: 'nglaws',
                description: 'Актуальное законодательство в сфере недропользования в Российской Федерации.',
                file_path: '#',
                cover_path: '/assets/img/bookscovers/b25_070621_3d_p.jpg'
            },
            {
                id: 8,
                title: 'Литология осадочных пород',
                author: 'Кузнецов В.Г.',
                year: 2015,
                subject: 'lythology',
                description: 'Современный учебник по литологии осадочных пород.',
                file_path: '#',
                cover_path: '/assets/img/bookscovers/litologiya-osadochnye-gornye-porody-i-ih-izuchenie.jpg'
            }
        ]
    };
}
