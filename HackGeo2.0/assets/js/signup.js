// тема из localstorage
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    // Обработчик изменения типа пользователя
    const radioButtons = document.querySelectorAll('input[name="whoareyou"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            updateFormFields(this.value);
        });
    });
    
    // Инициализация формы
    updateFormFields('student');
    
    // отправка формы
    const form = document.querySelector('form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // проверка совпадения паролей
        if (validateForm()) {
            this.submit();
        }
    });

    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('passwordapproval');
    
    passwordField.addEventListener('input', function() {
        if (confirmPasswordField.value) {
            validatePasswordMatch();
        }
    });
    
    confirmPasswordField.addEventListener('input', validatePasswordMatch);
    
    // показать пароль
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            // Переключение типа поля между password и text
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('ri-eye-line');
                icon.classList.add('ri-eye-off-line');
            } else {
                input.type = 'password';
                icon.classList.remove('ri-eye-off-line');
                icon.classList.add('ri-eye-line');
            }
        });
    });

    // отключить контекстное меню
    $(document).on('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
});

// поля в зависимости от пользователя
function updateFormFields(userType) {
    const studentFields = document.getElementById('student-fields');
    const specialistFields = document.getElementById('specialist-fields');
    
    if (userType === 'student') {
        specialistFields.classList.add('hidden');
        studentFields.classList.remove('hidden');
        
        // для студента - обязательно, для специалиста нет
        document.getElementById('university').setAttribute('required', '');
        document.getElementById('group').setAttribute('required', '');
        document.getElementById('occupation').removeAttribute('required');
    } else if (userType === 'specialist') {
        studentFields.classList.add('hidden');
        specialistFields.classList.remove('hidden');
        
        // наоборот
        document.getElementById('occupation').setAttribute('required', '');
        document.getElementById('university').removeAttribute('required');
        document.getElementById('group').removeAttribute('required');
    }
}

// валидация паролей
function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('passwordapproval').value;
    const errorMessage = document.getElementById('password-error');
    const confirmField = document.getElementById('passwordapproval');
    
    if (password !== confirmPassword) {
        // Пароли не совпадают
        errorMessage.style.display = 'block';
        confirmField.classList.add('error');
        confirmField.classList.remove('valid');
        return false;
    } else {
        // Пароли совпадают
        errorMessage.style.display = 'none';
        confirmField.classList.remove('error');
        confirmField.classList.add('valid');
        return true;
    }
}

// валидация всей формы
function validateForm() {
    const isPasswordValid = validatePasswordMatch();
    
    // добавить проверки всех полей формы
    
    return isPasswordValid;
}