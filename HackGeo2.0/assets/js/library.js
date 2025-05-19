document.addEventListener('DOMContentLoaded', function() {
    // Загрузка книг с сервера при загрузке страницы
    loadBooks();
    
    // Обработка открытия/закрытия модального окна загрузки книги
    const uploadModal = document.getElementById('upload-modal');
    const uploadBtn = document.getElementById('upload-book-btn');
    const closeBtn = uploadModal.querySelector('.close');
    const cancelBtn = uploadModal.querySelector('.cancel-btn');
    
    uploadBtn.addEventListener('click', function() {
        uploadModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Запрещаем прокрутку страницы
    });
    
    closeBtn.addEventListener('click', function() {
        uploadModal.style.display = 'none';
        document.body.style.overflow = ''; // Разрешаем прокрутку страницы
    });
    
    cancelBtn.addEventListener('click', function() {
        uploadModal.style.display = 'none';
        document.body.style.overflow = ''; // Разрешаем прокрутку страницы
    });
    
    // Закрытие модального окна при клике вне его содержимого
    window.addEventListener('click', function(event) {
        if (event.target === uploadModal) {
            uploadModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
    
    // Обработка выбора файла книги
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
    
    // Обработка кнопок "Обзор"
    const browseButtons = document.querySelectorAll('.browse-btn');
    browseButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.file-input-container').querySelector('input[type="file"]').click();
        });
    });
    
    // Обработка отправки формы
    const uploadForm = document.getElementById('upload-book-form');
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        // Отображаем индикатор загрузки или блокируем форму
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Загрузка...';
        submitBtn.disabled = true;
        
        fetch('/api/upload-book.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Успешная загрузка
                alert('Книга успешно загружена!');
                uploadModal.style.display = 'none';
                document.body.style.overflow = '';
                
                // Очищаем форму
                uploadForm.reset();
                bookFileNameDisplay.textContent = 'Файл не выбран';
                bookCoverNameDisplay.textContent = 'Файл не выбран';
                
                // Обновляем список книг
                loadBooks();
            } else {
                // Ошибка при загрузке
                alert('Ошибка: ' + (data.message || 'Не удалось загрузить книгу'));
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при загрузке книги');
        })
        .finally(() => {
            // Восстанавливаем кнопку
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });
    
    // Обработка поиска книг
    const searchInput = document.getElementById('book-search');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterBooks(searchTerm);
    });
    
    // Обработка фильтрации по предмету
    const subjectFilter = document.getElementById('subject-filter');
    subjectFilter.addEventListener('change', function() {
        const selectedSubject = this.value;
        filterBySubject(selectedSubject);
    });
    
    // Модальное окно с информацией о книге
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
});

// Функция для загрузки книг с сервера
function loadBooks() {
    fetch('/api/get-books.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Очищаем все контейнеры книг
                const bookContainers = document.querySelectorAll('.books-container');
                bookContainers.forEach(container => {
                    container.innerHTML = '';
                });
                
                // Группируем книги по предметам
                const booksBySubject = {};
                
                data.books.forEach(book => {
                    if (!booksBySubject[book.subject]) {
                        booksBySubject[book.subject] = [];
                    }
                    booksBySubject[book.subject].push(book);
                });
                
                // Заполняем контейнеры книгами
                Object.keys(booksBySubject).forEach(subject => {
                    const container = document.getElementById(`${subject}-books`);
                    if (container) {
                        booksBySubject[subject].forEach(book => {
                            container.appendChild(createBookElement(book));
                        });
                    }
                });
                
                // Добавляем сообщение для пустых полок
                bookContainers.forEach(container => {
                    if (container.children.length === 0) {
                        const emptyShelf = document.createElement('div');
                        emptyShelf.className = 'empty-shelf';
                        emptyShelf.innerHTML = '<i class="ri-book-line"></i><p>На этой полке пока нет книг</p>';
                        container.appendChild(emptyShelf);
                    }
                });
            } else {
                console.error('Ошибка загрузки книг:', data.message);
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки книг:', error);
        });
}

