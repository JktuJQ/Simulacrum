//! `blockchain` module provides structs that represent Ethereum blockchain entities.
//!

use std::fmt;

/// Implements newtype wrapper around currency.
///
macro_rules! impl_currency {
    ($currency:ident) => {
        #[doc = concat!("[`", stringify!($currency), "`] newtype wrapper represents value of something in ", stringify!($currency), ".")]
        #[derive(Copy, Clone, Debug, PartialEq, PartialOrd)]
        pub struct $currency(pub f64);
        impl fmt::Display for $currency {
            fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
                write!(f, concat!("{} ", stringify!($currency)), self.0)
            }
        }
    };
}
impl_currency!(USDC);
impl_currency!(ETH);

/// [`WalletAddress`] struct is a wrapper around any blockchain address.
///
#[derive(Clone, Debug)]
pub struct WalletAddress(pub String);
