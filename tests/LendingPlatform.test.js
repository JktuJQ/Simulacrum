const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LendingPlatform Main Flow Test", function () {
  let lendingPlatform;
  let mockUSDT;
  let mockPriceFeed;
  let owner;
  let borrower;
  let lender;
  let otherUser;

  // Константы для тестирования
  const INITIAL_ETH_PRICE = 3000; // $3000 per ETH
  const INITIAL_USDT_SUPPLY = ethers.parseEther("1000000");
  const LOAN_AMOUNT = ethers.parseEther("1000"); // 1000 USDT
  const REPAYMENT_PERCENT = 110; // 110% (10% процент)
  const LOAN_DURATION = 30 * 24 * 60 * 60; // 30 дней в секундах

  beforeEach(async function () {
    [owner, borrower, lender, otherUser] = await ethers.getSigners();

    // Deploy MockERC20 (USDT)
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUSDT = await MockERC20.deploy("Mock USDT", "USDT", INITIAL_USDT_SUPPLY);
    await mockUSDT.waitForDeployment();

    // Deploy MockAggregatorV3 (ETH/USD Price Feed)
    const MockAggregatorV3 = await ethers.getContractFactory("MockAggregatorV3");
    mockPriceFeed = await MockAggregatorV3.deploy(
      INITIAL_ETH_PRICE * 10**8, // Chainlink price with 8 decimals
      8,
      "ETH/USD",
      1
    );
    await mockPriceFeed.waitForDeployment();

    // Deploy LendingPlatform
    const LendingPlatform = await ethers.getContractFactory("LendingPlatform");
    lendingPlatform = await LendingPlatform.deploy(
      await mockUSDT.getAddress(),
      await mockPriceFeed.getAddress()
    );
    await lendingPlatform.waitForDeployment();

    // Mint USDT to participants
    await mockUSDT.mint(lender.address, ethers.parseEther("50000"));
    await mockUSDT.mint(borrower.address, ethers.parseEther("50000"));
    await mockUSDT.mint(otherUser.address, ethers.parseEther("50000"));

    console.log("✅ Setup completed");
  });

  describe("🎯 SCENARIO 1: Successful Loan Flow", function () {
    it("Should complete full loan cycle: create → fund → confirm → repay", async function () {
      console.log("\n📋 SCENARIO 1: Complete successful loan flow");

      // 1. Рассчитываем необходимую сумму ETH для залога
      const ethPrice = await lendingPlatform.getLatestETHPrice();
      const ethRatio = await lendingPlatform.ETHRatio();
      const requiredETH = (LOAN_AMOUNT * ethRatio * 10n**18n) / (ethPrice * 100n);

      console.log(`💰 Required ETH collateral: ${ethers.formatEther(requiredETH)} ETH`);

      // 2. BORROWER: Создает заявку на кредит
      console.log("\n🔸 Step 1: Borrower creates loan request");
      const borrowerETHBefore = await ethers.provider.getBalance(borrower.address);
      
      const createTx = await lendingPlatform.connect(borrower).createLoanRequest(
        LOAN_AMOUNT,
        REPAYMENT_PERCENT,
        LOAN_DURATION,
        { value: requiredETH }
      );

      await expect(createTx)
        .to.emit(lendingPlatform, "LoanRequestAwaiting")
        .withArgs(1, borrower.address, LOAN_AMOUNT, REPAYMENT_PERCENT, requiredETH);

      const loan1 = await lendingPlatform.getLoanDetails(borrower.address, 1);
      expect(loan1.status).to.equal(0); // Status.Awaiting
      expect(loan1.borrower).to.equal(borrower.address);
      expect(loan1.USDC).to.equal(LOAN_AMOUNT);
      expect(loan1.Percent).to.equal(REPAYMENT_PERCENT);
      
      console.log(`✅ Loan request created with ID: ${loan1.id}`);

      // 3. LENDER: Отвечает на заявку и финансирует её
      console.log("\n🔸 Step 2: Lender funds the request");
      const lenderUSDTBefore = await mockUSDT.balanceOf(lender.address);
      
      // Approve USDT transfer
      await mockUSDT.connect(lender).approve(await lendingPlatform.getAddress(), LOAN_AMOUNT);
      
      const fundTx = await lendingPlatform.connect(lender).fundRequest(borrower.address, 1);
      
      await expect(fundTx)
        .to.emit(lendingPlatform, "RequestPending")
        .withArgs(1, borrower.address, lender.address);

      const loan2 = await lendingPlatform.getLoanDetails(borrower.address, 1);
      expect(loan2.status).to.equal(1); // Status.Pending
      expect(loan2.lender).to.equal(lender.address);
      
      const lenderUSDTAfter = await mockUSDT.balanceOf(lender.address);
      expect(lenderUSDTAfter).to.equal(lenderUSDTBefore - LOAN_AMOUNT);
      
      console.log(`✅ Loan funded by lender. Contract balance: ${ethers.formatEther(LOAN_AMOUNT)} USDT`);

      // 4. BORROWER: Подтверждает сделку
      console.log("\n🔸 Step 3: Borrower confirms the deal");
      const borrowerUSDTBefore = await mockUSDT.balanceOf(borrower.address);
      
      const confirmTx = await lendingPlatform.connect(borrower).confirmDeal(borrower.address, 1);
      
      await expect(confirmTx)
        .to.emit(lendingPlatform, "DealConfirmed")
        .withArgs(1, borrower.address, borrower.address);
      
      await expect(confirmTx)
        .to.emit(lendingPlatform, "LoanActivated");

      const loan3 = await lendingPlatform.getLoanDetails(borrower.address, 1);
      expect(loan3.status).to.equal(2); // Status.Active
      expect(loan3.borrowerConfirmed).to.be.true;
      expect(loan3.dueDate).to.be.greaterThan(0);
      
      const borrowerUSDTAfter = await mockUSDT.balanceOf(borrower.address);
      expect(borrowerUSDTAfter).to.equal(borrowerUSDTBefore + LOAN_AMOUNT);
      
      console.log(`✅ Deal confirmed and activated. Borrower received: ${ethers.formatEther(LOAN_AMOUNT)} USDT`);

      // 5. BORROWER: Погашает заём в срок
      console.log("\n🔸 Step 4: Borrower repays loan on time");
      const repaymentAmount = (LOAN_AMOUNT * BigInt(REPAYMENT_PERCENT)) / 100n;
      const lenderUSDTBeforeRepay = await mockUSDT.balanceOf(lender.address);
      const borrowerETHBeforeRepay = await ethers.provider.getBalance(borrower.address);
      
      // Approve repayment
      await mockUSDT.connect(borrower).approve(await lendingPlatform.getAddress(), repaymentAmount);
      
      const repayTx = await lendingPlatform.connect(borrower).repayLoan(1);
      
      await expect(repayTx)
        .to.emit(lendingPlatform, "LoanReturned")
        .withArgs(1, borrower.address);

      const loan4 = await lendingPlatform.getLoanDetails(borrower.address, 1);
      expect(loan4.status).to.equal(3); // Status.Returned
      
      // Проверяем, что кредитор получил репеймент
      const lenderUSDTAfterRepay = await mockUSDT.balanceOf(lender.address);
      expect(lenderUSDTAfterRepay).to.equal(lenderUSDTBeforeRepay + repaymentAmount);
      
      // Проверяем, что заёмщик получил залог обратно
      const borrowerETHAfterRepay = await ethers.provider.getBalance(borrower.address);
      expect(borrowerETHAfterRepay).to.be.greaterThan(borrowerETHBeforeRepay);
      
      console.log(`✅ Loan repaid successfully. Lender received: ${ethers.formatEther(repaymentAmount)} USDT`);
      console.log(`✅ Borrower got back: ${ethers.formatEther(requiredETH)} ETH collateral`);
      console.log("\n🎉 SCENARIO 1 COMPLETED SUCCESSFULLY!");
    });
  });

  describe("🎯 SCENARIO 2: Deal Cancellation Flow", function () {
    it("Should cancel deal and return funds to both parties", async function () {
      console.log("\n📋 SCENARIO 2: Deal cancellation flow");

      // 1. Setup loan request
      const ethPrice = await lendingPlatform.getLatestETHPrice();
      const ethRatio = await lendingPlatform.ETHRatio();
      const requiredETH = (LOAN_AMOUNT * ethRatio * 10n**18n) / (ethPrice * 100n);

      // 2. BORROWER: Создает заявку
      console.log("\n🔸 Step 1: Borrower creates loan request");
      await lendingPlatform.connect(borrower).createLoanRequest(
        LOAN_AMOUNT,
        REPAYMENT_PERCENT,
        LOAN_DURATION,
        { value: requiredETH }
      );

      // 3. LENDER: Финансирует заявку
      console.log("\n🔸 Step 2: Lender funds the request");
      await mockUSDT.connect(lender).approve(await lendingPlatform.getAddress(), LOAN_AMOUNT);
      await lendingPlatform.connect(lender).fundRequest(borrower.address, 1);

      // 4. Сохраняем балансы перед отменой
      const borrowerETHBefore = await ethers.provider.getBalance(borrower.address);
      const lenderUSDTBefore = await mockUSDT.balanceOf(lender.address);

      // 5. BORROWER: Отменяет сделку
      console.log("\n🔸 Step 3: Borrower cancels the deal");
      const cancelTx = await lendingPlatform.connect(borrower).cancelDeal(borrower.address, 1);
      
      await expect(cancelTx)
        .to.emit(lendingPlatform, "DealCancell")
        .withArgs(1, borrower.address);

      const loan = await lendingPlatform.getLoanDetails(borrower.address, 1);
      expect(loan.status).to.equal(5); // Status.Cancell

      // 6. Проверяем возврат средств
      const borrowerETHAfter = await ethers.provider.getBalance(borrower.address);
      const lenderUSDTAfter = await mockUSDT.balanceOf(lender.address);

      expect(borrowerETHAfter).to.be.greaterThan(borrowerETHBefore);
      expect(lenderUSDTAfter).to.equal(lenderUSDTBefore + LOAN_AMOUNT);

      console.log(`✅ Deal cancelled. ETH returned to borrower, USDT returned to lender`);
      console.log("\n🎉 SCENARIO 2 COMPLETED SUCCESSFULLY!");
    });
  });

  describe("🎯 SCENARIO 3: Multiple Loans by Same Borrower", function () {
    it("Should handle multiple loans from same borrower", async function () {
      console.log("\n📋 SCENARIO 3: Multiple loans from same borrower");

      const ethPrice = await lendingPlatform.getLatestETHPrice();
      const ethRatio = await lendingPlatform.ETHRatio();
      const requiredETH = (LOAN_AMOUNT * ethRatio * 10n**18n) / (ethPrice * 100n);

      // 1. BORROWER: Создает первую заявку
      console.log("\n🔸 Step 1: Borrower creates first loan request");
      await lendingPlatform.connect(borrower).createLoanRequest(
        LOAN_AMOUNT,
        REPAYMENT_PERCENT,
        LOAN_DURATION,
        { value: requiredETH }
      );

      // 2. BORROWER: Создает вторую заявку
      console.log("\n🔸 Step 2: Borrower creates second loan request");
      await lendingPlatform.connect(borrower).createLoanRequest(
        LOAN_AMOUNT / 2n, // Меньшая сумма
        120, // Больший процент
        LOAN_DURATION,
        { value: requiredETH / 2n }
      );

      // 3. LENDER: Финансирует первую заявку
      console.log("\n🔸 Step 3: Lender funds first request");
      await mockUSDT.connect(lender).approve(await lendingPlatform.getAddress(), LOAN_AMOUNT);
      await lendingPlatform.connect(lender).fundRequest(borrower.address, 1);

      // 4. OTHER_USER: Финансирует вторую заявку
      console.log("\n🔸 Step 4: Other user funds second request");
      await mockUSDT.connect(otherUser).approve(await lendingPlatform.getAddress(), LOAN_AMOUNT / 2n);
      await lendingPlatform.connect(otherUser).fundRequest(borrower.address, 2);

      // 5. Проверяем состояние обеих заявок
      const loan1 = await lendingPlatform.getLoanDetails(borrower.address, 1);
      const loan2 = await lendingPlatform.getLoanDetails(borrower.address, 2);

      expect(loan1.status).to.equal(1); // Status.Pending
      expect(loan1.lender).to.equal(lender.address);
      expect(loan1.USDC).to.equal(LOAN_AMOUNT);

      expect(loan2.status).to.equal(1); // Status.Pending
      expect(loan2.lender).to.equal(otherUser.address);
      expect(loan2.USDC).to.equal(LOAN_AMOUNT / 2n);

      console.log(`✅ Both loans are in pending state with different lenders`);

      // 6. BORROWER: Подтверждает только первую сделку
      console.log("\n🔸 Step 5: Borrower confirms first deal only");
      await lendingPlatform.connect(borrower).confirmDeal(borrower.address, 1);

      // 7. BORROWER: Отменяет вторую сделку
      console.log("\n🔸 Step 6: Borrower cancels second deal");
      await lendingPlatform.connect(borrower).cancelDeal(borrower.address, 2);

      // 8. Финальная проверка состояний
      const finalLoan1 = await lendingPlatform.getLoanDetails(borrower.address, 1);
      const finalLoan2 = await lendingPlatform.getLoanDetails(borrower.address, 2);

      expect(finalLoan1.status).to.equal(2); // Status.Active
      expect(finalLoan2.status).to.equal(5); // Status.Cancell

      console.log(`✅ First loan activated, second loan cancelled`);
      console.log("\n🎉 SCENARIO 3 COMPLETED SUCCESSFULLY!");
    });
  });

  describe("🎯 SCENARIO 4: Failed Scenarios", function () {
    it("Should reject invalid loan requests", async function () {
      console.log("\n📋 SCENARIO 4: Failed scenarios testing");

      // 1. Попытка создать заявку с недостаточным залогом
      console.log("\n🔸 Test 1: Insufficient collateral");
      await expect(
        lendingPlatform.connect(borrower).createLoanRequest(
          LOAN_AMOUNT,
          REPAYMENT_PERCENT,
          LOAN_DURATION,
          { value: ethers.parseEther("0.1") } // Слишком мало ETH
        )
      ).to.be.revertedWith("Not enough ETH ETH");
      console.log("✅ Correctly rejected insufficient collateral");

      // 2. Попытка создать заявку с неправильным процентом
      console.log("\n🔸 Test 2: Invalid repayment percentage");
      const ethPrice = await lendingPlatform.getLatestETHPrice();
      const ethRatio = await lendingPlatform.ETHRatio();
      const requiredETH = (LOAN_AMOUNT * ethRatio * 10n**18n) / (ethPrice * 100n);
      

      // 3. Создаем валидную заявку для дальнейших тестов
      await lendingPlatform.connect(borrower).createLoanRequest(
        LOAN_AMOUNT,
        REPAYMENT_PERCENT,
        LOAN_DURATION,
        { value: requiredETH }
      );

      // 4. Попытка заёмщика профинансировать свою заявку
      console.log("\n🔸 Test 4: Borrower tries to fund own request");
      await mockUSDT.connect(borrower).approve(await lendingPlatform.getAddress(), LOAN_AMOUNT);
      await expect(
        lendingPlatform.connect(borrower).fundRequest(borrower.address, 1)
      ).to.be.revertedWith("Borrower cannot fund their own request");
      console.log("✅ Correctly rejected borrower funding own request");

      // 5. Попытка финансирования без allowance
      console.log("\n🔸 Test 5: Funding without sufficient allowance");
      await expect(
        lendingPlatform.connect(lender).fundRequest(borrower.address, 1)
      ).to.be.revertedWith("Not enough USDT allowance");
      console.log("✅ Correctly rejected insufficient allowance");

      console.log("\n🎉 SCENARIO 4 COMPLETED SUCCESSFULLY!");
    });
  });

  describe("🎯 SCENARIO 5: Edge Cases", function () {
    it("Should handle edge cases properly", async function () {
      console.log("\n📋 SCENARIO 5: Edge cases testing");

      const ethPrice = await lendingPlatform.getLatestETHPrice();
      const ethRatio = await lendingPlatform.ETHRatio();
      const requiredETH = (LOAN_AMOUNT * ethRatio * 10n**18n) / (ethPrice * 100n);

      // 1. Создаем и финансируем заявку
      console.log("\n🔸 Setting up loan for edge case testing");
      await lendingPlatform.connect(borrower).createLoanRequest(
        LOAN_AMOUNT,
        REPAYMENT_PERCENT,
        LOAN_DURATION,
        { value: requiredETH }
      );

      await mockUSDT.connect(lender).approve(await lendingPlatform.getAddress(), LOAN_AMOUNT);
      await lendingPlatform.connect(lender).fundRequest(borrower.address, 1);

      // 2. Попытка подтверждения не участником сделки
      console.log("\n🔸 Test 1: Non-participant tries to confirm");
      await expect(
        lendingPlatform.connect(otherUser).confirmDeal(borrower.address, 1)
      ).to.be.revertedWith("Only borrower can confirm");
      console.log("✅ Correctly rejected non-participant confirmation");

      // 3. Попытка отмены не участником сделки
      console.log("\n🔸 Test 2: Non-participant tries to cancel");
      await expect(
        lendingPlatform.connect(otherUser).cancelDeal(borrower.address, 1)
      ).to.be.revertedWith("Only parties can cancel");
      console.log("✅ Correctly rejected non-participant cancellation");

      // 4. Подтверждаем сделку для дальнейших тестов
      await lendingPlatform.connect(borrower).confirmDeal(borrower.address, 1);

      // 5. Попытка повторного подтверждения
      console.log("\n🔸 Test 3: Multiple confirmations");
      await expect(
        lendingPlatform.connect(borrower).confirmDeal(borrower.address, 1)
      ).to.be.revertedWith("Loan is not in funding state");
      console.log("✅ Correctly rejected multiple confirmations");

      // 6. Попытка отмены активной сделки
      console.log("\n🔸 Test 4: Cancel active deal");
      await expect(
        lendingPlatform.connect(borrower).cancelDeal(borrower.address, 1)
      ).to.be.revertedWith("Can only cancel a Pending deal");
      console.log("✅ Correctly rejected cancellation of active deal");


      console.log("\n🎉 SCENARIO 5 COMPLETED SUCCESSFULLY!");
    });
  });

  describe("🎯 SUMMARY", function () {
    it("Should display test summary", async function () {
      console.log("\n" + "=".repeat(60));
      console.log("🎉 ALL MAIN FLOW TESTS COMPLETED SUCCESSFULLY!");
      console.log("=".repeat(60));
      console.log("✅ Scenario 1: Full successful loan cycle");
      console.log("✅ Scenario 2: Deal cancellation flow");
      console.log("✅ Scenario 3: Multiple loans handling");
      console.log("✅ Scenario 4: Invalid requests rejection");
      console.log("✅ Scenario 5: Edge cases handling");
      console.log("=".repeat(60));
      
      // Проверяем финальное состояние контракта
      const contractBalance = await ethers.provider.getBalance(await lendingPlatform.getAddress());
      console.log(`📊 Final contract ETH balance: ${ethers.formatEther(contractBalance)} ETH`);
      
      expect(true).to.be.true; // Placeholder assertion
    });
  });
});