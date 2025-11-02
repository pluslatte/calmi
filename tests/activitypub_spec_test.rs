use axum_test::TestServer;
use sea_orm::{ActiveModelTrait, ConnectionTrait, Database, DatabaseConnection, Statement};
use serde_json::Value;

use migration::{Migrator, MigratorTrait};

async fn setup_db() -> DatabaseConnection {
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

fn create_test_server(db: DatabaseConnection) -> TestServer {
    let config = calmi::config::Config::default();
    let storage = calmi::storage::postgres::PostgresStorage::new(db);
    let state = calmi::app_state::AppState::new(config, storage);
    let app = calmi::app::router::create_router(state);

    TestServer::new(app).unwrap()
}

async fn insert_user(db: &DatabaseConnection, username: &str, display_name: &str) {
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

#[tokio::test]
async fn test_webfinger_returns_correct_content_type() {
    let db = setup_db().await;
    insert_user(&db, "alice", "Alice").await;
    let server = create_test_server(db);

    let response = server
        .get("/.well-known/webfinger")
        .add_query_param("resource", "acct:alice@example.com")
        .await;

    response.assert_status_ok();
    assert_eq!(response.header("content-type"), "application/jrd+json");
}

#[tokio::test]
async fn test_webfinger_returns_valid_jrd() {
    let db = setup_db().await;
    insert_user(&db, "alice", "Alice").await;
    let server = create_test_server(db);

    let response = server
        .get("/.well-known/webfinger")
        .add_query_param("resource", "acct:alice@example.com")
        .await;

    response.assert_status_ok();

    let json: Value = response.json();

    assert_eq!(json["subject"], "acct:alice@example.com");
    assert!(json["links"].is_array());

    let links = json["links"].as_array().unwrap();
    assert_eq!(links.len(), 1);
    assert_eq!(links[0]["rel"], "self");
    assert_eq!(links[0]["type"], "application/activity+json");
    assert_eq!(links[0]["href"], "https://example.com/users/alice");
}

#[tokio::test]
async fn test_webfinger_requires_acct_prefix() {
    let db = setup_db().await;
    let server = create_test_server(db);

    let response = server
        .get("/.well-known/webfinger")
        .add_query_param("resource", "alice@example.com")
        .await;

    response.assert_status_bad_request();
}

#[tokio::test]
async fn test_webfinger_returns_404_for_unknown_user() {
    let db = setup_db().await;
    let server = create_test_server(db);

    let response = server
        .get("/.well-known/webfinger")
        .add_query_param("resource", "acct:unknown@example.com")
        .await;

    response.assert_status_not_found();
}

#[tokio::test]
async fn test_webfinger_returns_404_for_wrong_domain() {
    let db = setup_db().await;
    let server = create_test_server(db);

    let response = server
        .get("/.well-known/webfinger")
        .add_query_param("resource", "acct:alice@wrongdomain.com")
        .await;

    response.assert_status_not_found();
}

#[tokio::test]
async fn test_actor_returns_correct_content_type() {
    let db = setup_db().await;
    insert_user(&db, "alice", "Alice").await;
    let server = create_test_server(db);

    let response = server.get("/users/alice").await;

    response.assert_status_ok();
    assert_eq!(response.header("content-type"), "application/activity+json");
}

#[tokio::test]
async fn test_actor_returns_valid_person_object() {
    let db = setup_db().await;
    insert_user(&db, "alice", "Alice").await;
    let server = create_test_server(db);

    let response = server.get("/users/alice").await;

    response.assert_status_ok();

    let json: Value = response.json();

    assert!(json["@context"].is_array());
    let context = json["@context"].as_array().unwrap();
    assert!(context.contains(&Value::String(
        "https://www.w3.org/ns/activitystreams".to_string()
    )));
    assert!(context.contains(&Value::String("https://w3id.org/security/v1".to_string())));

    assert_eq!(json["id"], "https://example.com/users/alice");
    assert_eq!(json["type"], "Person");
    assert_eq!(json["name"], "Alice");
    assert_eq!(json["inbox"], "https://example.com/users/alice/inbox");
    assert_eq!(json["outbox"], "https://example.com/users/alice/outbox");
}

#[tokio::test]
async fn test_actor_inbox_and_outbox_are_strings_not_objects() {
    let db = setup_db().await;
    insert_user(&db, "alice", "Alice").await;
    let server = create_test_server(db);

    let response = server.get("/users/alice").await;

    response.assert_status_ok();

    let json: Value = response.json();

    assert!(json["inbox"].is_string());
    assert!(json["outbox"].is_string());
}

#[tokio::test]
async fn test_actor_returns_404_for_unknown_user() {
    let db = setup_db().await;
    let server = create_test_server(db);

    let response = server.get("/users/unknown").await;

    response.assert_status_not_found();
}

#[tokio::test]
async fn test_multiple_users_have_different_actors() {
    let db = setup_db().await;
    insert_user(&db, "alice", "Alice").await;
    insert_user(&db, "bob", "Bob").await;
    let server = create_test_server(db);

    let alice_response = server.get("/users/alice").await;
    alice_response.assert_status_ok();
    let alice: Value = alice_response.json();

    let bob_response = server.get("/users/bob").await;
    bob_response.assert_status_ok();
    let bob: Value = bob_response.json();

    assert_eq!(alice["id"], "https://example.com/users/alice");
    assert_eq!(bob["id"], "https://example.com/users/bob");
    assert_eq!(alice["name"], "Alice");
    assert_eq!(bob["name"], "Bob");
}
