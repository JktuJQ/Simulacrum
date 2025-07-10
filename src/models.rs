//! `models` module provides models that represent data that backend operates with.
//!

use crate::blockchain::{WalletAddress, ETH, USDC};
use chrono::{DateTime, TimeDelta, Utc};
use std::fmt;

/// [`Percent`] newtype wrapper represents percents of anything.
///
#[derive(Copy, Clone, Debug, PartialEq, PartialOrd)]
pub struct Percent(pub f32);
impl fmt::Display for Percent {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}%", self.0)
    }
}

/// [`LoanId`] newtype wrapper represents id of the loan.
///
#[derive(Copy, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct LoanId(pub u64);
impl fmt::Display for LoanId {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// [`LoanOutcome`] enum lists all possible outcomes of a loan.
///
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum LoanOutcome {
    /// Loan was returned by the borrower.
    ///
    Returned {
        /// Time of return.
        ///
        at: DateTime<Utc>,
    },
    /// Collateral of loan was liquidated due to value depreciation.
    ///
    Liquidated {
        /// Time of liquidation.
        ///
        at: DateTime<Utc>,
    },
    /// Loan was not returned.
    ///
    Overdue,
}
/// [`LoanOutcomeResult`] struct represents the result of a loan that was confirmed by the borrower.
///
pub struct LoanOutcomeResult {
    /// Lender id.
    ///
    pub lender: WalletAddress,
    /// Outcome of the loan.
    ///
    pub outcome: LoanOutcome,
}
/// [`LoanStatus`] enum lists all possible states of a loan.
///
pub enum LoanStatus {
    /// Awaiting the borrower.
    ///
    Awaiting,
    /// Loan awaits confirmation from lender.
    ///
    Pending {
        /// Potential lender.
        ///
        potential_lender: WalletAddress,
    },
    /// Loan is active (in progress).
    ///
    Active {
        /// Lender address.
        ///
        lender: WalletAddress,
        /// Loan is active since this time.
        ///
        started_at: DateTime<Utc>,
        /// Loan-to-value coefficient.
        ///
        ltv: Percent,
    },
    /// The result of the loan (possibly canceled).
    ///
    Completed(Option<LoanOutcomeResult>),
}
impl fmt::Display for LoanStatus {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "{}",
            match self {
                LoanStatus::Awaiting => "Ищем кредитора",
                LoanStatus::Pending { .. } => "Ждем подтверждения",
                LoanStatus::Active { .. } => "В процессе",
                LoanStatus::Completed(_) => "Завершено",
            }
        )
    }
}
/// [`Loan`] struct represents loan request that was created by the borrower.
///
pub struct Loan {
    /// Loan id.
    ///
    pub id: LoanId,
    /// Datetime at which loan was created.
    ///
    pub created_at: DateTime<Utc>,
    /// Borrower address.
    ///
    pub borrower: WalletAddress,
    /// Status of the loan.
    ///
    pub status: LoanStatus,
    /// Loan amount.
    ///
    pub amount: USDC,
    /// Loan collateral.
    ///
    pub collateral: ETH,
    /// Rate of interest for whole term of loan.
    ///
    pub rate: Percent,
    /// Term of loan.
    ///
    pub term: TimeDelta,
}
