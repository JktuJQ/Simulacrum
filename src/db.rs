use sqlx::{FromRow, PgPool};
use std::num::TryFromIntError;

/// [`DB`] struct holds pool of connections of the website's Postgres database.
///
/// It implements `Clone` which allows obtaining new connections.
///
#[derive(Clone, Debug)]
pub struct DB(pub PgPool);

/// [`UserId`] newtype wraps user id from database.
///
#[derive(Copy, Clone, Debug)]
pub struct UserId(pub u64);
impl TryFrom<i64> for UserId {
    type Error = TryFromIntError;

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        Ok(UserId(u64::try_from(value)?))
    }
}
