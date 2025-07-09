//! Templates, forms and views for create loan page.
use super::Page;
use askama::Template;
///!
use axum::response::Html;

/// [`CreateLoanTemplate`] is a template for page that allows creating loans.
///
#[derive(Template)]
#[template(path = "create_loan.html")]
pub struct CreateLoanTemplate {
    /// Current active page (should be always `Page::CreateLoan`).
    ///
    active_page: Page,
}
impl CreateLoanTemplate {
    /// Initializes template with necessary data.
    ///
    pub fn new() -> CreateLoanTemplate {
        CreateLoanTemplate {
            active_page: Page::CreateLoan,
        }
    }
}
impl Default for CreateLoanTemplate {
    fn default() -> Self {
        Self::new()
    }
}

/// View of route that allows creating loans for website.
///
pub async fn create_loan_route() -> Html<String> {
    let template = CreateLoanTemplate::new();
    Html(
        template
            .render()
            .expect("This template uses sample data and so rendering cannot fail."),
    )
}
