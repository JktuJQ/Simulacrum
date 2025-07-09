use alloy::{
    primitives::Address,
    providers::{
        fillers::{BlobGasFiller, ChainIdFiller, FillProvider, GasFiller, JoinFill, NonceFiller},
        Identity, ProviderBuilder, RootProvider,
    },
};
use std::{fmt, marker::PhantomData};

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
    pub const PROVIDER_URL: &'static str = "https://reth-ethereum.ithaca.xyz/rpc";

    pub async fn new() -> Provider {
        Provider(
            ProviderBuilder::new()
                .connect(Provider::PROVIDER_URL)
                .await
                .expect("Provider should be available"),
        )
    }
}

pub const UNISWAP_ROUTER_ADDRESS: &str = "";

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

pub struct Wallet<Currency> {
    pub address: Address,
    _currency_marker: PhantomData<Currency>,
}
impl<Currency> Wallet<Currency> {
    pub fn new(address: String) -> Option<Wallet<Currency>> {
        Some(Wallet {
            address: (&address).parse::<Address>().ok()?,
            _currency_marker: PhantomData,
        })
    }
}
