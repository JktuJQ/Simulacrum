// contract.js
let contract;
let contractAddress = '0x0C0ed55744Eb8898377e494C49508C8df908F2D5';
let contractABI = [{
    "inputs": [{"internalType": "address", "name": "_usdcTokenAddress", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "id", "type": "uint256"}],
    "name": "DealCancell",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "id", "type": "uint256"}, {
        "indexed": true,
        "internalType": "address",
        "name": "confirmer",
        "type": "address"
    }],
    "name": "DealConfirmed",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "id", "type": "uint256"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "dueDate",
        "type": "uint256"
    }],
    "name": "LoanActivated",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "id", "type": "uint256"}],
    "name": "LoanOverdue",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "id", "type": "uint256"}, {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
    }, {"indexed": false, "internalType": "uint256", "name": "USDC", "type": "uint256"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "repayment",
        "type": "uint256"
    }, {"indexed": false, "internalType": "uint256", "name": "ETH", "type": "uint256"}],
    "name": "LoanRequestAwaiting",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "id", "type": "uint256"}],
    "name": "LoanReturned",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "id", "type": "uint256"}, {
        "indexed": true,
        "internalType": "address",
        "name": "lender",
        "type": "address"
    }],
    "name": "RequestPending",
    "type": "event"
}, {
    "inputs": [],
    "name": "ETHRatio",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_loanId", "type": "uint256"}],
    "name": "cancelDeal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_loanId", "type": "uint256"}],
    "name": "confirmDeal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_USDC", "type": "uint256"}, {
        "internalType": "uint256",
        "name": "_percent",
        "type": "uint256"
    }, {"internalType": "uint256", "name": "_TimeDelta", "type": "uint256"}],
    "name": "createLoanRequest",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
}, {
    "inputs": [],
    "name": "ethPriceInUsdt",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_loanId", "type": "uint256"}],
    "name": "fundRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_loanId", "type": "uint256"}],
    "name": "getLoanDetails",
    "outputs": [{
        "components": [{
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
        }, {"internalType": "address", "name": "borrower", "type": "address"}, {
            "internalType": "address",
            "name": "lender",
            "type": "address"
        }, {"internalType": "uint256", "name": "USDC", "type": "uint256"}, {
            "internalType": "uint256",
            "name": "Percent",
            "type": "uint256"
        }, {"internalType": "uint256", "name": "ETH", "type": "uint256"}, {
            "internalType": "uint256",
            "name": "TimeDelta",
            "type": "uint256"
        }, {"internalType": "uint256", "name": "dueDate", "type": "uint256"}, {
            "internalType": "bool",
            "name": "borrowerConfirmed",
            "type": "bool"
        }, {
            "internalType": "bool",
            "name": "lenderConfirmed",
            "type": "bool"
        }, {"internalType": "enum Simulacrum.Status", "name": "status", "type": "uint8"}],
        "internalType": "struct Simulacrum.Loan",
        "name": "",
        "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_loanId", "type": "uint256"}],
    "name": "liquidateLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "loans",
    "outputs": [{"internalType": "uint256", "name": "id", "type": "uint256"}, {
        "internalType": "address",
        "name": "borrower",
        "type": "address"
    }, {"internalType": "address", "name": "lender", "type": "address"}, {
        "internalType": "uint256",
        "name": "USDC",
        "type": "uint256"
    }, {"internalType": "uint256", "name": "Percent", "type": "uint256"}, {
        "internalType": "uint256",
        "name": "ETH",
        "type": "uint256"
    }, {"internalType": "uint256", "name": "TimeDelta", "type": "uint256"}, {
        "internalType": "uint256",
        "name": "dueDate",
        "type": "uint256"
    }, {"internalType": "bool", "name": "borrowerConfirmed", "type": "bool"}, {
        "internalType": "bool",
        "name": "lenderConfirmed",
        "type": "bool"
    }, {"internalType": "enum Simulacrum.Status", "name": "status", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_loanId", "type": "uint256"}],
    "name": "repayLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [],
    "name": "usdtTokenAddress",
    "outputs": [{"internalType": "contract IERC20", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
}];

async function
initContract() {
    if (typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(contractABI, contractAddress);
        return true;
    }
    return false;
}

async function
getLoanDetails(loanId) {
    return await contract.methods.getLoanDetails(loanId).call();
}

function storeCreatedLoan(loanId) {
    const myLoans = JSON.parse(localStorage.getItem('myLoans')) || [];
    if (!myLoans.includes(loanId)
    ) {
        myLoans.push(loanId);
        localStorage.setItem('myLoans', JSON.stringify(myLoans));
    }
}

function storeFundedLoan(loanId) {
    const fundedLoans = JSON.parse(localStorage.getItem('fundedLoans')) || [];
    if (!fundedLoans.includes(loanId)) {
        fundedLoans.push(loanId);
        localStorage.setItem('fundedLoans', JSON.stringify(fundedLoans));
    }
}

async function getActiveLoans() {
    try {
        const loanCount = await contract.methods.loanCounter().call();
        const activeLoans = [];

        for (let i = 1; i <= loanCount; i++) {
            try {
                const loanData = await contract.methods.getLoanDetails(i).call();

                if (loanData.status === "0") { // Status.Awaiting
                    activeLoans.push({
                        id: { 0: i },
                        created_at: new Date().toISOString(),
                        borrower: { 0: loanData.borrower },
                        status: "Awaiting",
                        amount: { 0: loanData.USDC / 1e6 },
                        collateral: { 0: loanData.ETH / 1e18 },
                        rate: { 0: (loanData.Percent / loanData.USDC - 1) * 100 },
                        term: {
                            num_seconds: loanData.TimeDelta,
                            num_days: function() { return Math.round(this.num_seconds / 86400) }
                        }
                    });
                }
            } catch (e) {
                console.warn(`Skipping loan ${i}:`, e);
            }
        }

        return activeLoans;
    } catch (error) {
        console.error('Error fetching loans:', error);
        throw new Error('Не удалось загрузить данные с блокчейна');
    }
}
