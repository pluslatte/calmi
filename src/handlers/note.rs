use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::types::Note;
use crate::users::{self, PostStore};

pub async fn note_handler(
    Path((username, note_id)): Path<(String, String)>,
    State(store): State<PostStore>,
) -> Result<Json<Note>, StatusCode> {
    if !users::user_exists(&username) {
        return Err(StatusCode::NOT_FOUND);
    }

    let full_note_id = format!(
        "https://example.com/users/{}/statuses/{}",
        username, note_id
    );

    let note =
        users::get_post_by_id(&store, &username, &full_note_id).ok_or(StatusCode::NOT_FOUND)?;

    let mut note_with_context = note;
    note_with_context.context = Some(vec!["https://www.w3.org/ns/activitystreams".to_string()]);

    Ok(Json(note_with_context))
}
