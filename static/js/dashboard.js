let walletConnected = false;

function connectWallet() {
    walletConnected = true;
    document.getElementById('walletNotConnected').style.display = 'none';
    document.getElementById('walletConnected').style.display = 'block';

    const walletButton = document.getElementById('walletButton');
    const walletText = document.getElementById('walletText');
    if (walletButton && walletText) {
        walletText.textContent = '0x1234...5678';
        walletButton.classList.remove('btn-primary');
        walletButton.classList.add('btn-secondary');
    }

    console.log('Wallet connected successfully');
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.getElementById(tabName + 'Tab').classList.add('active');

    event.target.classList.add('active');

    localStorage.setItem('lastDashboardTab', tabName);
}

function confirmRepayment(loanId) {
    alert(`Погашение займа ${loanId} подтверждено! В реальном приложении здесь будет вызов смарт-контракта.`);

    // Close modal
    closeModal('repayModal1');

    console.log(`Loan ${loanId} has been repaid successfully`);
}

document.addEventListener('DOMContentLoaded', function() {
    const shouldConnectWallet = localStorage.getItem('walletConnected') === 'true';

    if (shouldConnectWallet) {
        connectWallet();
    }

    const lastTab = localStorage.getItem('lastDashboardTab');
    if (lastTab && walletConnected) {
        const tabButton = document.querySelector(`[onclick="showTab('${lastTab}')"]`);
        if (tabButton) {
            tabButton.click();
        }
    }
});