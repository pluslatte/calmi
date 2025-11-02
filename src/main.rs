use calmi::app;
use calmi::app_state;
use calmi::config;
use calmi::storage;
use sea_orm::Database;

#[tokio::main]
async fn main() {
    let database_url = std::env::var("DATABASE_URL").expect("env DATABASE_URL must be set");

    let db = Database::connect(database_url)
        .await
        .expect("Failed to connect to database");

    let config = config::Config::default();
    let storage = storage::memory::MemoryStorage::new();
    let state = app_state::AppState::new(config, storage);

    let app = app::router::create_router(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
