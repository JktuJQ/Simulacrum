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

walletButton.addEventListener('click', async () => {
    if (!walletConnected && window.ethereum) {
        try {
            walletButton.classList.remove('btn-primary');
            walletButton.classList.add('btn-secondary');
            walletButton.disabled = true;
            const web3 = new Web3(window.ethereum);
            // request accounts from MetaMask
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            // get list of accounts
            const accounts = await web3.eth.getAccounts();
            // get the first account and populate placeholder
            let address = accounts[0]

            let get_token = await fetch("http://localhost:8000/register", {
                method: "POST",
                body: address,
                headers: {
                    "Content-type": "raw; charset=UTF-8"
                }
            });

            console.log(get_token);

            walletButton.innerText = address;
            walletConnected = true;
        } catch (err) {
            walletButton.classList.remove('btn-secondary');
            walletButton.classList.add('btn-primary');
        }
        walletButton.disabled = false;
    } else if (walletConnected) {
        
    }
    else {
        // no Ethereum provider - instruct user to install MetaMask
        document.getElementById('warn').innerHTML =
            "Please <a href='https://metamask.io/download/'>install MetaMask</a>.";
        document.getElementById('requestAccounts').disabled = true;
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