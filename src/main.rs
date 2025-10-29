use axum::{Router, routing};

mod handlers;
mod types;
mod users;

#[tokio::main]
async fn main() {
    let app = Router::new()
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
            routing::get(handlers::outbox::outbox_handler),
        );

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
