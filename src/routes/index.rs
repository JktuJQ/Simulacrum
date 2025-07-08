use axum::response::Html;
use askama::Template;
use crate::models::Page;

#[derive(Template)]
#[template(path = "index.html")]
pub struct IndexTemplate {
    active_page: Page,
}
impl IndexTemplate {
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

pub async fn index_route() -> Html<String> {
    let template = IndexTemplate::new();
    Html(template.render().expect("This template is empty and so rendering cannot fail."))
}
