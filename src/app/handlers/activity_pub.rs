use crate::app::state::AppState;

use axum::{Router, routing::get, routing::post};

mod inbox;
mod note;
mod outbox;
mod person;
mod webfinger;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/.well-known/webfinger", get(webfinger::get))
        .route("/users/{username}", get(person::get))
        .route("/users/{username}/inbox", post(inbox::post))
        .route("/users/{username}/outbox", get(outbox::get))
        .route("/users/{username}/statuses/{id}", get(note::get))
}
