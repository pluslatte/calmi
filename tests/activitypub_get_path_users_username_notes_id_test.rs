mod helper;

use helper::{create_test_server, insert_note, insert_user, setup_db};
use serde_json::Value;

#[tokio::test]
async fn returns_ok_if_note_exists() {
    // ALT: ノートが存在する場合、200 OK を返す
    let db = setup_db().await;
    let author_id = "https://example.com/users/alice";
    insert_user(&db, "alice", "Alice").await;
    insert_note(&db, "note1", "Hello world", author_id, vec![]).await;
    let server = create_test_server(db);

    let response = server.get("/users/alice/notes/note1").await;

    response.assert_status_ok();
    assert_eq!(response.header("content-type"), "application/activity+json");
}

#[tokio::test]
async fn returns_note_as_a_valid_note_object() {
    // ALT: ノートが有効な Note オブジェクトとして返される
    let db = setup_db().await;
    let author_id = "https://example.com/users/alice";
    insert_user(&db, "alice", "Alice").await;
    insert_note(
        &db,
        "note1",
        "Hello world",
        author_id,
        vec!["https://example.com/users/bob".to_string()],
    )
    .await;
    let server = create_test_server(db);

    let response = server.get("/users/alice/notes/note1").await;

    response.assert_status_ok();

    let json: Value = response.json();

    assert!(json["@context"].is_array());
    let context = json["@context"].as_array().unwrap();
    assert!(context.contains(&Value::String(
        "https://www.w3.org/ns/activitystreams".to_string()
    )));

    assert_eq!(json["id"], "https://example.com/users/alice/notes/note1");
    assert_eq!(json["type"], "Note");
    assert_eq!(json["attributedTo"], author_id);
    assert_eq!(json["content"], "Hello world");
    assert!(json["published"].is_string());
    assert!(json["to"].is_array());
    let to_array = json["to"].as_array().unwrap();
    assert_eq!(to_array.len(), 1);
    assert_eq!(to_array[0], "https://example.com/users/bob");
}

#[tokio::test]
async fn returns_404_for_unknown_note() {
    // ALT: 存在しないノートの場合、404 を返す
    let db = setup_db().await;
    let server = create_test_server(db);

    let response = server.get("/users/alice/notes/unknown").await;

    response.assert_status_not_found();
}

#[tokio::test]
async fn multiple_notes_have_different_objects() {
    // ALT: 複数のノートが異なるオブジェクトとして返される
    let db = setup_db().await;
    let author_id = "https://example.com/users/alice";
    insert_user(&db, "alice", "Alice").await;
    insert_note(&db, "note1", "First note", author_id, vec![]).await;
    insert_note(&db, "note2", "Second note", author_id, vec![]).await;
    let server = create_test_server(db);

    let response1 = server.get("/users/alice/notes/note1").await;
    response1.assert_status_ok();
    let json1: Value = response1.json();

    let response2 = server.get("/users/alice/notes/note2").await;
    response2.assert_status_ok();
    let json2: Value = response2.json();

    assert_eq!(json1["id"], "https://example.com/users/alice/notes/note1");
    assert_eq!(json2["id"], "https://example.com/users/alice/notes/note2");
    assert_eq!(json1["content"], "First note");
    assert_eq!(json2["content"], "Second note");
}
