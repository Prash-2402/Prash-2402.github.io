/* Portfolio Scripts */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Intro Animation
    const introOverlay = document.getElementById('intro-overlay');
    if (introOverlay) {
        setTimeout(() => {
            introOverlay.style.transition = 'opacity 1s ease';
            introOverlay.style.opacity = '0';
            setTimeout(() => {
                introOverlay.style.display = 'none';
            }, 1000);
        }, 2500); // Wait 2.5s before fading out
    }

    // 2. Starfield Background
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const starContainer = document.getElementById('star-container');
    
    if (starContainer) {
        starContainer.appendChild(canvas);
        
        let width, height;
        let stars = [];
        
        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            initStars();
        };

        const initStars = () => {
            stars = [];
            const starCount = Math.floor((width * height) / 4000); // Density
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.5,
                    vx: (Math.random() - 0.5) * 0.2, // Slow horizontal drift
                    vy: (Math.random() - 0.5) * 0.2, // Slow vertical drift
                    alpha: Math.random(),
                    flashSpeed: Math.random() * 0.02 + 0.005
                });
            }
        };

        const animateStars = () => {
            ctx.clearRect(0, 0, width, height);
            
            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.fill();

                // Move
                star.x += star.vx;
                star.y += star.vy;

                // Wrap around
                if (star.x < 0) star.x = width;
                if (star.x > width) star.x = 0;
                if (star.y < 0) star.y = height;
                if (star.y > height) star.y = 0;

                // Twinkle
                star.alpha += star.flashSpeed;
                if (star.alpha > 1 || star.alpha < 0.2) {
                    star.flashSpeed = -star.flashSpeed;
                }
            });

            requestAnimationFrame(animateStars);
        };

        window.addEventListener('resize', resize);
        resize();
        animateStars();
    }

    // 3. Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.glass-panel, .section-title, .hero-content');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        revealObserver.observe(el);
    });
});
