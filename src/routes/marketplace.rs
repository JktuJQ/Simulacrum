//! Templates, forms and views for marketplace page.
//!

use axum::response::Html;
use askama::Template;
use chrono::{TimeDelta, TimeZone, Utc};
use crate::models::{Page, LoanId, Percent, USDC, ETH, LoanStatus, Loan};

/// [`MarketplaceTemplate`] is a template for rendering marketplace page.
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
            amount: USDC(1000.0),
            rate: Percent(12.5),
            term: TimeDelta::days(30),
            collateral: ETH(0.5),
            ltv: Percent(45.0),
            status: LoanStatus::InProgress,
            created_at: Utc.with_ymd_and_hms(2025, 7, 8, 14, 26, 10).single().unwrap(),
            remaining: TimeDelta::days(10),
            total_to_repay: USDC(200.0)
        },
        Loan {
            id: LoanId(1),
            amount: USDC(2500.0),
            rate: Percent(15.0),
            term: TimeDelta::days(60),
            collateral: ETH(1.2),
            ltv: Percent(65.0),
            status: LoanStatus::InProgress,
            created_at: Utc.with_ymd_and_hms(2025, 7, 8, 11, 26, 10).single().unwrap(),
            remaining: TimeDelta::days(10),
            total_to_repay: USDC(200.0)
        },
        Loan {
            id: LoanId(2),
            amount: USDC(5000.0),
            rate: Percent(18.0),
            term: TimeDelta::days(90),
            collateral: ETH(2.0),
            ltv: Percent(75.0),
            status: LoanStatus::InProgress,
            created_at: Utc.with_ymd_and_hms(2025, 7, 7, 11, 26, 10).single().unwrap(),
            remaining: TimeDelta::days(10),
            total_to_repay: USDC(200.0)
        },
    ]);

    Html(template.render().expect("This template uses sample data and so rendering cannot fail."))
}