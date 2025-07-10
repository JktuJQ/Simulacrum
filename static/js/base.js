window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});


function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function walletButtonToggle() {
    if ('btn-primary' in walletButton.classList) {
        walletButton.classList.remove('btn-primary');
        walletButton.classList.add('btn-secondary');
        walletButton.disabled = true;
    } else {
        walletButton.classList.remove('btn-secondary');
        walletButton.classList.add('btn-primary');
        walletButton.disabled = false;
    }
}

async function isWalletConnected() {
    walletConnected = getCookie('walletConnected');
    if (walletConnected) {
        try {
            await auth_metamask();
            return true;
        } catch {
            setCookie('walletConnected', false, 100);
        }
        return false;
    }
}

async function auth_metamask() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
}

async function connectWallet(walletButton) {
    if (!window.ethereum) {
        // no Ethereum provider - instruct user to install MetaMask
        document.getElementById('warn').innerHTML =
            "Please <a href='https://metamask.io/download/'>install MetaMask</a>.";
        return;
    }

    if (await isWalletConnected()) {
        return;
    }

    try {

        const web3 = new Web3(window.ethereum);

        // request accounts from MetaMask
        await auth_metamask();
        // // get list of accounts
        const accounts = await web3.eth.getAccounts();
        let address = accounts[0]

        walletButton.innerText = address;
        setCookie('walletConnected', true, 5);
    } catch (err) {
        console.log(err);
    }
    walletButtonToggle(walletButton);
}


walletButton.addEventListener('click', async () => {
    
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