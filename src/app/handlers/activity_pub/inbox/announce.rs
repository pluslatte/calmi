use crate::app::object_receivers;
use crate::domain::entities::user::Model as User;
use crate::domain::repositories::{NoteAnnounceRepository, NoteRepository};
use axum::http::StatusCode;
use calmi_activity_streams::types::object::announce::Announce;

pub async fn handle(
    announce: Announce,
    base_url: &str,
    username: &str,
    inbox_owner: &User,
    note_repository: &dyn NoteRepository,
    announce_repository: &dyn NoteAnnounceRepository,
) -> Result<StatusCode, StatusCode> {
    match object_receivers::activity_pub::inbox::handle_announce(announce, base_url).await {
        Ok(data) => {
            if data.target.author_username != username {
                eprintln!(
                    "Announce target mismatch: expected {}, received {}",
                    username, data.target.author_username
                );
                return Err(StatusCode::BAD_REQUEST);
            }

            let note = match note_repository
                .find_by_id(data.target.note_id)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
            {
                Some(note) => note,
                None => {
                    eprintln!(
                        "Received Announce for unknown note id {}",
                        data.target.note_id
                    );
                    return Ok(StatusCode::ACCEPTED);
                }
            };

            if note.author_id != inbox_owner.id {
                eprintln!(
                    "Announce target note author mismatch: expected {}, found {}",
                    inbox_owner.id, note.author_id
                );
                return Err(StatusCode::BAD_REQUEST);
            }

            if let Err(err) = announce_repository
                .add_announce(note.id, &data.actor_id, data.activity_id.as_deref())
                .await
            {
                eprintln!("Failed to persist announce: {}", err);
                return Err(StatusCode::INTERNAL_SERVER_ERROR);
            }

            println!(
                "Announce recorded: {} boosted note {}",
                data.actor_id, note.id
            );
            Ok(StatusCode::ACCEPTED)
        }
        Err(e) => {
            eprintln!("Failed to handle Announce activity: {}", e);
            Err(StatusCode::BAD_REQUEST)
        }
    }
}
