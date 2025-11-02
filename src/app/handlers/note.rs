use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::activitypub::{activity::build_note, types::object::note::Note};
use crate::app_state::AppState;
use crate::domain::note::PostRepository;
use crate::domain::user::UserRepository;

pub async fn note_handler(
    Path((username, id)): Path<(String, String)>,
    State(state): State<AppState>,
) -> Result<Json<Note>, StatusCode> {
    if !UserRepository::exists(&state.storage, &username) {
        return Err(StatusCode::NOT_FOUND);
    }

    let post_id = format!(
        "{}/users/{}/statuses/{}",
        state.config.base_url, username, id
    );
    let post = PostRepository::find_by_id(&state.storage, &username, &post_id)
        .ok_or(StatusCode::NOT_FOUND)?;

    let note = build_note(&post);

    Ok(Json(note))
}
