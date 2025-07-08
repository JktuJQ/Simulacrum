//! Templates, forms and views for index page.
//!

use axum::response::Html;
use askama::Template;
use super::Page;

/// [`IndexTemplate`] is a template for rendering index page.
///
#[derive(Template)]
#[template(path = "index.html")]
pub struct IndexTemplate {
    /// Current active page (should be always `Page::Home`).
    ///
    active_page: Page,
}
impl IndexTemplate {
    /// Initializes template with necessary data.
    ///
    pub fn new() -> IndexTemplate {
        IndexTemplate {
            active_page: Page::Home
        }
    }
}
impl Default for IndexTemplate {
    fn default() -> Self {
        Self::new()
    }
}

/// View of index route for website.
///
pub async fn index_route() -> Html<String> {
    let template = IndexTemplate::new();
    Html(template.render().expect("This template uses sample data and so rendering cannot fail."))
}
