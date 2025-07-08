//! Models that represent market objects.
//!

use crate::db_models::UserId;
use std::fmt;
use chrono::{TimeDelta, DateTime, Utc};
use super::common::Percent;

/// Implements newtype wrapper around currency.
///
macro_rules! impl_currency {
    ($currency:ident) => {
        #[doc = concat!("[`", stringify!($currency), "`] newtype wrapper represents value of something in ", stringify!($currency), ".")]
        #[derive(Copy, Clone, Debug, PartialEq, PartialOrd)]
        pub struct $currency(pub f64);
        impl fmt::Display for $currency {
            fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
                write!(f, concat!("{} ", stringify!($currency)), self.0)
            }
        }
    };
}
impl_currency!(USDC);
impl_currency!(ETH);

/// [`Wallet`] struct represents data about any crypto wallet.
///
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub struct Wallet;

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
        at: DateTime<Utc>
    },
    /// Collateral of loan was liquidated due to value depreciation.
    ///
    Liquidated {
        /// Time of liquidation.
        ///
        at: DateTime<Utc>
    },
    /// Loan was not returned.
    ///
    Overdue,
}
/// [`LoanOutcomeResult`] struct represents the result of a loan that was confirmed by the lender.
///
pub struct LoanOutcomeResult {
    /// Borrower id.
    ///
    pub borrower: UserId,
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
        /// Possible borrowers.
        ///
        possible_borrowers: Vec<UserId>,
    },
    /// Loan is active (in progress).
    ///
    Active {
        /// Borrower id.
        ///
        borrower: UserId,
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
        write!(f, "{}", match self {
            LoanStatus::Awaiting => "Ищем дебитора",
            LoanStatus::Pending { .. } => "Ждем подтверждения",
            LoanStatus::Active { .. } => "В процессе",
            LoanStatus::Completed(_) => "Завершено",
        })
    }
}
/// [`Loan`] struct represents loan that was created by some user (lender).
///
pub struct Loan {
    /// Loan id.
    ///
    pub id: LoanId,
    /// Datetime at which loan was created.
    ///
    pub created_at: DateTime<Utc>,
    /// Lender id.
    ///
    pub lender: UserId,
    /// Wallet of the loan.
    ///
    pub wallet: Wallet,
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
