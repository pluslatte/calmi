use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use calmi_activity_streams::types::object::note::Note;

use crate::domain::repositories::{note::NoteRepository, user::UserRepository};
use crate::{activity_pub::mapper::note::build_note, app::state::AppState};

pub async fn get(
    Path(id): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<Note>, StatusCode> {
    let note_repository: &dyn NoteRepository = &state.storage;
    let note = note_repository
        .find_by_id(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let note = build_note(&state.config.base_url, &note);
    Ok(Json(note))
}
