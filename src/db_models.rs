use std::num::TryFromIntError;

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
