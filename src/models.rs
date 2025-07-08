//! `models` module provides models that represent any data that backend operates with.
//!

/// [`Page`] enum lists all pages of website.
///
#[derive(Copy, Clone, Debug, Default, PartialEq, Eq, PartialOrd, Ord)]
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

///
pub struct Loan {
    pub id: u64,
    pub amount: f64,
    pub rate: f32,
    pub term: u32,
    pub collateral: String,
    pub ltv: f32,
    pub status: String,
    pub created_at: String,
}