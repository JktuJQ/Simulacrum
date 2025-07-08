use axum::response::Html;
use askama::Template;
use crate::models::{Page, Loan, Investment};

#[derive(Template)]
#[template(path = "dashboard.html")]
pub struct DashboardTemplate {
    active_page: Page,
    wallet_connected: bool,
    my_loans: Vec<Loan>,
    my_investments: Vec<Investment>,
}

pub async fn dashboard_route() -> Html<String> {
    let template = DashboardTemplate {
        active_page: Page::Dashboard,
        wallet_connected: true, // In real app, this would check if wallet is connected
        my_loans: vec![
            Loan {
                id: 1,
                amount: "1,500".to_string(),
                rate: 12.5,
                term: 60,
                collateral: "0.75".to_string(),
                ltv: 60.0,
                status: "Активен".to_string(),
                created_at: "5 часов назад".to_string(),
                days_remaining: 25,
                total_to_repay: "1,687.50".to_string(),
            },
            // Loan {
            //     id: 2,
            //     amount: "3,000".to_string(),
            //     rate: 15.0,
            //     collateral: "1.5".to_string(),
            //     ltv: 80.0,
            //     status: "Активен".to_string(),
            //     days_remaining: 10,
            //     total_to_repay: "3,450.00".to_string(),
            // },
        ],
        my_investments: vec![
            Investment {
                id: 1,
                amount: "2,000".to_string(),
                rate: 14.0,
                collateral: "1.2".to_string(),
                ltv: 65.0,
                status: "Ожидает погашения".to_string(),
                days_remaining: 15,
                earned: "115.07".to_string(),
                roi: 14.0,
                progress: 83.3, // 15 of 18 days passed
            },
            Investment {
                id: 2,
                amount: "5,000".to_string(),
                rate: 18.0,
                collateral: "3.0".to_string(),
                ltv: 70.0,
                status: "Погашен".to_string(),
                days_remaining: 0,
                earned: "750.00".to_string(),
                roi: 18.0,
                progress: 100.0,
            },
        ],
    };
    
    Html(template.render().expect("This template is empty and so rendering cannot fail."))
}