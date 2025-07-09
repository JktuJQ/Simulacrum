//! Common models.
//!

use std::fmt;

/// [`Percent`] newtype wrapper represents percents of anything.
///
#[derive(Copy, Clone, Debug, PartialEq, PartialOrd)]
pub struct Percent(pub f32);
impl fmt::Display for Percent {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}%", self.0)
    }
}