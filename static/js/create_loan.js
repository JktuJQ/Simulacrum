const ETH_PRICE = 2400;

const loanAmount = document.getElementById('loanAmount');
const loanToken = document.getElementById('loanToken');
const loanDuration = document.getElementById('loanDuration');
const interestRate = document.getElementById('interestRate');
const collateralAmount = document.getElementById('collateralAmount');
const collateralToken = document.getElementById('collateralToken');
const liquidationPrice = document.getElementById('liquidationPrice');
const submitButton = document.getElementById('submitButton');

const calcLoanAmount = document.getElementById('calcLoanAmount');
const calcInterestRate = document.getElementById('calcInterestRate');
const calcDuration = document.getElementById('calcDuration');
const calcCollateral = document.getElementById('calcCollateral');
const calcRepayment = document.getElementById('calcRepayment');
const calcLTV = document.getElementById('calcLTV');
const calcLTVStatus = document.getElementById('calcLTVStatus');
const calcLTVBar = document.getElementById('calcLTVBar');

function updateCalculations() {
    const loanAmountValue = parseFloat(loanAmount.value) || 0;
    const loanTokenValue = loanToken.value;
    const loanDurationValue = parseInt(loanDuration.value) || 0;
    const interestRateValue = parseFloat(interestRate.value) || 0;
    const collateralAmountValue = parseFloat(collateralAmount.value) || 0;
    const collateralTokenValue = collateralToken.value;

    calcLoanAmount.textContent = `$${loanAmountValue.toLocaleString()} ${loanTokenValue}`;
    calcInterestRate.textContent = `${interestRateValue}% годовых`;
    calcDuration.textContent = `${loanDurationValue} дней`;
    calcCollateral.textContent = `${collateralAmountValue} ${collateralTokenValue}`;

    const dailyRate = interestRateValue / 365 / 100;
    const totalInterest = loanAmountValue * dailyRate * loanDurationValue;
    const repaymentAmount = loanAmountValue + totalInterest;
    calcRepayment.textContent = `$${repaymentAmount.toFixed(2)} ${loanTokenValue}`;

    const collateralValue = collateralAmountValue * ETH_PRICE;
    const ltv = collateralValue > 0 ? (loanAmountValue / collateralValue * 100) : 0;

    calcLTV.textContent = `${ltv.toFixed(0)}%`;
    calcLTVBar.style.width = `${Math.min(ltv, 100)}%`;

    if (ltv <= 50) {
        calcLTVStatus.innerHTML = '<i class="bi bi-shield-check"></i> Безопасно';
        calcLTVStatus.className = 'ltv-status ltv-safe';
        calcLTVBar.className = 'ltv-progress-bar ltv-progress-safe';
    } else if (ltv <= 70) {
        calcLTVStatus.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Умеренно';
        calcLTVStatus.className = 'ltv-status ltv-warning';
        calcLTVBar.className = 'ltv-progress-bar ltv-progress-warning';
    } else {
        calcLTVStatus.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Рискованно';
        calcLTVStatus.className = 'ltv-status ltv-danger';
        calcLTVBar.className = 'ltv-progress-bar ltv-progress-danger';
    }

    const liquidationPriceValue = collateralAmountValue > 0 ? (loanAmountValue * 1.2) / collateralAmountValue : 0;
    liquidationPrice.value = liquidationPriceValue.toFixed(0);

    const liquidationWarning = document.getElementById('liquidationWarning');
    if (liquidationPriceValue > ETH_PRICE * 0.8) {
        liquidationWarning.style.display = 'block';
    } else {
        liquidationWarning.style.display = 'none';
    }

    validateForm();
}

