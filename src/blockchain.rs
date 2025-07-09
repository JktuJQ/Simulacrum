//! `blockchain` module provides handlers of Ethereum blockchain entities
//! and functions to interact with them.
//!

use alloy::{
    primitives::Address,
    providers::{
        fillers::{BlobGasFiller, ChainIdFiller, FillProvider, GasFiller, JoinFill, NonceFiller},
        Identity, ProviderBuilder, RootProvider,
    },
    transports::TransportError,
};
use std::{fmt, str::FromStr};

/// [`Provider`] struct represents RPC provider of the blockchain.
///
#[derive(Clone, Debug)]
pub struct Provider(
    pub  FillProvider<
        JoinFill<
            Identity,
            JoinFill<GasFiller, JoinFill<BlobGasFiller, JoinFill<NonceFiller, ChainIdFiller>>>,
        >,
        RootProvider,
    >,
);
impl Provider {
    /// Provider URL.
    ///
    pub const PROVIDER_URL: &'static str = "https://reth-ethereum.ithaca.xyz/rpc";

    /// Initializes connection to provider.
    ///
    pub async fn new() -> Result<Provider, TransportError> {
        Ok(Provider(
            ProviderBuilder::new()
                .connect(Provider::PROVIDER_URL)
                .await?,
        ))
    }
}

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
pub struct WalletAddress(pub Address);
impl From<String> for WalletAddress {
    // This function should not panic: however, current implementation could panic;
    // this is a workaround for `query_as!` macro.
    fn from(value: String) -> Self {
        WalletAddress(
            (&value)
                .parse::<Address>()
                .expect("Addresses in database should be correct."),
        )
    }
}
