mod helper;

use helper::{create_test_server, insert_note, insert_user, setup_db};
use serde_json::Value;

#[tokio::test]
async fn returns_ok_if_note_exists_with_correct_header() {
    // ALT: ノートが存在する場合、200 OK を返す
    let db = setup_db().await;
    let author_username = "alice";
    let author_display_name = "Alice";
    let author_id = insert_user(&db, author_username, author_display_name).await;
    let note_id = insert_note(&db, "Hello world", author_id, vec![]).await;
    let server = create_test_server(db);

    let response = server
        .get(&format!(
            "/users/{}/notes/{}/activity",
            author_username, note_id
        ))
        .await;

    response.assert_status_ok();
    assert_eq!(response.header("content-type"), "application/activity+json");
}

#[tokio::test]
async fn returns_create_activity_as_a_valid_create_object() {
    // ALT: Create Activity が有効な Create オブジェクトとして返される
    let db = setup_db().await;
    let author_username = "alice";
    let author_display_name = "Alice";
    let author_id = insert_user(&db, author_username, author_display_name).await;
    let note_id = insert_note(
        &db,
        "Hello world",
        author_id,
        vec!["https://example.com/users/bob".to_string()],
    )
    .await;
    let server = create_test_server(db);

    let response = server
        .get(&format!("/users/alice/notes/{}/activity", note_id))
        .await;

    response.assert_status_ok();

    let json: Value = response.json();

    assert!(json["@context"].is_array());
    let context = json["@context"].as_array().unwrap();
    assert!(context.contains(&Value::String(
        "https://www.w3.org/ns/activitystreams".to_string()
    )));

    assert_eq!(
        json["id"],
        "https://example.com/users/alice/notes/note1/activity"
    );
    assert_eq!(json["type"], "Create");
    assert_eq!(json["actor"], author_username);
    assert!(json["object"].is_object());
    let object = json["object"].as_object().unwrap();
    assert_eq!(object["type"], "Note");
    assert_eq!(object["content"], "Hello world");
    assert_eq!(object["attributedTo"], author_username);
}

#[tokio::test]
async fn returns_404_for_unknown_note() {
    // ALT: 存在しないノートの場合、404 を返す
    let db = setup_db().await;
    let server = create_test_server(db);

    let response = server.get("/users/alice/notes/unknown/activity").await;

    response.assert_status_not_found();
}

#[tokio::test]
async fn multiple_notes_have_different_activities() {
    // ALT: 複数のノートが異なる Create Activity として返される
    let db = setup_db().await;
    let author_username = "alice";
    let author_display_name = "Alice";
    let author_id = insert_user(&db, author_username, author_display_name).await;
    let note1_id = insert_note(&db, "First note", author_id, vec![]).await;
    let note2_id = insert_note(&db, "Second note", author_id, vec![]).await;
    let server = create_test_server(db);

    let response1 = server
        .get(&format!(
            "/users/{}/notes/{}/activity",
            author_username, note1_id
        ))
        .await;
    response1.assert_status_ok();
    let json1: Value = response1.json();

    let response2 = server
        .get(&format!(
            "/users/{}/notes/{}/activity",
            author_username, note2_id
        ))
        .await;
    response2.assert_status_ok();
    let json2: Value = response2.json();

    assert_eq!(
        json1["id"],
        format!(
            "https://example.com/users/alice/notes/{}/activity",
            note1_id
        )
    );
    assert_eq!(
        json2["id"],
        format!(
            "https://example.com/users/alice/notes/{}/activity",
            note2_id
        )
    );
    assert_eq!(json1["object"]["content"], "First note");
    assert_eq!(json2["object"]["content"], "Second note");
}
