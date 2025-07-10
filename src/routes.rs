//! Routes of this website.
//!

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

mod index;
pub use index::*;

mod marketplace;
pub use marketplace::*;

mod create_loan;
pub use create_loan::*;

mod dashboard;
pub use dashboard::*;
