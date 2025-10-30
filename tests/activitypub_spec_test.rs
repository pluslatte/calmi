use axum_test::TestServer;
use serde_json::Value;

fn create_test_server() -> TestServer {
    let config = calmi::config::Config::default();
    let storage = calmi::storage::memory::MemoryStorage::new();
    let state = calmi::app_state::AppState::new(config, storage);
    let app = calmi::app::router::create_router(state);

    TestServer::new(app).unwrap()
}

#[tokio::test]
async fn test_webfinger_returns_correct_content_type() {
    let server = create_test_server();

    let response = server
        .get("/.well-known/webfinger")
        .add_query_param("resource", "acct:alice@example.com")
        .await;

    response.assert_status_ok();
    assert_eq!(response.header("content-type"), "application/jrd+json");
}

#[tokio::test]
async fn test_webfinger_returns_valid_jrd() {
    let server = create_test_server();

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
    let server = create_test_server();

    let response = server
        .get("/.well-known/webfinger")
        .add_query_param("resource", "alice@example.com")
        .await;

    response.assert_status_bad_request();
}

#[tokio::test]
async fn test_webfinger_returns_404_for_unknown_user() {
    let server = create_test_server();

    let response = server
        .get("/.well-known/webfinger")
        .add_query_param("resource", "acct:unknown@example.com")
        .await;

    response.assert_status_not_found();
}

#[tokio::test]
async fn test_webfinger_returns_404_for_wrong_domain() {
    let server = create_test_server();

    let response = server
        .get("/.well-known/webfinger")
        .add_query_param("resource", "acct:alice@wrongdomain.com")
        .await;

    response.assert_status_not_found();
}

#[tokio::test]
async fn test_actor_returns_correct_content_type() {
    let server = create_test_server();

    let response = server.get("/users/alice").await;

    response.assert_status_ok();
    assert_eq!(response.header("content-type"), "application/activity+json");
}

#[tokio::test]
async fn test_actor_returns_valid_person_object() {
    let server = create_test_server();

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
    let server = create_test_server();

    let response = server.get("/users/alice").await;

    response.assert_status_ok();

    let json: Value = response.json();

    assert!(json["inbox"].is_string());
    assert!(json["outbox"].is_string());
}

#[tokio::test]
async fn test_actor_returns_404_for_unknown_user() {
    let server = create_test_server();

    let response = server.get("/users/unknown").await;

    response.assert_status_not_found();
}

#[tokio::test]
async fn test_multiple_users_have_different_actors() {
    let server = create_test_server();

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
