use super::UndoLikeActivityData;
use crate::domain::entities::users::Model as User;
use crate::domain::repositories::{NoteLikesRepository, NotesRepository};
use axum::http::StatusCode;

pub async fn handle<T: NotesRepository + NoteLikesRepository>(
    like_data: UndoLikeActivityData,
    username: &str,
    inbox_owner: &User,
    storage: &T,
) -> Result<StatusCode, StatusCode> {
    if like_data.target.author_username != username {
        eprintln!(
            "Undo Like target mismatch: expected {}, received {}",
            username, like_data.target.author_username
        );
        return Err(StatusCode::BAD_REQUEST);
    }

    if let Some(note) = storage
        .find_note_by_id(like_data.target.note_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    {
        if note.author_id != inbox_owner.id {
            eprintln!(
                "Undo Like note author mismatch: expected {}, found {}",
                inbox_owner.id, note.author_id
            );
            return Err(StatusCode::BAD_REQUEST);
        }

        let mut removed = 0;
        if let Some(activity_id) = like_data.activity_id.as_deref() {
            removed = storage
                .remove_like_by_activity_id(activity_id)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        }

        if removed == 0 {
            storage
                .remove_like(note.id, &like_data.actor_id)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        }
    } else {
        eprintln!(
            "Undo Like references unknown note {}",
            like_data.target.note_id
        );
    }

    Ok(StatusCode::ACCEPTED)
}
