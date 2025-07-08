use axum::response::Html;
use askama::Template;
use chrono::{TimeDelta, TimeZone, Utc};
use crate::models::{Page, LoanId, Percent, USDC, ETH, LoanStatus, Loan, Investment, InvestmentId, InvestmentStatus};


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
        ],
        my_investments: vec![
            Investment {
                id: InvestmentId(1),
                amount: USDC(2000.0),
                rate: Percent(14.0),
                collateral: ETH(2.0),
                ltv: Percent(65.0),
                status: InvestmentStatus::InProgress,
                created_at: Utc.with_ymd_and_hms(2025, 7, 7, 11, 26, 10).single().unwrap(),
                remaining: TimeDelta::days(15),
                earned: USDC(115.07),
                roi: Percent(14.0),
                progress: Percent(70.1)
            },
            Investment {
                id: InvestmentId(2),
                amount: USDC(5000.0),
                rate: Percent(18.0),
                collateral: ETH(3.0),
                ltv: Percent(70.0),
                status: InvestmentStatus::Returned,
                created_at: Utc.with_ymd_and_hms(2025, 7, 7, 11, 26, 10).single().unwrap(),
                remaining: TimeDelta::days(0),
                earned: USDC(750.0),
                roi: Percent(18.0),
                progress: Percent(83.0),
            },
        ],
    };
    
    Html(template.render().expect("This template is empty and so rendering cannot fail."))
}