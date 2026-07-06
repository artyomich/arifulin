// ===== SCROLL ANIMATIONS (Intersection Observer) =====
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.fade-in').forEach(el => scrollObserver.observe(el));

// ===== SMOOTH SCROLL FOR NAV LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== HERO AVATAR PULSE GLOW ANIMATION =====
(function initAvatarPulse() {
    const avatar = document.querySelector('.hero-avatar');
    if (!avatar) return;

    // Create glow rings
    const glowContainer = document.createElement('div');
    glowContainer.className = 'avatar-glow-container';
    avatar.parentNode.insertBefore(glowContainer, avatar);

    for (let i = 0; i < 3; i++) {
        const ring = document.createElement('div');
        ring.className = 'avatar-glow-ring';
        ring.style.animationDelay = `${i * 0.6}s`;
        glowContainer.appendChild(ring);
    }

    // Move avatar into container
    glowContainer.appendChild(avatar);
})();