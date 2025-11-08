use crate::domain::entities::user::Model as User;
use crate::domain::repositories::{NoteAnnounceRepository, NoteRepository};
use axum::http::StatusCode;

pub async fn handle<T: NoteRepository + NoteAnnounceRepository>(
    announce_data: crate::app::object_receivers::activity_pub::inbox::UndoAnnounceActivityData,
    username: &str,
    inbox_owner: &User,
    storage: &T,
) -> Result<StatusCode, StatusCode> {
    if announce_data.target.author_username != username {
        eprintln!(
            "Undo Announce target mismatch: expected {}, received {}",
            username, announce_data.target.author_username
        );
        return Err(StatusCode::BAD_REQUEST);
    }

    if let Some(note) = storage
        .find_note_by_id(announce_data.target.note_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    {
        if note.author_id != inbox_owner.id {
            eprintln!(
                "Undo Announce note author mismatch: expected {}, found {}",
                inbox_owner.id, note.author_id
            );
            return Err(StatusCode::BAD_REQUEST);
        }

        let mut removed = 0;
        if let Some(activity_id) = announce_data.activity_id.as_deref() {
            removed = storage
                .remove_announce_by_activity_id(activity_id)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        }

        if removed == 0 {
            storage
                .remove_announce(note.id, &announce_data.actor_id)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        }
    } else {
        eprintln!(
            "Undo Announce references unknown note {}",
            announce_data.target.note_id
        );
    }

    Ok(StatusCode::ACCEPTED)
}
