use axum::{routing::get, Router};

mod routes;

#[shuttle_runtime::main]
async fn main() -> shuttle_axum::ShuttleAxum {
    let router = Router::new()
        .route("/", get(routes::index));

    Ok(router.into())
}
