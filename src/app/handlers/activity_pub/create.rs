use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use calmi_activity_streams::types::object::create::Create;

use crate::{
    activity_pub::mapper::create::build_create_activity, app::state::AppState,
    domain::repositories::note::NoteRepository,
};

pub async fn get(
    Path(id): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<Create>, StatusCode> {
    let note_repository: &dyn NoteRepository = &state.storage;
    let note = note_repository
        .find_by_id(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let base_url = &state.config.base_url;

    let create = build_create_activity(base_url, &note);
    Ok(Json(create))
}
