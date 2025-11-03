use crate::app_state::AppState;

use super::webfinger;
use axum::{Router, routing::get, routing::post};

pub mod actor;
pub mod inbox;
pub mod note;
pub mod outbox;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/.well-known/webfinger", get(webfinger::webfinger))
        .route("/users/{username}", get(actor::person_handler))
        .route("/users/{username}/inbox", post(inbox::inbox_handler))
        .route(
            "/users/{username}/outbox",
            get(outbox::outbox_handler).post(outbox::create_post_handler),
        )
        .route("/users/{username}/statuses/{id}", get(note::note_handler))
}
