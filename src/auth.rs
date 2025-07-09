use axum::{
    body::Body,
    extract::{Json, Request},
    http::{self, Response, StatusCode},
    middleware::Next,
    response::IntoResponse,
};
use chrono::{ Utc, Duration };
use serde::{Deserialize, Serialize};
use serde_json::json;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, TokenData, Validation};

#[derive(Serialize, Deserialize)]
struct UserResponse {
    email: String, 
    first_name: String,
    last_name: String
}

#[derive(Serialize, Deserialize)]
struct Claims {
    iat: chrono::DateTime<Utc>, // Issued at time of the token
    exp: chrono::DateTime<Utc>, // Expiry time of the token
    email: String // Email associated with the token
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
            status_code: StatusCode::FORBIDDEN
        })?,
        None => return Err(AuthError {
            message: "Please add the JWT token to the header".to_string(),
            status_code: StatusCode::FORBIDDEN
        }),
    };
    let mut header = auth_header.split_whitespace();
    let (bearer, token) = (header.next(), header.next());
    let token_data = match decode_jwt(token.unwrap().to_string()) {
        Ok(data) => data,
        Err(_) => return Err(AuthError {
            message: "Unable to decode token".to_string(),
            status_code: StatusCode::UNAUTHORIZED
        }),
    };
    Ok(next.run(req).await)
}