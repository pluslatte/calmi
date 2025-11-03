use calmi::app;
use calmi::config;
use calmi::storage;
use sea_orm::ConnectionTrait;
use sea_orm::Database;
use sea_orm::DbBackend;

#[tokio::main]
async fn main() {
    let database_url = std::env::var("DATABASE_URL").expect("env DATABASE_URL must be set");

    let db = Database::connect(database_url)
        .await
        .expect("Failed to connect to database");
    let db = if let DbBackend::Postgres = db.get_database_backend() {
        db
    } else {
        panic!("Unsupported database backend. Only Postgres is supported.");
    };

    let config = config::Config::default();
    let storage = storage::postgres::PostgresStorage::new(db);
    let state = app::state::AppState::new(config, storage);

    let app = app::create_app(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
