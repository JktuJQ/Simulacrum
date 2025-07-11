//! Templates, forms and views for marketplace page.
//!

use askama::Template;
use axum::{response::Html, extract::Json};
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
}
impl MarketplaceTemplate {
    /// Initializes template with necessary data.
    ///
    pub fn new() -> MarketplaceTemplate {
        MarketplaceTemplate {
            active_page: Page::Marketplace,
        }
    }
}

/// View of marketplace route for website.
///
pub async fn marketplace_route() -> Html<String> {
    let template = MarketplaceTemplate::new();
    Html(template.render().expect("Template rendering should not fail."))
}