mod helper;

use axum::http::StatusCode;
use calmi::domain::repositories::{FollowsRepository, NoteAnnouncesRepository, NoteLikesRepository};
use calmi::storage::postgres::PostgresStorage;
use helper::{create_test_server, insert_note, insert_user, setup_db};
use serde_json::json;

#[tokio::test]
async fn test_inbox_follow_is_persisted_and_undo_removes_it() {
    let db = setup_db().await;
    let user_id = insert_user(&db, "alice", "Alice").await;
    let server = create_test_server(db.clone());

    let follow_activity = json!({
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": "https://remote.example/follow/123",
        "type": "Follow",
        "actor": "https://remote.example/users/bob",
        "object": "https://example.com/users/alice"
    });

    let follow_response = server
        .post("/users/alice/inbox")
        .json(&follow_activity)
        .await;

    follow_response.assert_status(StatusCode::ACCEPTED);

    let storage = PostgresStorage::new(db.clone());

    let followers = FollowsRepository::list_followers(&storage, user_id)
        .await
        .expect("Failed to list followers");

    assert_eq!(followers.len(), 1);
    assert_eq!(followers[0].actor, "https://remote.example/users/bob");
    assert_eq!(
        followers[0].activity_id,
        "https://remote.example/follow/123"
    );

    let undo_activity = json!({
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": "https://remote.example/undo/123",
        "type": "Undo",
        "actor": "https://remote.example/users/bob",
        "object": {
            "id": "https://remote.example/follow/123",
            "type": "Follow",
            "actor": "https://remote.example/users/bob",
            "object": "https://example.com/users/alice"
        }
    });

    let undo_response = server.post("/users/alice/inbox").json(&undo_activity).await;
    undo_response.assert_status(StatusCode::ACCEPTED);

    let followers_after = FollowsRepository::list_followers(&storage, user_id)
        .await
        .expect("Failed to list followers");

    assert!(followers_after.is_empty());
}

#[tokio::test]
async fn test_inbox_like_and_undo_remove_reaction() {
    let db = setup_db().await;
    let user_id = insert_user(&db, "alice", "Alice").await;
    let note_id = insert_note(&db, "hello", user_id, vec![]).await;
    let server = create_test_server(db.clone());

    let note_url = format!("https://example.com/users/alice/notes/{}", note_id);

    let like_activity = json!({
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": "https://remote.example/like/1",
        "type": "Like",
        "actor": "https://remote.example/users/bob",
        "object": note_url
    });

    let like_response = server.post("/users/alice/inbox").json(&like_activity).await;
    like_response.assert_status(StatusCode::ACCEPTED);

    let storage = PostgresStorage::new(db.clone());

    let likes = NoteLikesRepository::list_likes(&storage, note_id)
        .await
        .expect("Failed to list likes");
    assert_eq!(likes.len(), 1);
    assert_eq!(likes[0].actor, "https://remote.example/users/bob");
    assert_eq!(likes[0].activity_id, "https://remote.example/like/1");

    let undo_like = json!({
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": "https://remote.example/undo/like/1",
        "type": "Undo",
        "actor": "https://remote.example/users/bob",
        "object": {
            "id": "https://remote.example/like/1",
            "type": "Like",
            "actor": "https://remote.example/users/bob",
            "object": format!("https://example.com/users/alice/notes/{}", note_id)
        }
    });

    let undo_like_response = server.post("/users/alice/inbox").json(&undo_like).await;
    undo_like_response.assert_status(StatusCode::ACCEPTED);

    let likes_after = NoteLikesRepository::list_likes(&storage, note_id)
        .await
        .expect("Failed to list likes after undo");
    assert!(likes_after.is_empty());
}

#[tokio::test]
async fn test_inbox_announce_is_persisted() {
    let db = setup_db().await;
    let user_id = insert_user(&db, "alice", "Alice").await;
    let note_id = insert_note(&db, "boost me", user_id, vec![]).await;
    let server = create_test_server(db.clone());

    let note_url = format!("https://example.com/users/alice/notes/{}", note_id);
    let announce_activity = json!({
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": "https://remote.example/announce/1",
        "type": "Announce",
        "actor": "https://remote.example/users/bob",
        "object": note_url
    });

    let announce_response = server
        .post("/users/alice/inbox")
        .json(&announce_activity)
        .await;
    announce_response.assert_status(StatusCode::ACCEPTED);

    let storage = PostgresStorage::new(db.clone());

    let announces = NoteAnnouncesRepository::list_announces(&storage, note_id)
        .await
        .expect("Failed to list announces");

    assert_eq!(announces.len(), 1);
    assert_eq!(announces[0].actor, "https://remote.example/users/bob");
    assert_eq!(
        announces[0].activity_id,
        "https://remote.example/announce/1"
    );
}

#[tokio::test]
async fn test_inbox_undo_activity_id_only_removes_like() {
    let db = setup_db().await;
    let user_id = insert_user(&db, "alice", "Alice").await;
    let note_id = insert_note(&db, "hello", user_id, vec![]).await;
    let server = create_test_server(db.clone());

    let note_url = format!("https://example.com/users/alice/notes/{}", note_id);

    let like_activity = json!({
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": "https://remote.example/like/2",
        "type": "Like",
        "actor": "https://remote.example/users/charlie",
        "object": note_url
    });

    server
        .post("/users/alice/inbox")
        .json(&like_activity)
        .await
        .assert_status(StatusCode::ACCEPTED);

    let undo_activity = json!({
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": "https://remote.example/undo/like/2",
        "type": "Undo",
        "actor": "https://remote.example/users/charlie",
        "object": "https://remote.example/like/2"
    });

    server
        .post("/users/alice/inbox")
        .json(&undo_activity)
        .await
        .assert_status(StatusCode::ACCEPTED);

    let storage = PostgresStorage::new(db.clone());

    let likes = NoteLikesRepository::list_likes(&storage, note_id)
        .await
        .expect("Failed to list likes");
    assert!(likes.is_empty());
}
