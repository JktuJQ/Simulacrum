use axum::{
    body::Body,
    extract::{Json, Request, State},
    http::{self, header, Response, StatusCode},
    middleware::Next,
    response::IntoResponse,
};
use std::sync::Arc;
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, TokenData, Validation};
use serde::{Deserialize, Serialize};
use serde_json::json;
use cookie::Cookie;

use rand::{distr::Alphanumeric, Rng};

use crate::AppState;

#[derive(Serialize, Deserialize)]
struct UserResponse {
    email: String,
    first_name: String,
    last_name: String,
}

#[derive(Serialize, Deserialize)]
struct Claims {
    iat: chrono::DateTime<Utc>, // Issued at time of the token
    exp: chrono::DateTime<Utc>, // Expiry time of the token
    email: String,              // Email associated with the token
}

fn encode_jwt(email: String) -> Result<String, StatusCode> {
    let secret: String = "randomStringTypicallyFromEnv".to_string();
    let iat = Utc::now();
    let lifetime: chrono::TimeDelta = Duration::hours(24);
    let exp = iat + lifetime;
    let claim = Claims { iat, exp, email };

    encode(
        &Header::default(),
        &claim,
        &EncodingKey::from_secret(secret.as_ref()),
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

fn decode_jwt(jwt_token: String) -> Result<TokenData<Claims>, StatusCode> {
    let secret = "randomStringTypicallyFromEnv".to_string();
    decode(
        &jwt_token,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::default(),
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

pub struct AuthError {
    message: String,
    status_code: StatusCode,
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response<Body> {
        let body = Json(json!({
            "error": self.message,
        }));

        (self.status_code, body).into_response()
    }
}

pub async fn authorize(mut req: Request, next: Next) -> Result<Response<Body>, AuthError> {
    let auth_header = req.headers_mut().get(http::header::AUTHORIZATION);
    let auth_header = match auth_header {
        Some(header) => header.to_str().map_err(|_| AuthError {
            message: "Empty header is not allowed".to_string(),
            status_code: StatusCode::FORBIDDEN,
        })?,
        None => {
            return Err(AuthError {
                message: "Please add the JWT token to the header".to_string(),
                status_code: StatusCode::FORBIDDEN,
            })
        }
    };
    let mut header = auth_header.split_whitespace();
    let (bearer, token) = (header.next(), header.next());
    let token_data = match decode_jwt(token.unwrap().to_string()) {
        Ok(data) => data,
        Err(_) => {
            return Err(AuthError {
                message: "Unable to decode token".to_string(),
                status_code: StatusCode::UNAUTHORIZED,
            })
        }
    };
    Ok(next.run(req).await)
}

fn generate_nonce_string(length: usize) -> String {
    rand::rng()
        .sample_iter(&Alphanumeric)
        .take(length)
        .map(char::from)
        .collect()
}

pub async fn register(
    State(data): State<AppState>,
    address: String
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let user_exists: Option<bool> =
        sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM users WHERE address = $1)")
            .bind(address.to_ascii_lowercase())
            .fetch_one(&data.db.0)
            .await
            .map_err(|e| {
                let error_response = serde_json::json!({
                    "status": "fail",
                    "message": format!("Database error: {}", e),
                });
                (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
            })?;

    if let Some(exists) = user_exists {
        if exists {
            let error_response = serde_json::json!({
                "status": "fail",
                "message": "User with that address already exists",
            });
            return Err((StatusCode::CONFLICT, Json(error_response)));
        }
    }

    let nonce = generate_nonce_string(64);
    // let user = sqlx::query!(
    //     "INSERT INTO users (address, nonce) VALUES ($1, $2) RETURNING *",
    //     address,
    //     nonce,
    // )
    // .execute(&data.db.0)
    // .await
    // .map_err(|e| {
    //     let error_response = serde_json::json!({
    //         "status": "fail",
    //         "message": format!("Database error: {}", e),
    //     });
    //     (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
    // })?;

    let cookie = Cookie::build(("nonce", nonce))
    .domain("localhost")
    .path("/")
    .secure(true)
    .http_only(true);

    let mut response = Response::new(json!({"status": "success"}).to_string());
    response
        .headers_mut()
        .insert(header::SET_COOKIE, cookie.to_string().parse().unwrap());
    Ok(response)
}