// Particle cursor effect — плавные частицы, следующие за курсором
document.addEventListener('DOMContentLoaded', function () {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Создаём canvas
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    `;
    hero.style.position = 'relative';
    hero.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = -1000;
    let mouseY = -1000;
    let animationId;

    // Настройка размера canvas
    function resizeCanvas() {
        const rect = hero.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Отслеживание мыши
    hero.addEventListener('mousemove', function (e) {
        const rect = hero.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    hero.addEventListener('mouseleave', function () {
        mouseX = -1000;
        mouseY = -1000;
    });

    // Класс частицы
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 2;
            this.speedY = (Math.random() - 0.5) * 2;
            this.opacity = 0.6 + Math.random() * 0.4;
            this.life = 1;
            this.decay = 0.01 + Math.random() * 0.02;
            // Цвета: бирюзовый, голубой, белый
            const colors = [
                [0, 212, 170],   // #00d4aa
                [0, 180, 220],   // #00b4dc
                [100, 200, 255], // #64c8ff
                [255, 255, 255], // #ffffff
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.r = color[0];
            this.g = color[1];
            this.b = color[2];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.speedX *= 0.98;
            this.speedY *= 0.98;
            this.life -= this.decay;
            this.opacity = this.life * 0.8;
        }

        draw() {
            if (this.life <= 0) return;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.opacity})`;
            ctx.fill();

            // Свечение
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * this.life * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.opacity * 0.15})`;
            ctx.fill();
        }
    }

    // Анимация
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Создаём новые частицы при движении мыши
        if (mouseX > 0 && mouseY > 0) {
            for (let i = 0; i < 3; i++) {
                particles.push(new Particle(
                    mouseX + (Math.random() - 0.5) * 20,
                    mouseY + (Math.random() - 0.5) * 20
                ));
            }
        }

        // Обновляем и рисуем частицы
        particles = particles.filter(p => p.life > 0);
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Ограничиваем количество частиц
        if (particles.length > 200) {
            particles = particles.slice(particles.length - 200);
        }

        animationId = requestAnimationFrame(animate);
    }

    animate();

    // Остановка анимации когда вкладка не видна
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
});