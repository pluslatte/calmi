use axum::{
    body::Body,
    extract::{Path, State},
    http::{StatusCode, header},
    response::Response,
};

use crate::domain::repositories::note::NoteRepository;
use crate::{activity_pub::mapper::note::build_note, app::state::AppState};

pub async fn get(
    Path((_, id)): Path<(String, String)>,
    State(state): State<AppState>,
) -> Result<Response, StatusCode> {
    let note_repository: &dyn NoteRepository = &state.storage;
    let note = note_repository
        .find_by_id(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let base_url = &state.config.base_url;

    let note = build_note(base_url, &note);
    let json = serde_json::to_string(&note).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let response = Response::builder()
        .header(header::CONTENT_TYPE, "application/activity+json")
        .body(Body::from(json))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(response)
}
