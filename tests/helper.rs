use axum_test::TestServer;
use migration::{Migrator, MigratorTrait};
use sea_orm::{ConnectionTrait, Database, DatabaseConnection, Statement};

pub async fn setup_db() -> DatabaseConnection {
    let base_url =
        std::env::var("TEST_DATABASE_URL").expect("TEST_DATABASE_URL must be set for tests");

    let db_name = format!("test_{}", uuid::Uuid::new_v4().simple());

    let admin_db = Database::connect(&base_url)
        .await
        .expect("Failed to connect to admin database");

    admin_db
        .execute(Statement::from_string(
            admin_db.get_database_backend(),
            format!("CREATE DATABASE \"{}\"", db_name),
        ))
        .await
        .expect("Failed to create test database");

    let mut test_db_url = url::Url::parse(&base_url).expect("Invalid database URL");
    test_db_url.set_path(&db_name);

    let test_db = Database::connect(test_db_url.as_str())
        .await
        .expect("Failed to connect to test database");

    Migrator::up(&test_db, None)
        .await
        .expect("Failed to run migrations");

    test_db
}

pub fn create_test_server(db: DatabaseConnection) -> TestServer {
    let config = calmi::config::Config::default();
    let storage = calmi::storage::postgres::PostgresStorage::new(db);
    let state = calmi::app::state::AppState::new(config, storage);
    let app = calmi::app::create_app(state);

    TestServer::new(app).unwrap()
}

pub async fn insert_user(db: &DatabaseConnection, username: &str, display_name: &str) -> i32 {
    use calmi::domain::repositories::UserRepository;
    let storage = calmi::storage::postgres::PostgresStorage::new(db.clone());
    let user = storage
        .create(username, display_name)
        .await
        .expect("Failed to insert user");
    user.id
}

#[allow(dead_code)]
pub async fn insert_note(
    db: &DatabaseConnection,
    content: &str,
    author_id: i32,
    to: Vec<String>,
) -> i32 {
    use calmi::domain::repositories::NoteRepository;
    let storage = calmi::storage::postgres::PostgresStorage::new(db.clone());
    let note = storage
        .create(content, author_id, to)
        .await
        .expect("Failed to insert note");
    note.id
}
