//! Templates, forms and views for marketplace page.
//!

use askama::Template;
use axum::response::Html;
use chrono::{TimeDelta, TimeZone, Utc};

use super::Page;
use crate::{
    blockchain::{WalletAddress, ETH, USDC},
    models::{Loan, LoanId, LoanStatus, Percent},
};

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
            created_at: Utc
                .with_ymd_and_hms(2025, 7, 8, 14, 26, 10)
                .single()
                .unwrap(),
            borrower: WalletAddress("0x769673C05EaA76d8B3669fb2D0aEDFD6EE34C4Da".to_string()),
            status: LoanStatus::Awaiting,
            amount: USDC(1000.0),
            collateral: ETH(0.5),
            rate: Percent(12.5),
            term: TimeDelta::days(30),
        },
        Loan {
            id: LoanId(1),
            created_at: Utc
                .with_ymd_and_hms(2025, 7, 8, 11, 26, 10)
                .single()
                .unwrap(),
            borrower: WalletAddress("0x769673C05EaA76d8B3669fb2D0aEDFD6EE34C4Da".to_string()),
            status: LoanStatus::Awaiting,
            amount: USDC(2500.0),
            collateral: ETH(1.2),
            rate: Percent(15.0),
            term: TimeDelta::days(60),
        },
        Loan {
            id: LoanId(2),
            created_at: Utc
                .with_ymd_and_hms(2025, 7, 7, 11, 26, 10)
                .single()
                .unwrap(),
            borrower: WalletAddress("0x769673C05EaA76d8B3669fb2D0aEDFD6EE34C4Da".to_string()),
            status: LoanStatus::Awaiting,
            amount: USDC(5000.0),
            collateral: ETH(2.0),
            rate: Percent(18.0),
            term: Default::default(),
        },
    ]);

    Html(
        template
            .render()
            .expect("This template uses sample data and so rendering cannot fail."),
    )
}
