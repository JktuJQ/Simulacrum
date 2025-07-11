


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

// dashboard.js (add to existing file)
async function loadUserLoans() {
    const myLoans = JSON.parse(localStorage.getItem('myLoans')) || [];
    const fundedLoans = JSON.parse(localStorage.getItem('fundedLoans')) || [];
    const allLoanIds = [...new Set([...myLoans, ...fundedLoans])];

    for (const loanId of allLoanIds) {
        try {
            const loan = await getLoanDetails(loanId);
            renderLoanCard(loan);
        } catch (error) {
            console.error(`Error loading loan ${loanId}:`, error);
        }
    }
}

function renderLoanCard(loan) {
    const isBorrower = loan.borrower === currentUser;
    const isLender = loan.lender === currentUser;

    const card = document.createElement('div');
    card.className = 'dashboard-card';
    card.innerHTML = `
        <div class="card-header">
            <div>
                <div class="card-title">${isBorrower ? 'Займ' : 'Инвестиция'} #${loan.id}</div>
                <div class="card-id">ID: ${loan.id}</div>
            </div>
            <div class="status-badge">${getStatusText(loan.status)}</div>
        </div>
        <!-- Add other loan details here -->
    `;

    document.getElementById('loansContainer').appendChild(card);
}

function getStatusText(status) {
    const statusMap = {
        '0': 'Ожидает',
        '1': 'В процессе',
        '2': 'Активный',
        '3': 'Погашен',
        '4': 'Просрочен',
        '5': 'Отменен',
        '6': 'Ликвидирован'
    };
    return statusMap[status] || 'Неизвестно';
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    if (await isWalletConnected()) {
        await initContract();
        loadUserLoans();
    }
});
