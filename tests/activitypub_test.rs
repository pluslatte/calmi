mod helper;

use helper::{create_test_server, insert_user, setup_db};
use serde_json::Value;

#[tokio::test]
async fn test_get_users_username_returns_ok_if_user_exists() {
    let db = setup_db().await;
    insert_user(&db, "alice", "Alice").await;
    let server = create_test_server(db);

    let response = server.get("/users/alice").await;

    response.assert_status_ok();
    assert_eq!(response.header("content-type"), "application/activity+json");
}

#[tokio::test]
async fn test_get_users_username_returns_actor_as_a_valid_person_object() {
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
async fn test_inbox_and_outbox_returned_with_person_are_strings_not_objects() {
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
async fn test_get_users_username_returns_404_for_unknown_user() {
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
