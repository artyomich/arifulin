// Letter-following-cursor effect (like genkou.ru)
document.addEventListener('DOMContentLoaded', function() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const letterParticles = document.querySelectorAll('.letter-particle');
    if (letterParticles.length === 0) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    hero.addEventListener('mousemove', function(e) {
        const rect = hero.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    // Initialize positions
    letterParticles.forEach((el, i) => {
        el.style.position = 'absolute';
        el.style.left = (Math.random() * 100) + '%';
        el.style.top = (Math.random() * 100) + '%';
        el.style.opacity = (0.05 + Math.random() * 0.1);
        el.style.fontSize = (14 + Math.random() * 16) + 'px';
        el.style.pointerEvents = 'none';
        el.style.userSelect = 'none';
    });

    function animate() {
        letterParticles.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const heroRect = hero.getBoundingClientRect();
            const elX = rect.left - heroRect.left;
            const elY = rect.top - heroRect.top;

            const dx = mouseX - elX;
            const dy = mouseY - elY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 200) {
                const force = (200 - dist) / 200;
                const newX = elX + dx * force * 0.15;
                const newY = elY + dy * force * 0.15;
                el.style.left = (newX / heroRect.width * 100) + '%';
                el.style.top = (newY / heroRect.height * 100) + '%';
                el.style.opacity = 0.15 + force * 0.2;
                el.style.fontSize = (14 + force * 10) + 'px';
            }
        });

        requestAnimationFrame(animate);
    }

    animate();
});