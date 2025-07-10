


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

document.addEventListener('DOMContentLoaded', async function() {
    let walletConnected = await isWalletConnected();
    if (walletConnected) {
        document.getElementById('walletNotConnected').style.display = 'none';
        document.getElementById('walletConnected').style.display = 'block';
    } else {
        document.getElementById('walletNotConnected').style.display = 'block';
        document.getElementById('walletConnected').style.display = 'none';
    }

    // const lastTab = localStorage.getItem('lastDashboardTab');
    // if (lastTab && walletConnected) {
    //     const tabButton = document.querySelector(`[onclick="showTab('${lastTab}')"]`);
    //     if (tabButton) {
    //         tabButton.click();
    //     }
    // }
});