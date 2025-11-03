use axum_test::TestServer;
use chrono::Utc;
use migration::{Migrator, MigratorTrait};
use sea_orm::{ActiveModelTrait, ConnectionTrait, Database, DatabaseConnection, Statement};

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

pub async fn insert_user(db: &DatabaseConnection, username: &str, display_name: &str) {
    use calmi::domain::entities::user;
    let user = user::ActiveModel {
        id: sea_orm::ActiveValue::Set(format!("https://example.com/users/{}", username)),
        display_name: sea_orm::ActiveValue::Set(display_name.to_string()),
        username: sea_orm::ActiveValue::Set(username.to_string()),
        inbox_url: sea_orm::ActiveValue::Set(format!(
            "https://example.com/users/{}/inbox",
            username
        )),
        outbox_url: sea_orm::ActiveValue::Set(format!(
            "https://example.com/users/{}/outbox",
            username
        )),
    };
    user.insert(db).await.expect("Failed to insert user");
}

pub async fn insert_note(
    db: &DatabaseConnection,
    id: &str,
    content: &str,
    author_id: &str,
    to: Vec<String>,
) {
    use calmi::domain::entities::note;
    let note = note::ActiveModel {
        id: sea_orm::ActiveValue::Set(id.to_string()),
        content: sea_orm::ActiveValue::Set(content.to_string()),
        author_id: sea_orm::ActiveValue::Set(author_id.to_string()),
        created_at: sea_orm::ActiveValue::Set(Utc::now().naive_utc()),
        to: sea_orm::ActiveValue::Set(to),
    };
    note.insert(db).await.expect("Failed to insert note");
}
