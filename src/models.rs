#[derive(Copy, Clone, Debug, Default, PartialEq, Eq, PartialOrd, Ord)]
pub enum ActivePage {
    #[default]
    Home,
    Marketplace,
    CreateLoan,
    Dashboard,
}
