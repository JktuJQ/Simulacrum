use axum::response::Html;
use askama::Template;
use crate::models::{ActivePage, Loan};

#[derive(Template)]
#[template(path = "marketplace.html")]
pub struct MarketplaceTemplate {
    active_page: ActivePage,
    loans: Vec<Loan>,
}

pub async fn marketplace_route() -> Html<String> {
    let template = MarketplaceTemplate {
        active_page: ActivePage::Marketplace,
        loans: vec![
            Loan {
                id: 1,
                amount: "1,000".to_string(),
                rate: 12.5f32,
                term: 30,
                collateral: "0.5".to_string(),
                ltv: 45.0f32,
                status: "Ожидает финансирования".to_string(),
                created_at: "2 часа назад".to_string(),
            },
            Loan {
                id: 2,
                amount: "2,500".to_string(),
                rate: 15.0,
                term: 60,
                collateral: "1.2".to_string(),
                ltv: 65.0,
                status: "Ожидает финансирования".to_string(),
                created_at: "5 часов назад".to_string(),
            },
            Loan {
                id: 3,
                amount: "5,000".to_string(),
                rate: 18.0,
                term: 90,
                collateral: "2.0".to_string(),
                ltv: 75.0,
                status: "Ожидает финансирования".to_string(),
                created_at: "1 день назад".to_string(),
            },
            // Add more sample loans as needed
        ],
    };
    
    Html(template.render().expect("This template is empty and so rendering cannot fail."))
}