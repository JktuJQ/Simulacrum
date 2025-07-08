use axum::{routing::get, Router};
use tower_http::services::ServeDir;

mod models;
mod routes;

#[shuttle_runtime::main]
async fn main() -> shuttle_axum::ShuttleAxum {
    let router = Router::new()
        .route("/", get(routes::index_route))
        .route("/marketplace", get(routes::marketplace_route))
        .route("/create-loan", get(routes::create_loan_route))
        .route("/dashboard", get(routes::dashboard_route))
        .nest_service("/static", ServeDir::new("static"));

    Ok(router.into())
}
