use axum::{Router, routing::get, routing::post};

use crate::activity_pub;
use crate::app::handlers;
use crate::app::state::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(
            "/.well-known/webfinger",
            get(handlers::activity_pub::webfinger::get),
        )
        .route(
            activity_pub::mapper::person::endpoint_uri_template(),
            get(handlers::activity_pub::person::get),
        )
        .route(
            activity_pub::mapper::inbox::endpoint_uri_template(),
            post(handlers::activity_pub::inbox::post),
        )
        .route(
            activity_pub::mapper::outbox::endpoint_uri_template(),
            get(handlers::activity_pub::outbox::get),
        )
        .route(
            activity_pub::mapper::note::endpoint_uri_template(),
            get(handlers::activity_pub::note::get),
        )
        .route(
            activity_pub::mapper::create::endpoint_uri_template(),
            get(handlers::activity_pub::create::get),
        )
}
