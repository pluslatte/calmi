use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::types::{CreateActivity, CreateNoteRequest, Note, OutboxCollection};
use crate::users::{self, PostStore};

const DOMAIN: &str = "example.com";

pub async fn outbox_handler(
    Path(username): Path<String>,
    State(store): State<PostStore>,
) -> Result<Json<OutboxCollection>, StatusCode> {
    if !users::user_exists(&username) {
        return Err(StatusCode::NOT_FOUND);
    }

    let posts = users::get_posts(&store, &username);

    let outbox = OutboxCollection {
        context: "https://www.w3.org/ns/activitystreams".to_string(),
        id: format!("https://{}/users/{}/outbox", DOMAIN, username),
        r#type: "OrderedCollection".to_string(),
        total_items: posts.len() as u32,
        first: None,
        last: None,
    };

    Ok(Json(outbox))
}

pub async fn create_post_handler(
    Path(username): Path<String>,
    State(store): State<PostStore>,
    Json(request): Json<CreateNoteRequest>,
) -> Result<Json<CreateActivity>, StatusCode> {
    if !users::user_exists(&username) {
        return Err(StatusCode::NOT_FOUND);
    }

    if request.r#type != "Create" || request.object.r#type != "Note" {
        return Err(StatusCode::BAD_REQUEST);
    }

    let now = chrono::Utc::now().to_rfc3339();
    let post_id = format!("{}", chrono::Utc::now().timestamp_millis());

    let note_id = format!("https://{}/users/{}/statuses/{}", DOMAIN, username, post_id);
    let activity_id = format!("{}/activity", note_id);
    let actor_id = format!("https://{}/users/{}", DOMAIN, username);

    let note = Note {
        context: None,
        id: note_id.clone(),
        r#type: "Note".to_string(),
        content: request.object.content,
        published: now.clone(),
        attributed_to: actor_id.clone(),
        to: if request.object.to.is_empty() {
            Some(vec![
                "https://www.w3.org/ns/activitystreams#Public".to_string(),
            ])
        } else {
            Some(request.object.to)
        },
        cc: if request.object.cc.is_empty() {
            None
        } else {
            Some(request.object.cc.clone())
        },
    };

    users::add_post(&store, &username, note.clone());

    let activity = CreateActivity {
        context: Some(vec!["https://www.w3.org/ns/activitystreams".to_string()]),
        id: activity_id,
        r#type: "Create".to_string(),
        actor: actor_id,
        published: now,
        to: note.to.clone().unwrap_or_default(),
        cc: note.cc.clone(),
        object: note,
    };

    Ok(Json(activity))
}
