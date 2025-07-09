function animateValue(id, start, end, duration, prefix = '', suffix = '') {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        let value = Math.floor(progress * (end - start) + start);

        if (id === 'tvlValue') {
            value = (value / 1000).toFixed(1) + 'M';
        } else if (id === 'usersCount') {
            value = (value / 1000).toFixed(1) + 'K';
        } else if (id === 'avgRate') {
            value = value.toFixed(1) + '%';
        }

        obj.textContent = prefix + value + suffix;

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('stats-section')) {
                animateValue('tvlValue', 0, 1200, 2000, '$');
                animateValue('loansCount', 0, 358, 1500);
                animateValue('avgRate', 0, 15.8, 1500);
                animateValue('usersCount', 0, 2500, 2000);
            }

            entry.target.classList.add('animate-fadeInUp');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.stats-section, .feature-card, .testimonial-card').forEach(el => {
    observer.observe(el);
});

if (window.innerWidth >= 768) {
    document.getElementById('desktop-nav').style.display = 'flex';
}