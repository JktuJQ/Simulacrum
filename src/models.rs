//! `models` module provides models that represent any data that backend operates with.
//!

use chrono::{TimeDelta, DateTime, Utc};
use std::fmt;

/// [`Page`] enum lists all pages of website.
///
#[derive(Copy, Clone, Debug, Default, PartialEq, Eq)]
pub enum Page {
    /// Home page.
    ///
    #[default]
    Home,
    /// Marketplace page.
    ///
    Marketplace,
    /// Page for creating a loan.
    ///
    CreateLoan,
    /// Dashboard page.
    ///
    Dashboard,
}

/// [`Percent`] newtype wrapper represents percents of anything.
///
#[derive(Copy, Clone, Debug, PartialEq, PartialOrd)]
pub struct Percent(pub f32);
impl fmt::Display for Percent {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}%", self.0)
    }
}

/// [`USDC`] newtype wrapper represents value of something in USDC.
///
pub struct USDC(pub f64);
impl fmt::Display for USDC {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{} USDC", self.0)
    }
}
/// [`ETH`] newtype wrapper represents value of something in ETH.
///
pub struct ETH(pub f64);
impl fmt::Display for ETH {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{} ETH", self.0)
    }
}

/// [`LoanId`] newtype wrapper encapsulates identifier of [`Loan`].
///
pub struct LoanId(pub u64);
impl fmt::Display for LoanId {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}
/// [`LoanStatus`] enum lists all possible states of loan.
///
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum LoanStatus {
    /// Loan is active and anyone could take it.
    ///
    Active,
    /// Loan is in progress.
    ///
    InProgress,
    /// Loan is overdue.
    ///
    Overdue,
}
impl fmt::Display for LoanStatus {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", match self {
            LoanStatus::Active => "Активно",
            LoanStatus::InProgress => "В прогрессе",
            LoanStatus::Overdue => "Просрочено",
        })
    }
}
/// [`Loan`] struct represents data of the loan.
///
pub struct Loan {
    /// Loan id.
    ///
    pub id: LoanId,
    /// Loan amount.
    ///
    pub amount: USDC,
    /// Loan rate (interest).
    ///
    pub rate: Percent,
    /// Terms of loan.
    ///
    pub term: TimeDelta,
    /// Collateral of the loan.
    ///
    pub collateral: ETH,
    /// Current LTV of the loan.
    ///
    pub ltv: Percent,
    /// Status of the loan.
    ///
    pub status: LoanStatus,
    /// Time of creation of loan.
    ///
    pub created_at: DateTime<Utc>,
    /// Time remaining to repay the loan
    ///
    pub remaining: TimeDelta,
    /// Amount left of loan to repay
    ///
    pub total_to_repay: USDC,
}

/// [`InvestmentId`] newtype wrapper encapsulates identifier of [`Investment`].
///
pub struct InvestmentId(pub u64);
impl fmt::Display for InvestmentId {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}
/// [`InvestmentStatus`] enum lists all possible states of loan.
///
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum InvestmentStatus {
    /// Investment is in progress.
    ///
    Active,
    /// Investment is in progress.
    ///
    InProgress,
    /// Investment is returned.
    ///
    Returned,
    /// Investment is overdue.
    ///
    Overdue,
}
impl fmt::Display for InvestmentStatus {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", match self {
            InvestmentStatus::Active => "Активно",
            InvestmentStatus::InProgress => "В прогрессе",
            InvestmentStatus::Returned => "Возвращен",
            InvestmentStatus::Overdue => "Просрочено",
        })
    }
}
pub struct Investment {
    /// Investment id.
    ///
    pub id: InvestmentId,
    /// Investment amount.
    ///
    pub amount: USDC,
    /// Investment rate (interest).
    ///
    pub rate: Percent,
    /// Collateral of the investment.
    ///
    pub collateral: ETH,
    /// Current LTV of the investment.
    ///
    pub ltv: Percent,
    /// Status of the investment.
    ///
    pub status: InvestmentStatus,
    /// Time of creation of investment.
    ///
    pub created_at: DateTime<Utc>,
    /// Time remaining to repay the investment
    ///
    pub remaining: TimeDelta,
    /// Gain from investment
    ///
    pub earned: USDC,
    /// Rate of interest
    ///
    pub roi: Percent,
    /// Days remaining
    ///
    pub progress: Percent
}