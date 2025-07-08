use axum::response::Html;
use askama::Template;
use crate::models::ActivePage;

#[derive(Template)]
#[template(path = "index.html")]
pub struct IndexTemplate {
    active_page: ActivePage,
}
impl IndexTemplate {
    pub fn new() -> IndexTemplate {
        IndexTemplate {
            active_page: ActivePage::Home
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
