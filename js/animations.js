// ===== SCROLL ANIMATIONS (Intersection Observer) =====
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            scrollObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-in.animate-on-scroll').forEach(el => {
    scrollObserver.observe(el);
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function updateActiveNav() {
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// ===== MOBILE NAV TOGGLE =====
const navToggle = document.querySelector('.nav-toggle');
const navLinksEl = document.querySelector('.nav-links');

if (navToggle && navLinksEl) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinksEl.classList.toggle('open');
    });

    // Close menu on link click
    navLinksEl.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinksEl.classList.remove('open');
        });
    });
}

// ===== DYNAMIC FOOTER YEAR =====
document.getElementById('footer-year').textContent = new Date().getFullYear();

// ===== PRIVACY MODAL =====
const privacyModal = document.getElementById('privacy-modal');
const privacyLinks = document.querySelectorAll('a[href="#privacy"]');
const modalClose = document.querySelector('.modal-close');

// Open modal
privacyLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        privacyModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    });
});

// Close modal
if (modalClose) {
    modalClose.addEventListener('click', () => {
        privacyModal.classList.remove('show');
        document.body.style.overflow = '';
    });
}

// Close on backdrop click
privacyModal.addEventListener('click', (e) => {
    if (e.target === privacyModal) {
        privacyModal.classList.remove('show');
        document.body.style.overflow = '';
    }
});

// Close on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && privacyModal.classList.contains('show')) {
        privacyModal.classList.remove('show');
        document.body.style.overflow = '';
    }
});

// ===== PHONE INPUT MASK =====
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
        e.target.value = !x[2] ? (x[1] ? '+7 (' : '') : '+7 (' + x[2] + (x[3] ? ') ' + x[3] : '') + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
    });
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#privacy') return; // handled by modal

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
// ===== CONTACT FORM SUBMISSION HANDLER =====
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        // Check honeypot
        if (this._gotcha && this._gotcha.value !== '') {
            e.preventDefault();
            return;
        }

        e.preventDefault();

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;

        const formData = new FormData(this);

        try {
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Success - show message
                const msg = document.createElement('div');
                msg.style.cssText = `
                    text-align: center;
                    padding: 20px;
                    background: rgba(0, 212, 170, 0.1);
                    border: 1px solid rgba(0, 212, 170, 0.3);
                    border-radius: 8px;
                    color: #00d4aa;
                    font-size: 0.95rem;
                    margin-top: 16px;
                `;
                msg.textContent = '✓ Сообщение отправлено! Я свяжусь с вами в ближайшее время.';

                // Clear form
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;

                // Insert message after form
                this.parentElement.insertBefore(msg, this.nextSibling);

                // Remove message after 8 seconds
                setTimeout(() => msg.remove(), 8000);
            } else {
                throw new Error('Сервер вернул ошибку');
            }
        } catch (error) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            const err = document.createElement('div');
            err.style.cssText = `
                text-align: center;
                padding: 20px;
                background: rgba(255, 100, 100, 0.1);
                border: 1px solid rgba(255, 100, 100, 0.3);
                border-radius: 8px;
                color: #ff6464;
                font-size: 0.95rem;
                margin-top: 16px;
            `;
            err.textContent = '✗ Не удалось отправить сообщение. Попробуйте написать напрямую на arifulin@gmail.com.';
            this.parentElement.insertBefore(err, this.nextSibling);
            setTimeout(() => err.remove(), 10000);
        }
    });
}
