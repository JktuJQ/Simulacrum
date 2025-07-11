//! # Simulacrum
//!
//! `Simulacrum` is a decentralized peer lending platform
//! that will simplify the process of issuing and receiving loans
//! between users without intermediaries.
//!

use axum::{routing::{get, post}, Router};
use tower_http::{services::ServeDir, limit::RequestBodyLimitLayer};

mod blockchain;
mod models;
mod routes;

/// Entry point for program.
///
#[shuttle_runtime::main]
pub async fn main() -> shuttle_axum::ShuttleAxum {
    let router = Router::new()
        .route("/", get(routes::index_route))
        .route("/marketplace", get(routes::marketplace_route))
        .route("/get_loans", post(routes::loans_vec).layer(RequestBodyLimitLayer::new(1024 * 16)))
        .route("/create-loan", get(routes::create_loan_route))
        .route("/dashboard", get(routes::dashboard_route))
        .nest_service("/static", ServeDir::new("static"));
    Ok(router.into())
}
