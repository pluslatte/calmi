use axum::{
    body::Body,
    extract::{Path, State},
    http::{StatusCode, header},
    response::Response,
};

use crate::{
    activity_pub::mapper::create::build_create_activity, app::state::AppState,
    domain::repositories::note::NoteRepository, domain::repositories::user::UserRepository,
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

    let create = build_create_activity(base_url, &note, &author);
    let json = serde_json::to_string(&create).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let response = Response::builder()
        .header(header::CONTENT_TYPE, "application/activity+json")
        .body(Body::from(json))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(response)
}
