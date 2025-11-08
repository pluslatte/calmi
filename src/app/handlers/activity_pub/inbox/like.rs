use crate::app::object_receivers;
use crate::domain::entities::user::Model as User;
use crate::domain::repositories::{NoteLikeRepository, NoteRepository};
use axum::http::StatusCode;
use calmi_activity_streams::types::object::like::Like;

pub async fn handle<T: NoteRepository + NoteLikeRepository>(
    like: Like,
    base_url: &str,
    username: &str,
    inbox_owner: &User,
    storage: &T,
) -> Result<StatusCode, StatusCode> {
    match object_receivers::activity_pub::inbox::handle_like(like, base_url).await {
        Ok(data) => {
            if data.target.author_username != username {
                eprintln!(
                    "Like target mismatch: expected {}, received {}",
                    username, data.target.author_username
                );
                return Err(StatusCode::BAD_REQUEST);
            }

            let note = match storage
                .find_note_by_id(data.target.note_id)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
            {
                Some(note) => note,
                None => {
                    eprintln!("Received Like for unknown note id {}", data.target.note_id);
                    return Ok(StatusCode::ACCEPTED);
                }
            };

            if note.author_id != inbox_owner.id {
                eprintln!(
                    "Like target note author mismatch: expected {}, found id {}",
                    inbox_owner.id, note.author_id
                );
                return Err(StatusCode::BAD_REQUEST);
            }

            if let Err(err) = storage
                .add_like(note.id, &data.actor_id, &data.activity_id)
                .await
            {
                eprintln!("Failed to persist like: {}", err);
                return Err(StatusCode::INTERNAL_SERVER_ERROR);
            }

            println!("Like recorded: {} liked note {}", data.actor_id, note.id);
            Ok(StatusCode::ACCEPTED)
        }
        Err(e) => {
            eprintln!("Failed to handle Like activity: {}", e);
            Err(StatusCode::BAD_REQUEST)
        }
    }
}
