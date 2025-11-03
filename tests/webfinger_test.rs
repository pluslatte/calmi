mod helper;

use helper::{create_test_server, insert_user, setup_db};
use serde_json::Value;

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
