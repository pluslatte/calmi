use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::domain::entities::note;
use crate::domain::repositories::{note::NoteRepository, user::UserRepository};
use crate::{activity_streams_mapper::build_create_activity, app_state::AppState};
use crate::{activity_streams_mapper::build_outbox_collection, app::types::CreateNoteRequest};
use calmi_activity_streams::types::object::{
    create::Create, ordered_collection::OrderedCollection,
};
use chrono;
use sea_orm::Set;

pub async fn outbox_handler(
    Path(username): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<OrderedCollection>, StatusCode> {
    let user_repository: &dyn UserRepository = &state.storage;
    let user = user_repository
        .find_by_username(&username)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let note_repository: &dyn NoteRepository = &state.storage;
    let posts = note_repository
        .find_by_author_id(&user.id, 20, 0)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let outbox = build_outbox_collection(&state.config, &username, &posts);

    Ok(Json(outbox))
}

pub async fn create_post_handler(
    Path(username): Path<String>,
    State(state): State<AppState>,
    Json(request): Json<CreateNoteRequest>,
) -> Result<Json<Create>, StatusCode> {
    let user_repository: &dyn UserRepository = &state.storage;
    let user = user_repository
        .find_by_username(&username)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    if request.r#type != "Create" || request.object.r#type != "Note" {
        return Err(StatusCode::BAD_REQUEST);
    }

    let post_id = format!(
        "{}/users/{}/statuses/{}",
        state.config.base_url,
        username,
        chrono::Utc::now().timestamp_millis()
    );

    let to = if request.object.to.is_empty() {
        vec!["https://www.w3.org/ns/activitystreams#Public".to_string()]
    } else {
        request.object.to
    };

    let note_active = note::ActiveModel {
        id: Set(post_id.clone()),
        content: Set(request.object.content),
        author_id: Set(user.id),
        created_at: Set(chrono::Utc::now().naive_utc()),
        to: Set(to),
    };

    let note_repository: &dyn NoteRepository = &state.storage;
    let post = note_repository
        .create(note_active)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let activity = build_create_activity(&post);

    Ok(Json(activity))
}
