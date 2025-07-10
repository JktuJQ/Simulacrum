// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title LendingPlatform
 * @dev Новая версия, где заёмщик инициирует заявку на кредит.
 */
contract LendingPlatform {
    // --- Переменные состояния ---
    IERC20 public usdtTokenAddress;
    address private _owner;

    // В реальном проекте здесь будет адрес оракула Chainlink
    uint256 public ethPriceInUsdt = 3000;

    // Коэффициент избыточного залога (150% -> 150)
    uint256 public ETHRatio = 150;

    // Счетчик займов для каждого заёмщика
    mapping(address => uint256) private _loanCounter;

    // --- Структуры и перечисления ---

    // Новый жизненный цикл заявки
    enum Status {
        Awaiting, // Заявка создана заёмщиком, залог внесён
        Pending, // Кредитор внёс средства, ждём подтверждений
        Active, // Сделка подтверждена, заём активен
        Returned, // Заём погашен
        Overdue, // Срок сделки вышел
        Cancell, // Сделка отменена на этапе подтверждения
        Liquidated // Заём ликвидирован
    }

    struct Loan {
        uint256 id;
        address borrower;
        address lender;
        uint256 USDC; // Сумма, которую хочет получить заёмщик (USDC)
        uint256 Percent; // Процент, который мы готовы вернуть (USDT)
        uint256 ETH; // Сумма залога в ETH (wei)
        uint256 TimeDelta; // Срок займа
        uint256 dueDate; // Срок погашения (устанавливается при активации)
        bool borrowerConfirmed;
        Status status;
    }

    mapping(address => mapping(uint256 => Loan)) public loans;
    // --- События ---
    event LoanRequestAwaiting(uint256 indexed id, address indexed borrower, uint256 USDC, uint256 repayment, uint256 ETH);
    event RequestPending(uint256 indexed id, address indexed borrower, address indexed lender); 
    event DealConfirmed(uint256 indexed id, address indexed borrower, address indexed confirmer); 
    event LoanActivated(uint256 indexed id, address indexed borrower, uint256 dueDate); 
    event DealCancell(uint256 indexed id, address indexed borrower); 
    event LoanReturned(uint256 indexed id, address indexed borrower); 
    event LoanOverdue(uint256 indexed id, address indexed borrower); 

    // --- Конструктор ---
    constructor(address _usdcTokenAddress) {
        require(_usdcTokenAddress != address(0), "Invalid USDC token address");
        usdtTokenAddress = IERC20(_usdcTokenAddress);
        _owner = msg.sender;
    }

    // --- Основные функции ---
    /**
     * @dev 1. ЗАЁМЩИК: Создаёт заявку на кредит и вносит залог в ETH.
     */
    function createLoanRequest(uint256 _USDC,uint256 _percent,uint256 _TimeDelta) external payable {
        require(_USDC > 0, "USDC must be positive");
        require(_percent * _USDC > _USDC,"Repayment must be greater than USDC");
        require(msg.value > 0, "ETH must be sent");

        // Проверка достаточности залога
        uint256 requiredETHWei = (_USDC * ETHRatio * 10**18) /
            (ethPriceInUsdt * 100);
        require(msg.value >= requiredETHWei, "Not enough ETH ETH");


        _loanCounter[msg.sender]++;
        uint256 loanId = _loanCounter[msg.sender];

        loans[msg.sender][loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            lender: address(0),
            USDC: _USDC,
            Percent: _percent,
            ETH: msg.value,
            TimeDelta: _TimeDelta,
            dueDate: 0,
            borrowerConfirmed: false,
            status: Status.Awaiting
        });

        emit LoanRequestAwaiting(loanId,msg.sender, _USDC,_percent, msg.value);
    }

    /**
     * @dev 2. КРЕДИТОР: Отвечает на заявку и вносит средства (USDT).
     */
    function fundRequest(address _borrowerAddress, uint256 _loanId) external {
        Loan storage loan = loans[_borrowerAddress][_loanId];
        require(loan.status == Status.Awaiting, "Request is not active");
        require(
            loan.borrower != msg.sender,
            "Borrower cannot fund their own request"
        );

        IERC20 usdt = usdtTokenAddress;
        require( usdt.allowance(msg.sender, address(this)) >= loan.USDC, "Not enough USDT allowance");

        usdt.transferFrom(msg.sender, address(this), loan.USDC);

        loan.lender = msg.sender;
        loan.status = Status.Pending;

        emit RequestPending(_loanId, _borrowerAddress, msg.sender);
    }

    /**
     * @dev 3. ОБЕ СТОРОНЫ: Подтверждают сделку.
     */
    function confirmDeal(address _borrowerAddress, uint256 _loanId) external {
        Loan storage loan = loans[_borrowerAddress][_loanId];
        require(loan.status == Status.Pending, "Loan is not in funding state");

        if (msg.sender == loan.borrower) {
            require(!loan.borrowerConfirmed, "Borrower already confirmed");
            loan.borrowerConfirmed = true;
        } else {
            revert("Only borrower can confirm");
        }

        emit DealConfirmed(_loanId, _borrowerAddress, msg.sender);

        // Если оба подтвердили, активируем заём
        if (loan.borrowerConfirmed) {
            loan.status = Status.Active;
            loan.dueDate = block.timestamp + loan.TimeDelta;

            // Отправляем USDT заёмщику
            IERC20(usdtTokenAddress).transfer(loan.borrower, loan.USDC);

            emit LoanActivated(_loanId, _borrowerAddress, loan.dueDate);
        }
    }

    /**
     * @dev 3b. ОБЕ СТОРОНЫ: Отменяют сделку до её активации.
     */
    function cancelDeal(address _borrowerAddress, uint256 _loanId) external {
        Loan storage loan = loans[_borrowerAddress][_loanId];
        require(
            loan.status == Status.Pending,
            "Can only cancel a Pending deal"
        );
        require(msg.sender == loan.borrower, "Only parties can cancel");

        if (msg.sender == loan.borrower) {
             payable(loan.borrower).transfer(loan.ETH);
             // Возвращаем средства кредитору, если он внёс их
             if (loan.lender != address(0)) {
                 IERC20(usdtTokenAddress).transfer(loan.lender, loan.USDC);
             }
        } else {
            revert("Only borrower can cancel"); // Добавим проверку на то, кто вызывает функцию
        }
        loan.status = Status.Cancell;
        emit DealCancell(_loanId, _borrowerAddress);
    }

    /**
     * @dev 4. ЗАЁМЩИК: Погашает долг.
     */
    function repayLoan(uint256 _loanId) external {
        Loan storage loan = loans[msg.sender][_loanId];
        require(loan.status == Status.Active, "Loan is not active");
        require(loan.borrower == msg.sender, "Only borrower can repay");

        IERC20 usdt = IERC20(usdtTokenAddress);
        uint256 amountToRepay = (loan.USDC * loan.Percent) / 100; 
        require(usdt.allowance(msg.sender, address(this)) >= amountToRepay,"Not enough allowance for repayment");

        // Переводим сумму погашения кредитору
        usdt.transferFrom(msg.sender, loan.lender, amountToRepay);
        // Возвращаем залог заёмщику
        payable(loan.borrower).transfer(loan.ETH);

        loan.status = Status.Returned;
        emit LoanReturned(_loanId, msg.sender);
    }

    /**
     * @dev 5. КРЕДИТОР: Ликвидирует заём, если он просрочен.
     */
    function liquidateLoan(address _borrowerAddress, uint256 _loanId) external{
        Loan storage loan = loans[_borrowerAddress][_loanId];
        require(loan.status == Status.Active, "Loan is not active");
        require(loan.lender == msg.sender, "Only lender can liquidate");
        require(block.timestamp > loan.dueDate, "Loan is not overdue yet");

        // Отправляем залог кредитору
        payable(loan.lender).transfer(loan.ETH);

        loan.status = Status.Overdue;
        emit LoanOverdue(_loanId, _borrowerAddress);
    }

    // --- Вспомогательные view-функции ---
    function getLoanDetails(address _borrowerAddress, uint256 _loanId) external view returns (Loan memory) {
        return loans[_borrowerAddress][_loanId];
    }
}