function validateForm() {
    let isValid = true;

    const loanAmountValue = parseFloat(loanAmount.value) || 0;
    const loanAmountError = document.getElementById('loanAmountError');
    if (loanAmountValue < 100 || loanAmountValue > 100000) {
        loanAmountError.style.display = 'block';
        isValid = false;
    } else {
        loanAmountError.style.display = 'none';
    }

    const interestRateValue = parseFloat(interestRate.value) || 0;
    const interestRateError = document.getElementById('interestRateError');
    if (interestRateValue < 5 || interestRateValue > 30) {
        interestRateError.style.display = 'block';
        isValid = false;
    } else {
        interestRateError.style.display = 'none';
    }

    const collateralAmountValue = parseFloat(collateralAmount.value) || 0;
    const collateralAmountError = document.getElementById('collateralAmountError');
    if (collateralAmountValue < 0.01) {
        collateralAmountError.style.display = 'block';
        isValid = false;
    } else {
        collateralAmountError.style.display = 'none';
    }

    const collateralValue = collateralAmountValue * ETH_PRICE;
    const ltv = collateralValue > 0 ? (loanAmountValue / collateralValue * 100) : 0;
    if (ltv > 80) {
        collateralAmountError.textContent = 'LTV слишком высокий (>80%). Увеличьте залог.';
        collateralAmountError.style.display = 'block';
        isValid = false;
    } else {
        collateralAmountError.textContent = 'Недостаточный размер залога';
    }

    submitButton.disabled = !isValid;
}

function submitLoan() {
    const loanAmountValue = parseFloat(loanAmount.value);
    const loanTokenValue = loanToken.value;
    const loanDurationValue = parseInt(loanDuration.value);
    const interestRateValue = parseFloat(interestRate.value);
    const collateralAmountValue = parseFloat(collateralAmount.value);
    const collateralTokenValue = collateralToken.value;

    document.getElementById('modalLoanAmount').textContent = `$${loanAmountValue.toLocaleString()} ${loanTokenValue}`;
    document.getElementById('modalRate').textContent = `${interestRateValue}% годовых`;
    document.getElementById('modalDuration').textContent = `${loanDurationValue} дней`;
    document.getElementById('modalCollateral').textContent = `${collateralAmountValue} ${collateralTokenValue}`;

    console.log('Creating loan with parameters:', {
        amount: loanAmountValue,
        token: loanTokenValue,
        duration: loanDurationValue,
        rate: interestRateValue,
        collateral: collateralAmountValue,
        collateralToken: collateralTokenValue
    });

    openModal('successModal');

    document.querySelectorAll('.step').forEach((step, index) => {
        if (index < 2) {
            step.classList.add('active');
        }
    });
}

[loanAmount, loanToken, loanDuration, interestRate, collateralAmount, collateralToken].forEach(element => {
    element.addEventListener('input', updateCalculations);
    element.addEventListener('change', updateCalculations);
});

submitButton.addEventListener('click', submitLoan);

updateCalculations();

// create_loan.js (add to existing file)
async function submitLoan() {
    const loanAmountValue = parseFloat(loanAmount.value);
    const interestRateValue = parseFloat(interestRate.value);
    const loanDurationValue = parseInt(loanDuration.value);
    const collateralAmountValue = parseFloat(collateralAmount.value);

    // Convert to contract units
    const usdcInSmallestUnit = loanAmountValue * 10**6;
    const repaymentAmount = loanAmountValue * (1 + interestRateValue/100 * (loanDurationValue/365));
    const repaymentInSmallestUnit = repaymentAmount * 10**6;
    const collateralInWei = Web3.utils.toWei(collateralAmountValue.toString(), 'ether');
    const durationInSeconds = loanDurationValue * 24 * 60 * 60;

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];

        await contract.methods.createLoanRequest(
            usdcInSmallestUnit,
            repaymentInSmallestUnit,
            durationInSeconds
        ).send({
            from: account,
            value: collateralInWei
        })
            .on('transactionHash', (hash) => {
                console.log('Transaction hash:', hash);
            })
            .on('receipt', (receipt) => {
                const loanId = receipt.events.LoanRequestAwaiting.returnValues.id;
                storeCreatedLoan(loanId);
                sendToBackend('loanCreated', {
                    id: loanId,
                    amount: loanAmountValue,
                    rate: interestRateValue,
                    duration: loanDurationValue,
                    collateral: collateralAmountValue
                });
                openModal('successModal');
            })
            .on('error', (error) => {
                console.error('Error:', error);
                alert('Error creating loan: ' + error.message);
            });
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}
