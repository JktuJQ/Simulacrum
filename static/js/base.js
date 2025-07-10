window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

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
    let accounts = await window.ethereum.request({ method: 'eth_accounts' })
    return !(accounts === undefined || accounts.length === 0)
    
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

        // if (window.location.href === "http://localhost:8000/dashboard") { // if logged in on dashboard -> reload
        //     window.location.reload();
        // }

    } catch (err) {
        console.log(err);
    }
    walletButtonToggle(walletButton);
}

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

window.ethereum.on('accountsChanged', async () => {
    window.location.reload();
});

document.addEventListener('DOMContentLoaded', async function() {
    let walletConnected = await isWalletConnected();

    let walletButton = document.querySelector('#walletButton #walletText');
    if (walletConnected) {
        walletButton.innerText = 'Подключено';
    } else {
        walletButton.innerText = 'Подключить кошелек';
    }
    // const lastTab = localStorage.getItem('lastDashboardTab');
    // if (lastTab && walletConnected) {
    //     const tabButton = document.querySelector(`[onclick="showTab('${lastTab}')"]`);
    //     if (tabButton) {
    //         tabButton.click();
    //     }
    // }
});