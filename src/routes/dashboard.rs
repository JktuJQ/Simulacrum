use super::Page;
use askama::Template;
use axum::response::Html;

/// [`DashboardTemplate`] is a template for rendering dashboard page.
///
#[derive(Template)]
#[template(path = "dashboard.html")]
pub struct DashboardTemplate {
    /// Current active page (should be always `Page::Dashboard`).
    ///
    active_page: Page,
}
impl DashboardTemplate {
    /// Initializes template with necessary data.
    ///
    pub fn new() -> DashboardTemplate {
        DashboardTemplate {
            active_page: Page::Dashboard,
        }
    }
}

/// View of dashboard route for website.
///
pub async fn dashboard_route() -> Html<String> {
    let template = DashboardTemplate::new();

    Html(
        template
            .render()
            .expect("This template is empty and so rendering cannot fail."),
    )
}
