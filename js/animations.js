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

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#privacy' || href === '#cookie-policy') return; // handled by modals

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

// ===== COOKIE BANNER =====
(function() {
    const COOKIE_CONSENT_KEY = 'cookie_consent_given';
    const cookieBanner = document.getElementById('cookie-banner');
    const cookieAcceptBtn = document.getElementById('cookie-accept');
    const cookieSettingsBtn = document.getElementById('cookie-settings');
    const cookieModal = document.getElementById('cookie-modal');
    const cookieModalLinks = document.querySelectorAll('a[href="#cookie-policy"]');
    const cookieModalClose = cookieModal ? cookieModal.querySelector('.modal-close') : null;

    function showBanner() {
        if (cookieBanner) {
            cookieBanner.classList.add('show');
        }
    }

    function hideBanner() {
        if (cookieBanner) {
            cookieBanner.classList.remove('show');
        }
    }

    function acceptCookies() {
        try { localStorage.setItem(COOKIE_CONSENT_KEY, 'true'); } catch(e) {}
        hideBanner();
    }

    // Show banner only if user hasn't accepted yet
    if (cookieBanner) {
        let consentGiven = false;
        try { consentGiven = localStorage.getItem(COOKIE_CONSENT_KEY) === 'true'; } catch(e) {}
        if (!consentGiven) {
            setTimeout(showBanner, 1500);
        }
    }

    // Accept button
    if (cookieAcceptBtn) {
        cookieAcceptBtn.addEventListener('click', acceptCookies);
    }

    // Settings button - open cookie policy modal
    if (cookieSettingsBtn) {
        cookieSettingsBtn.addEventListener('click', function() {
            hideBanner();
        });
    }

    // Open cookie policy modal from "Подробнее" link
    cookieModalLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            hideBanner();
            cookieModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close cookie modal
    if (cookieModalClose) {
        cookieModalClose.addEventListener('click', function() {
            cookieModal.classList.remove('show');
            document.body.style.overflow = '';
        });
    }

    // Close cookie modal on backdrop click
    if (cookieModal) {
        cookieModal.addEventListener('click', function(e) {
            if (e.target === cookieModal) {
                cookieModal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }

    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && cookieModal && cookieModal.classList.contains('show')) {
            cookieModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
})();
