use axum::response::Html;
use askama::Template;
use crate::models::ActivePage;

#[derive(Template)]
#[template(path = "create_loan.html")]
pub struct CreateLoanTemplate {
    active_page: ActivePage,
}
impl CreateLoanTemplate {
    pub fn new() -> CreateLoanTemplate {
        CreateLoanTemplate {
            active_page: ActivePage::CreateLoan
        }
    }
}
impl Default for CreateLoanTemplate {
    fn default() -> Self {
        Self::new()
    }
}

pub async fn create_loan_route() -> Html<String> {
    let template = CreateLoanTemplate::new();
    Html(template.render().expect("This template is empty and so rendering cannot fail."))
}
