/**
 * Contact Form Handler
 * Обработка формы обратной связи с валидацией и AJAX-отправкой
 */

(function () {
    'use strict';

    // ===== Элементы формы =====
    const form = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const messageTextarea = document.getElementById('message');
    const submitBtn = form?.querySelector('button[type="submit"]');

    if (!form) return;

    // ===== Валидация =====

    /**
     * Валидация email
     */
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.trim());
    }

    /**
     * Валидация имени (минимум 2 символа, только буквы, цифры, пробелы и дефис)
     */
    function validateName(name) {
        const re = /^[a-zA-Zа-яА-ЯёЁ\s\-]{2,50}$/;
        return re.test(name.trim());
    }

    /**
     * Валидация телефона (форматирует и проверяет номер)
     */
    function validatePhone(phone) {
        // Убираем все нецифровые символы, кроме +
        const digits = phone.replace(/[^\d+]/g, '');
        // Минимум 10 цифр (без учёта кода страны)
        const cleanDigits = digits.replace('+', '');
        return cleanDigits.length >= 10;
    }

    /**
     * Получение "чистых" цифр из строки телефона
     */
    function getPhoneDigits(phone) {
        return phone.replace(/[^\d]/g, '');
    }

    /**
     * Форматирование телефона в вид +7 (XXX) XXX-XX-XX
     */
    function formatPhone(value) {
        const digits = getPhoneDigits(value);

        // Если начинается с 8, заменяем на 7
        let cleaned = digits;
        if (cleaned.startsWith('8') && cleaned.length === 11) {
            cleaned = '7' + cleaned.substring(1);
        }

        // Если начинается с 7 и длина 11, убираем ведущую 7 для форматирования
        if (cleaned.startsWith('7') && cleaned.length === 11) {
            cleaned = cleaned.substring(1);
        }

        // Если длина 10 и не начинается с 7, добавляем 7
        if (cleaned.length === 10 && !cleaned.startsWith('7')) {
            cleaned = '7' + cleaned;
        }

        let formatted = '+7 (';
        if (cleaned.length >= 1 && cleaned.startsWith('7')) {
            cleaned = cleaned.substring(1);
        }

        if (cleaned.length > 0) {
            formatted += cleaned.substring(0, 3);
        }
        if (cleaned.length >= 3) {
            formatted += ') ' + cleaned.substring(3, 6);
        }
        if (cleaned.length >= 6) {
            formatted += '-' + cleaned.substring(6, 8);
        }
        if (cleaned.length >= 8) {
            formatted += '-' + cleaned.substring(8, 10);
        }

        return formatted;
    }

    /**
     * Показ ошибки для поля
     */
    function showFieldError(input, message) {
        // Удаляем старую ошибку
        removeFieldError(input);

        const errorEl = document.createElement('span');
        errorEl.className = 'field-error';
        errorEl.style.cssText = `
            font-size: 0.75rem;
            color: #ff4757;
            margin-top: 4px;
            display: block;
        `;
        errorEl.textContent = message;
        input.style.borderColor = '#ff4757';
        input.parentNode.appendChild(errorEl);
    }

    /**
     * Удаление ошибки поля
     */
    function removeFieldError(input) {
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        input.style.borderColor = '';
    }

    /**
     * Очистка всех ошибок
     */
    function clearAllErrors() {
        [nameInput, phoneInput, emailInput, messageTextarea].forEach(removeFieldError);
    }

    /**
     * Валидация всей формы
     * @returns {object|null} Объект с данными или null при ошибке
     */
    function validateForm() {
        clearAllErrors();
        let isValid = true;
        const errors = [];

        // Имя
        const name = nameInput.value.trim();
        if (!name) {
            showFieldError(nameInput, 'Пожалуйста, введите ваше имя');
            errors.push('Имя обязательно');
            isValid = false;
        } else if (!validateName(name)) {
            showFieldError(nameInput, 'Имя должно содержать минимум 2 символа');
            errors.push('Некорректное имя');
            isValid = false;
        }

        // Телефон
        const phone = phoneInput.value.trim();
        if (!phone) {
            showFieldError(phoneInput, 'Пожалуйста, введите номер телефона');
            errors.push('Телефон обязателен');
            isValid = false;
        } else if (!validatePhone(phone)) {
            showFieldError(phoneInput, 'Введите корректный номер телефона');
            errors.push('Некорректный телефон');
            isValid = false;
        }

        // Email
        const email = emailInput.value.trim();
        if (!email) {
            showFieldError(emailInput, 'Пожалуйста, введите email');
            errors.push('Email обязателен');
            isValid = false;
        } else if (!validateEmail(email)) {
            showFieldError(emailInput, 'Введите корректный email');
            errors.push('Некорректный email');
            isValid = false;
        }

        // Сообщение (опционально, но проверяем длину)
        const message = messageTextarea.value.trim();
        if (message && message.length > 2000) {
            showFieldError(messageTextarea, 'Сообщение слишком длинное (макс. 2000 символов)');
            errors.push('Сообщение слишком длинное');
            isValid = false;
        }

        if (!isValid) {
            console.warn('Валидация не пройдена:', errors);
        }

        return isValid ? {
            name: name,
            phone: phone,
            email: email,
            message: message
        } : null;
    }

    // ===== Отправка формы =====

    /**
     * AJAX отправка данных через FormSubmit
     */
    async function submitForm(data) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('phone', data.phone);
        formData.append('email', data.email);
        formData.append('message', data.message);
        formData.append('_subject', 'Новая заявка с arifulin.ru');
        formData.append('_captcha', 'false');
        formData.append('_template', 'table');

        try {
            const response = await fetch('https://formsubmit.co/ajax/arifulin@gmail.com', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Ошибка отправки формы:', error);
            throw error;
        }
    }

    /**
     * Показ состояния загрузки
     */
    function setLoading(loading) {
        if (loading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            form.classList.add('form-loading');
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            form.classList.remove('form-loading');
        }
    }

    /**
     * Показ успешной отправки
     */
    function showSuccess() {
        const wrapper = form.closest('.contact-form-wrapper');
        if (!wrapper) return;

        // Скрываем форму
        form.style.display = 'none';

        // Создаём сообщение об успехе
        const successEl = document.createElement('div');
        successEl.className = 'form-success show';
        successEl.innerHTML = `
            <div class="form-success-icon">✓</div>
            <h3>Сообщение отправлено!</h3>
            <p>Спасибо, ${escapeHtml(form.querySelector('[name="name"]').value)}! Я свяжусь с вами в ближайшее время.</p>
        `;
        wrapper.appendChild(successEl);
    }

    /**
     * Показ ошибки отправки
     */
    function showError(message) {
        const wrapper = form.closest('.contact-form-wrapper');
        if (!wrapper) return;

        const errorEl = document.createElement('div');
        errorEl.className = 'form-error show';
        errorEl.innerHTML = `
            <h3>Ошибка отправки</h3>
            <p>${escapeHtml(message || 'Произошла ошибка при отправке. Пожалуйста, попробуйте позже или свяжитесь напрямую по email.')}</p>
        `;
        wrapper.appendChild(errorEl);

        // Восстанавливаем форму через 5 секунд
        setTimeout(() => {
            form.style.display = '';
            errorEl.remove();
        }, 5000);
    }

    /**
     * Экранирование HTML для безопасности
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== Обработчики событий =====

    // Отправка формы
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Валидация
        const data = validateForm();
        if (!data) return;

        // Отправка
        setLoading(true);

        try {
            await submitForm(data);
            showSuccess();
        } catch (error) {
            console.error('Form submission error:', error);
            showError('Не удалось отправить сообщение. Попробуйте ещё раз или напишите на arifulin@gmail.com');
        } finally {
            setLoading(false);
        }
    });

    // Форматирование телефона в реальном времени
    phoneInput.addEventListener('input', function () {
        const cursorPos = this.selectionStart;
        const prevLength = this.value.length;
        const formatted = formatPhone(this.value);
        this.value = formatted;

        // Корректируем позицию курсора
        const newLength = this.value.length;
        const diff = newLength - prevLength;
        const newPos = cursorPos + diff;
        this.setSelectionRange(newPos, newPos);
    });

    // Очистка ошибок при фокусе
    [nameInput, phoneInput, emailInput, messageTextarea].forEach(input => {
        input.addEventListener('focus', function () {
            removeFieldError(this);
        });
    });

    // Очистка ошибок при вводе (после первой валидации)
    let isFormTouched = false;
    form.addEventListener('input', function () {
        if (isFormTouched) {
            clearAllErrors();
        }
    });

    // Отмечаем форму как "тронутую" после первой попытки отправки
    form.addEventListener('submit', function () {
        isFormTouched = true;
    });

})();