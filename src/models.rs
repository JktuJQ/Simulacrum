#[derive(Copy, Clone, Debug, Default, PartialEq, Eq, PartialOrd, Ord)]
pub enum Page {
    #[default]
    Home,
    Marketplace,
    CreateLoan,
    Dashboard,
}

pub struct Loan {
    pub id: u32,
    pub amount: String,
    pub rate: f32,
    pub term: u32,
    pub collateral: String,
    pub ltv: f32,
    pub status: String,
    pub created_at: String,
}