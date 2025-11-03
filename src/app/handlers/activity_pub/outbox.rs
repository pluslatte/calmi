use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::activity_streams::mapper::ordered_collection::build_outbox_collection;
use crate::app::state::AppState;
use crate::domain::repositories::{note::NoteRepository, user::UserRepository};
use calmi_activity_streams::types::object::ordered_collection::OrderedCollection;

pub async fn get(
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
