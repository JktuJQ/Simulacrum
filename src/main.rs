//! Simulacrum
//!
//! `Simulacrum` is a decentralized peer lending platform
//! that will simplify the process of issuing and receiving loans
//! between users without intermediaries.
//!

use axum::{extract::FromRef, routing::get, Router, middleware};
use tower_http::services::ServeDir;

use crate::{db::DB, auth::authorize};
use sqlx::PgPool;

use crate::blockchain::Provider;

mod blockchain;
mod db;
mod models;
mod routes;
mod auth;

/// [`AppState`] struct represents the global state of the whole website app.
///
/// Currently, it only has database as the global state.
///
/// Through the `FromRef` trait, it supports conversions to inner DB handler.
///
#[derive(Clone, Debug)]
pub struct AppState {
    /// Blockchain network provider.
    ///
    // pub provider: Provider,
    /// Application's database.
    ///
    pub db: DB,
}
impl FromRef<AppState> for DB {
    fn from_ref(input: &AppState) -> Self {
        input.db.clone()
    }
}

/// Entry point for program.
///
#[shuttle_runtime::main]
pub async fn main(#[shuttle_shared_db::Postgres] pool: PgPool) -> shuttle_axum::ShuttleAxum {
    let router = Router::new()
        .route("/", get(routes::index_route))
        .route("/marketplace", get(routes::marketplace_route))
        .route("/create-loan", get(routes::create_loan_route))
        .route("/dashboard", get(routes::dashboard_route).layer(middleware::from_fn(auth::authorize)))
        .nest_service("/static", ServeDir::new("static"))
        .with_state(AppState {
            // provider: Provider::new().await,
            db: DB(pool),
        });

    Ok(router.into())
}
