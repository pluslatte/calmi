use axum::{Router, routing};

mod activitypub;
mod app_state;
mod config;
mod domain;
mod storage;
mod web;

#[tokio::main]
async fn main() {
    let config = config::Config::default();
    let storage = storage::memory::MemoryStorage::new();
    let state = app_state::AppState::new(config, storage);

    let app = Router::new()
        .route("/", routing::get(|| async { "ActivityPub Server" }))
        .route(
            "/.well-known/webfinger",
            routing::get(web::handlers::webfinger::webfinger),
        )
        .route(
            "/users/{username}",
            routing::get(web::handlers::actor::actor_handler),
        )
        .route(
            "/users/{username}/inbox",
            routing::post(web::handlers::inbox::inbox_handler),
        )
        .route(
            "/users/{username}/outbox",
            routing::get(web::handlers::outbox::outbox_handler)
                .post(web::handlers::outbox::create_post_handler),
        )
        .route(
            "/users/{username}/statuses/{id}",
            routing::get(web::handlers::note::note_handler),
        )
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
