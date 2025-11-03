use crate::app::handlers;
use crate::app::object_builders;
use crate::app::object_receivers;
use crate::app::state::AppState;
use axum::{Router, routing::get, routing::post};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/.well-known/webfinger", get(handlers::webfinger::get))
        .route(
            object_builders::activity_pub::person::endpoint_uri_template(),
            get(handlers::activity_pub::person::get),
        )
        .route(
            object_receivers::activity_pub::inbox::endpoint_uri_template(),
            post(handlers::activity_pub::inbox::post),
        )
        .route(
            object_builders::activity_pub::outbox::endpoint_uri_template(),
            get(handlers::activity_pub::outbox::get),
        )
        .route(
            object_builders::activity_pub::note::endpoint_uri_template(),
            get(handlers::activity_pub::note::get),
        )
        .route(
            object_builders::activity_pub::create::endpoint_uri_template(),
            get(handlers::activity_pub::create::get),
        )
}
