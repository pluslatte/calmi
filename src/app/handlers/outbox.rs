use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::activitypub::{
    activity::{build_create_activity, build_outbox_collection},
    types::{enums::ActivityExtended, object::ordered_collection::OrderedCollection},
};
use crate::app::types::CreateNoteRequest;
use crate::app_state::AppState;
use crate::domain::post::{Post, PostRepository};
use crate::domain::user::UserRepository;

pub async fn outbox_handler(
    Path(username): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<OrderedCollection>, StatusCode> {
    if !UserRepository::exists(&state.storage, &username) {
        return Err(StatusCode::NOT_FOUND);
    }

    let posts = PostRepository::find_by_username(&state.storage, &username);
    let outbox = build_outbox_collection(&state.config, &username, &posts);

    Ok(Json(outbox))
}

pub async fn create_post_handler(
    Path(username): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<CreateNoteRequest>,
) -> Result<Json<ActivityExtended>, StatusCode> {
    if !UserRepository::exists(&state.storage, &username) {
        return Err(StatusCode::NOT_FOUND);
    }

    if request.r#type != "Create" || request.object.r#type != "Note" {
        return Err(StatusCode::BAD_REQUEST);
    }

    let now = chrono::Utc::now().to_rfc3339();
    let post_id = format!("{}", chrono::Utc::now().timestamp_millis());

    let note_id = format!(
        "{}/users/{}/statuses/{}",
        state.config.base_url, username, post_id
    );
    let actor_id = format!("{}/users/{}", state.config.base_url, username);

    let to = if request.object.to.is_empty() {
        vec!["https://www.w3.org/ns/activitystreams#Public".to_string()]
    } else {
        request.object.to
    };

    let post = Post::new(
        note_id.clone(),
        request.object.content,
        now.clone(),
        actor_id.clone(),
        to.clone(),
    );

    PostRepository::save(&state.storage, &username, post.clone());

    let activity = build_create_activity(&post);

    Ok(Json(ActivityExtended::Create(activity)))
}
