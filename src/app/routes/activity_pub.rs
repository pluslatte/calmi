use axum::{Router, routing::get, routing::post};

use crate::app::handlers;
use crate::app::state::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(
            "/.well-known/webfinger",
            get(handlers::activity_pub::webfinger::get),
        )
        .route(
            "/users/{username}",
            get(handlers::activity_pub::person::get),
        )
        .route(
            "/users/{username}/inbox",
            post(handlers::activity_pub::inbox::post),
        )
        .route(
            "/users/{username}/outbox",
            get(handlers::activity_pub::outbox::get),
        )
        .route(note_endpoint(), get(handlers::activity_pub::note::get))
}

pub fn note_endpoint() -> &'static str {
    "/users/{username}/statuses/{id}"
}

pub fn note_uri(base_url: &str, username: &str, id: &str) -> String {
    format!("{}/users/{}/statuses/{}", base_url, username, id)
}
