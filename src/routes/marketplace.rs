//! Templates, forms and views for marketplace page.
//!

use axum::response::Html;
use askama::Template;
use chrono::{TimeDelta, TimeZone, Utc};

use crate::db::UserId;
use super::Page;
use crate::models::{common::Percent, market::{LoanId, USDC, ETH, LoanStatus, Loan, Wallet}};

/// [`MarketplaceTemplate`] is a template for rendering marketplace page.
///
#[derive(Template)]
#[template(path = "marketplace.html")]
pub struct MarketplaceTemplate {
    /// Current active page (should be always `Page::Marketplace`).
    ///
    active_page: Page,
    /// All loans for rendering.
    ///
    loans: Vec<Loan>,
}
impl MarketplaceTemplate {
    /// Initializes template with necessary data.
    ///
    pub fn new(loans: Vec<Loan>) -> MarketplaceTemplate {
        MarketplaceTemplate {
            active_page: Page::Marketplace,
            loans,
        }
    }
}

/// View of marketplace route for website.
///
pub async fn marketplace_route() -> Html<String> {
    let template = MarketplaceTemplate::new(vec![
        Loan {
            id: LoanId(0),
            created_at: Utc.with_ymd_and_hms(2025, 7, 8, 14, 26, 10).single().unwrap(),
            lender: UserId(0),
            wallet: Wallet,
            status: LoanStatus::Awaiting,
            amount: USDC(1000.0),
            collateral: ETH(0.5),
            rate: Percent(12.5),
            term: TimeDelta::days(30),
        },
        Loan {
            id: LoanId(1),
            created_at: Utc.with_ymd_and_hms(2025, 7, 8, 11, 26, 10).single().unwrap(),
            lender: UserId(1),
            wallet: Wallet,
            status: LoanStatus::Awaiting,
            amount: USDC(2500.0),
            collateral: ETH(1.2),
            rate: Percent(15.0),
            term: TimeDelta::days(60),
        },
        Loan {
            id: LoanId(2),
            created_at: Utc.with_ymd_and_hms(2025, 7, 7, 11, 26, 10).single().unwrap(),
            lender: UserId(2),
            wallet: Wallet,
            status: LoanStatus::Awaiting,
            amount: USDC(5000.0),
            collateral: ETH(2.0),
            rate: Percent(18.0),
            term: Default::default(),
        },
    ]);

    Html(template.render().expect("This template uses sample data and so rendering cannot fail."))
}