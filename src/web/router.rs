use axum::{Router, routing};

use crate::app_state::AppState;
use crate::web::handlers;

pub fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/", routing::get(|| async { "ActivityPub Server" }))
        .route(
            "/.well-known/webfinger",
            routing::get(handlers::webfinger::webfinger),
        )
        .route(
            "/users/{username}",
            routing::get(handlers::actor::actor_handler),
        )
        .route(
            "/users/{username}/inbox",
            routing::post(handlers::inbox::inbox_handler),
        )
        .route(
            "/users/{username}/outbox",
            routing::get(handlers::outbox::outbox_handler)
                .post(handlers::outbox::create_post_handler),
        )
        .route(
            "/users/{username}/statuses/{id}",
            routing::get(handlers::note::note_handler),
        )
        .with_state(state)
}