// Функция для создания элемента книги
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
        <div class="book-spine"></div>
        <div class="book-pages"></div>
        <div class="book-title">${book.title}</div>
    `;
    
    // Добавляем обработчик клика для отображения информации о книге
    bookElement.addEventListener('click', function() {
        showBookDetails(this);
    });
    
    return bookElement;
}

// Функция для отображения информации о книге
function showBookDetails(bookElement) {
    const modal = document.getElementById('book-info-modal');
    
    // Получаем данные книги из атрибутов
    const bookId = bookElement.getAttribute('data-id');
    const bookTitle = bookElement.getAttribute('data-title');
    const bookAuthor = bookElement.getAttribute('data-author');
    const bookYear = bookElement.getAttribute('data-year');
    const bookSubject = bookElement.getAttribute('data-subject');
    const bookDescription = bookElement.getAttribute('data-description');
    const bookFilePath = bookElement.getAttribute('data-file-path');
    
    // Получаем путь к обложке
    const bookCoverImg = bookElement.querySelector('.book-cover img');
    const bookCoverPath = bookCoverImg.src;
    
    // Заполняем модальное окно
    document.getElementById('modal-book-title').textContent = bookTitle;
    document.getElementById('modal-book-author').textContent = bookAuthor;
    document.getElementById('modal-book-year').textContent = bookYear;
    
    // Преобразуем код предмета в читаемое название
    const subjectNames = {
        'geology': 'Геология',
        'petrology': 'Петрология',
        'mineralogy': 'Минералогия',
        'geophysics': 'Геофизика',
        'geochemistry': 'Геохимия',
        'hydrogeology': 'Гидрогеология',
        'paleontology': 'Палеонтология',
        'oil-gas': 'Нефтегазовое дело',
        'mining': 'Горное дело',
        'ecology': 'Экология'
    };
    
    document.getElementById('modal-book-subject').textContent = subjectNames[bookSubject] || bookSubject;
    document.getElementById('modal-book-description').textContent = bookDescription || 'Описание отсутствует';
    document.getElementById('modal-book-cover').src = bookCoverPath;
    
    // Устанавливаем ссылку для скачивания
    const downloadLink = document.getElementById('modal-download-link');
    downloadLink.href = bookFilePath;
    downloadLink.setAttribute('download', '');
    
    // Устанавливаем обработчик для чтения онлайн
    const readOnlineBtn = document.getElementById('modal-read-online');
    readOnlineBtn.onclick = function() {
        // Проверяем расширение файла
        const fileExt = bookFilePath.split('.').pop().toLowerCase();
        
        if (fileExt === 'pdf') {
            // Открываем PDF в новой вкладке
            window.open(`/viewer/pdf-viewer.html?file=${encodeURIComponent(bookFilePath)}`, '_blank');
        } else {
            // Для других форматов просто открываем файл
            window.open(bookFilePath, '_blank');
        }
    };
    
    // Отображаем модальное окно
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Функция для фильтрации книг по поисковому запросу
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
    
    // Проверяем, есть ли видимые книги на полках
    checkEmptyShelves();
}

// Функция для фильтрации книг по предмету
function filterBySubject(subject) {
    const bookshelfSections = document.querySelectorAll('.bookshelf-section');
    
    if (subject === 'all') {
        // Показываем все разделы
        bookshelfSections.forEach(section => {
            section.style.display = '';
        });
    } else {
        // Показываем только выбранный раздел
        bookshelfSections.forEach(section => {
            if (section.getAttribute('data-subject') === subject) {
                section.style.display = '';
            } else {
                section.style.display = 'none';
            }
        });
    }
}

// Функция для проверки пустых полок после фильтрации
function checkEmptyShelves() {
    const bookContainers = document.querySelectorAll('.books-container');
    
    bookContainers.forEach(container => {
        const visibleBooks = Array.from(container.querySelectorAll('.book')).filter(book => book.style.display !== 'none');
        const existingEmptyShelf = container.querySelector('.empty-shelf');
        
        if (visibleBooks.length === 0 && !existingEmptyShelf) {
            // Нет видимых книг и нет сообщения о пустой полке
            const emptyShelf = document.createElement('div');
            emptyShelf.className = 'empty-shelf';
            emptyShelf.innerHTML = '<i class="ri-book-line"></i><p>Книги не найдены</p>';
            container.appendChild(emptyShelf);
        } else if (visibleBooks.length > 0 && existingEmptyShelf) {
            // Есть видимые книги и есть сообщение о пустой полке
            existingEmptyShelf.remove();
        }
    });
}

// Имитация данных книг для демонстрации (замените на реальный API)
// Эта функция будет использоваться, если API не настроен
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
                title: 'Основы геологии',
                author: 'Иванов И.И.',
                year: 2023,
                subject: 'geology',
                description: 'Фундаментальный учебник по основам геологии, включающий современные данные о строении Земли.',
                file_path: '#',
                cover_path: '/assets/img/bookscovers/generalGeology.jpeg'
            },
            {
                id: 3,
                title: 'Основы геологии',
                author: 'Иванов И.И.',
                year: 2023,
                subject: 'geology',
                description: 'Фундаментальный учебник по основам геологии, включающий современные данные о строении Земли.',
                file_path: '#',
                cover_path: '/assets/img/bookscovers/generalGeology.jpeg'
            },
            {
                id: 4,
                title: 'Основы геологии',
                author: 'Иванов И.И.',
                year: 2023,
                subject: 'geology',
                description: 'Фундаментальный учебник по основам геологии, включающий современные данные о строении Земли.',
                file_path: '#',
                cover_path: '/assets/img/bookscovers/generalGeology.jpeg'
            },
            {
                id: 5,
                title: 'Основы геологии',
                author: 'Иванов И.И.',
                year: 2023,
                subject: 'geology',
                description: 'Фундаментальный учебник по основам геологии, включающий современные данные о строении Земли.',
                file_path: '#',
                cover_path: '/assets/img/bookscovers/generalGeology.jpeg'
            }
        ]
    };
}

// Перехват запроса к API, если он не настроен
function loadBooks() {
    try {
        fetch('/api/get-books.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderBooks(data);
                } else {
                    console.error('Ошибка загрузки книг:', data.message);
                    // Используем демонстрационные данные
                    renderBooks(getMockBooks());
                }
            })
            .catch(error => {
                console.warn('API не настроен, используем демонстрационные данные');
                renderBooks(getMockBooks());
            });
    } catch (error) {
        console.warn('API не настроен, используем демонстрационные данные');
        renderBooks(getMockBooks());
    }
}

// Функция для рендеринга книг
function renderBooks(data) {
    // Очищаем все контейнеры книг
    const bookContainers = document.querySelectorAll('.books-container');
    bookContainers.forEach(container => {
        container.innerHTML = '';
    });
    
    // Группируем книги по предметам
    const booksBySubject = {};
    
    data.books.forEach(book => {
        if (!booksBySubject[book.subject]) {
            booksBySubject[book.subject] = [];
        }
        booksBySubject[book.subject].push(book);
    });
    
    // Заполняем контейнеры книгами
    Object.keys(booksBySubject).forEach(subject => {
        const container = document.getElementById(`${subject}-books`);
        if (container) {
            booksBySubject[subject].forEach(book => {
                container.appendChild(createBookElement(book));
            });
        }
    });
    
    // Добавляем сообщение для пустых полок
    bookContainers.forEach(container => {
        if (container.children.length === 0) {
            const emptyShelf = document.createElement('div');
            emptyShelf.className = 'empty-shelf';
            emptyShelf.innerHTML = '<i class="ri-book-line"></i><p>На этой полке пока нет книг</p>';
            container.appendChild(emptyShelf);
        }
    });
}
