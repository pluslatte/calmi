use crate::domain::entities::user::Model as User;
use crate::domain::repositories::{NoteLikeRepository, NoteRepository};
use axum::http::StatusCode;

pub async fn handle(
    like_data: crate::app::object_receivers::activity_pub::inbox::UndoLikeActivityData,
    username: &str,
    inbox_owner: &User,
    note_repository: &dyn NoteRepository,
    like_repository: &dyn NoteLikeRepository,
) -> Result<StatusCode, StatusCode> {
    if like_data.target.author_username != username {
        eprintln!(
            "Undo Like target mismatch: expected {}, received {}",
            username, like_data.target.author_username
        );
        return Err(StatusCode::BAD_REQUEST);
    }

    if let Some(note) = note_repository
        .find_by_id(like_data.target.note_id)
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

        // Use the shared fallback removal helper
        fallback_remove(
            async {
                if let Some(activity_id) = like_data.activity_id.as_deref() {
                    like_repository
                        .remove_like_by_activity_id(activity_id)
                        .await
                        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
                } else {
                    Ok(0)
                }
            },
            async {
                like_repository
                    .remove_like(note.id, &like_data.actor_id)
                    .await
                    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
            },
        ).await?;
    } else {
        eprintln!(
            "Undo Like references unknown note {}",
            like_data.target.note_id
        );
    }

    Ok(StatusCode::ACCEPTED)
}
