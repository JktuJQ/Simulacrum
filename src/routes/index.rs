use axum::response::Html;
use askama::Template;
use crate::models::ActivePage;

#[derive(Template, Default)]
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

pub async fn index_route() -> Html<String> {
    let template = IndexTemplate::new();
    Html(template.render().expect("This template is empty and so rendering cannot fail."))
}
