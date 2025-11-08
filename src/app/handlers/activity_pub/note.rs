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
    let storage = &state.storage;

    let note = NoteRepository::find_note_by_id(storage, id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;
    let author = UserRepository::find_user_by_id(storage, note.author_id)
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
