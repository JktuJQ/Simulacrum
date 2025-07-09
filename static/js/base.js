window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

walletConnected = false;
const walletButton = document.getElementById('walletButton');
const walletText = document.getElementById('walletText');

walletButton.addEventListener('click', function() {
    if (!walletConnected) {
        walletConnected = true;
        walletText.textContent = '0x1234...5678';
        walletButton.classList.remove('btn-primary');
        walletButton.classList.add('btn-secondary');

        console.log('Connecting to wallet...');
    } else {
        walletConnected = false;
        walletText.textContent = 'Подключить кошелек';
        walletButton.classList.remove('btn-secondary');
        walletButton.classList.add('btn-primary');

        console.log('Disconnecting wallet...');
    }
});

const mobileMenuButton = document.getElementById('mobile-menu-button');
const desktopNav = document.getElementById('desktop-nav');

function checkScreenSize() {
    if (window.innerWidth < 768) {
        desktopNav.style.display = 'none';
        mobileMenuButton.style.display = 'block';
    } else {
        desktopNav.style.display = 'flex';
        mobileMenuButton.style.display = 'none';
    }
}

window.addEventListener('resize', checkScreenSize);
checkScreenSize();

function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
});