// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IERC20.sol";
import "./UserRegistry.sol";

/**
 * @title LendingPlatform
 * @dev Новая версия, где заёмщик инициирует заявку на кредит.
 */
contract LendingPlatform {
    // --- Переменные состояния ---
    UserRegistry public userRegistry;
    address public usdtTokenAddress;
    
    // В реальном проекте здесь будет адрес оракула Chainlink
    uint256 public ethPriceInUsdt = 3000; 

    // Коэффициент избыточного залога (150% -> 150)
    uint256 public collateralRatio = 150; 

    uint256 private _loanCounter;

    // --- Структуры и перечисления ---

    // Новый жизненный цикл заявки
    enum Status {
        Created,      // Заявка создана заёмщиком, залог внесён
        Funded,       // Кредитор внёс средства, ждём подтверждений
        Active,       // Сделка подтверждена, заём активен
        Repaid,       // Заём погашен
        Liquidated,   // Заём ликвидирован
        Cancelled     // Сделка отменена на этапе подтверждения
    }

    struct Loan {
        uint256 id;
        address borrower;
        address lender;
        uint256 principal;          // Сумма, которую хочет получить заёмщик (USDT)
        uint256 repaymentAmount;    // Полная сумма к возврату (USDT)
        uint256 collateral;         // Сумма залога в ETH (wei)
        uint256 durationSeconds;    // Срок займа
        uint256 dueDate;            // Срок погашения (устанавливается при активации)
        bool borrowerConfirmed;
        bool lenderConfirmed;
        Status status;
    }

    mapping(uint256 => Loan) public loans;

    // --- События ---
    event LoanRequestCreated(uint256 indexed id, address indexed borrower, uint256 principal, uint256 repayment, uint256 collateral);
    event RequestFunded(uint256 indexed id, address indexed lender);
    event DealConfirmed(uint256 indexed id, address indexed confirmer);
    event LoanActivated(uint256 indexed id, uint256 dueDate);
    event DealCancelled(uint256 indexed id);
    event LoanRepaid(uint256 indexed id);
    event LoanLiquidated(uint256 indexed id);

    // --- Модификаторы ---
    modifier onlyRegistered() {
        require(userRegistry.isRegistered(msg.sender), "Caller is not registered");
        _;
    }

    // --- Конструктор ---
    constructor(address _registryAddress, address _usdtAddress) {
        userRegistry = UserRegistry(_registryAddress);
        usdtTokenAddress = _usdtAddress;
    }

    // --- Основные функции ---

    /**
     * @dev 1. ЗАЁМЩИК: Создаёт заявку на кредит и вносит залог в ETH.
     */
    function createLoanRequest(uint256 _principal, uint256 _repaymentAmount, uint256 _durationSeconds) external payable onlyRegistered {
        require(_principal > 0, "Principal must be positive");
        require(_repaymentAmount > _principal, "Repayment must be greater than principal");
        require(msg.value > 0, "Collateral must be sent");

        // Проверка достаточности залога
        uint256 requiredCollateralWei = (_principal * collateralRatio * 10**18) / (ethPriceInUsdt * 100);
        require(msg.value >= requiredCollateralWei, "Not enough ETH collateral");
        
        _loanCounter++;
        uint256 loanId = _loanCounter;

        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            lender: address(0),
            principal: _principal,
            repaymentAmount: _repaymentAmount,
            collateral: msg.value,
            durationSeconds: _durationSeconds,
            dueDate: 0,
            borrowerConfirmed: false,
            lenderConfirmed: false,
            status: Status.Created
        });

        emit LoanRequestCreated(loanId, msg.sender, _principal, _repaymentAmount, msg.value);
    }

    /**
     * @dev 2. КРЕДИТОР: Отвечает на заявку и вносит средства (USDT).
     */
    function fundRequest(uint256 _loanId) external onlyRegistered {
        Loan storage loan = loans[_loanId];
        require(loan.status == Status.Created, "Request is not active");
        require(loan.borrower != msg.sender, "Borrower cannot fund their own request");
        
        IERC20 usdt = IERC20(usdtTokenAddress);
        require(usdt.allowance(msg.sender, address(this)) >= loan.principal, "Not enough USDT allowance");

        usdt.transferFrom(msg.sender, address(this), loan.principal);
        
        loan.lender = msg.sender;
        loan.status = Status.Funded;
        
        emit RequestFunded(_loanId, msg.sender);
    }

    /**
     * @dev 3. ОБЕ СТОРОНЫ: Подтверждают сделку.
     */
    function confirmDeal(uint256 _loanId) external {
        Loan storage loan = loans[_loanId];
        require(loan.status == Status.Funded, "Loan is not in funding state");
        
        if (msg.sender == loan.borrower) {
            require(!loan.borrowerConfirmed, "Borrower already confirmed");
            loan.borrowerConfirmed = true;
        } else if (msg.sender == loan.lender) {
            require(!loan.lenderConfirmed, "Lender already confirmed");
            loan.lenderConfirmed = true;
        } else {
            revert("Only borrower or lender can confirm");
        }

        emit DealConfirmed(_loanId, msg.sender);

        // Если оба подтвердили, активируем заём
        if (loan.borrowerConfirmed && loan.lenderConfirmed) {
            loan.status = Status.Active;
            loan.dueDate = block.timestamp + loan.durationSeconds;
            
            // Отправляем USDT заёмщику
            IERC20(usdtTokenAddress).transfer(loan.borrower, loan.principal);
            
            emit LoanActivated(_loanId, loan.dueDate);
        }
    }

    /**
     * @dev 3b. ОБЕ СТОРОНЫ: Отменяют сделку до её активации.
     */
    function cancelDeal(uint256 _loanId) external {
        Loan storage loan = loans[_loanId];
        require(loan.status == Status.Funded, "Can only cancel a funded deal");
        require(msg.sender == loan.borrower || msg.sender == loan.lender, "Only parties can cancel");

        // Возвращаем залог заёмщику
        payable(loan.borrower).transfer(loan.collateral);
        // Возвращаем средства кредитору
        IERC20(usdtTokenAddress).transfer(loan.lender, loan.principal);

        loan.status = Status.Cancelled;
        emit DealCancelled(_loanId);
    }

    /**
     * @dev 4. ЗАЁМЩИК: Погашает долг.
     */
    function repayLoan(uint256 _loanId) external {
        Loan storage loan = loans[_loanId];
        require(loan.status == Status.Active, "Loan is not active");
        require(loan.borrower == msg.sender, "Only borrower can repay");

        IERC20 usdt = IERC20(usdtTokenAddress);
        uint256 amountToRepay = loan.repaymentAmount;
        require(usdt.allowance(msg.sender, address(this)) >= amountToRepay, "Not enough allowance for repayment");

        // Переводим сумму погашения кредитору
        usdt.transferFrom(msg.sender, loan.lender, amountToRepay);
        // Возвращаем залог заёмщику
        payable(loan.borrower).transfer(loan.collateral);

        loan.status = Status.Repaid;
        emit LoanRepaid(_loanId);
    }

    /**
     * @dev 5. КРЕДИТОР: Ликвидирует заём, если он просрочен.
     */
    function liquidateLoan(uint256 _loanId) external {
        Loan storage loan = loans[_loanId];
        require(loan.status == Status.Active, "Loan is not active");
        require(loan.lender == msg.sender, "Only lender can liquidate");
        require(block.timestamp > loan.dueDate, "Loan is not overdue yet");

        // Отправляем залог кредитору
        payable(loan.lender).transfer(loan.collateral);

        loan.status = Status.Liquidated;
        emit LoanLiquidated(_loanId);
    }

    // --- Вспомогательные view-функции ---
    function getLoanDetails(uint256 _loanId) external view returns (Loan memory) {
        return loans[_loanId];
    }
}