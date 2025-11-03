use crate::app::object_builders::activity_pub::note::build_note;
use crate::app::state::AppState;
use crate::domain::repositories::note::NoteRepository;
use crate::domain::repositories::user::UserRepository;
use axum::{
    body::Body,
    extract::{Path, State},
    http::{StatusCode, header},
    response::Response,
};

pub async fn get(
    Path((_, id)): Path<(String, i64)>,
    State(state): State<AppState>,
) -> Result<Response, StatusCode> {
    let note_repository: &dyn NoteRepository = &state.storage;
    let note = note_repository
        .find_by_id(id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let user_repository: &dyn UserRepository = &state.storage;
    let author = user_repository
        .find_by_id(note.author_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let base_url = &state.config.base_url;

    let note = build_note(base_url, &note, &author);
    let json = serde_json::to_string(&note).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let response = Response::builder()
        .header(header::CONTENT_TYPE, "application/activity+json")
        .body(Body::from(json))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(response)
}
