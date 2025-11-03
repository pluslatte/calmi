use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use calmi_activity_streams::types::object::note::Note;

use crate::app::routes::activity_pub::note_uri;
use crate::domain::repositories::{note::NoteRepository, user::UserRepository};
use crate::{activity_pub::mapper::note::build_note, app::state::AppState};

pub async fn get(
    Path((username, id)): Path<(String, String)>,
    State(state): State<AppState>,
) -> Result<Json<Note>, StatusCode> {
    let user_repository: &dyn UserRepository = &state.storage;
    let user = user_repository
        .find_by_id(&username)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let note_id = note_uri(&state.config.base_url, &user.username, &id);

    let note_repository: &dyn NoteRepository = &state.storage;
    let note = note_repository
        .find_by_id(&note_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let note = build_note(&note);
    Ok(Json(note))
}
