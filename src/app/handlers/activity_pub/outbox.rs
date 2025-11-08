use crate::app::object_builders::activity_pub::outbox::build_outbox;
use crate::app::state::AppState;
use crate::domain::repositories::{note::NoteRepository, user::UserRepository};
use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use calmi_activity_streams::types::object::ordered_collection::OrderedCollection;

pub async fn get(
    Path(username): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<OrderedCollection>, StatusCode> {
    let storage = &state.storage;

    let user = UserRepository::find_user_by_username(storage, &username)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;
    let notes = NoteRepository::find_note_by_author_id(storage, user.id, 20, 0)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let outbox = build_outbox(&state.config, &user, &notes);
    Ok(Json(outbox))
}
