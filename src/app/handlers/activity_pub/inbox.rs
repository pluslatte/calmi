mod accept;
mod announce;
mod create;
mod follow;
mod like;
mod undo;

use crate::app::object_receivers;
use crate::app::state::AppState;
use crate::app::types::InboxActivity;
use crate::domain::repositories::{
    FollowRepository, NoteAnnounceRepository, NoteLikeRepository, NoteRepository, UserRepository,
};
use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

pub async fn post(
    Path(username): Path<String>,
    State(state): State<AppState>,
    Json(activity): Json<InboxActivity>,
) -> Result<StatusCode, StatusCode> {
    let storage = &state.storage;
    let user_repository: &dyn UserRepository = storage;
    let note_repository: &dyn NoteRepository = storage;
    let follow_repository: &dyn FollowRepository = storage;
    let like_repository: &dyn NoteLikeRepository = storage;
    let announce_repository: &dyn NoteAnnounceRepository = storage;

    let inbox_owner = user_repository
        .find_user_by_username(&username)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    println!("Received activity for {}: {:?}", username, activity);

    let base_url = state.config.base_url.clone();

    match activity {
        InboxActivity::Follow(follow) => {
            follow::handle(
                follow,
                &base_url,
                &username,
                &inbox_owner,
                follow_repository,
            )
            .await
        }
        InboxActivity::Like(like) => {
            like::handle(
                like,
                &base_url,
                &username,
                &inbox_owner,
                note_repository,
                like_repository,
            )
            .await
        }
        InboxActivity::Announce(announce) => {
            announce::handle(
                announce,
                &base_url,
                &username,
                &inbox_owner,
                note_repository,
                announce_repository,
            )
            .await
        }
        InboxActivity::Undo(undo) => {
            match object_receivers::activity_pub::inbox::handle_undo(undo, &base_url, &username)
                .await
            {
                Ok(data) => {
                    use object_receivers::activity_pub::inbox::UndoActivityData;

                    match data {
                        UndoActivityData::Follow(follow_data) => {
                            undo::follow::handle(
                                follow_data,
                                &username,
                                &inbox_owner,
                                follow_repository,
                            )
                            .await
                        }
                        UndoActivityData::Like(like_data) => {
                            undo::like::handle(
                                like_data,
                                &username,
                                &inbox_owner,
                                note_repository,
                                like_repository,
                            )
                            .await
                        }
                        UndoActivityData::Announce(announce_data) => {
                            undo::announce::handle(
                                announce_data,
                                &username,
                                &inbox_owner,
                                note_repository,
                                announce_repository,
                            )
                            .await
                        }
                        UndoActivityData::ActivityIdOnly {
                            actor_id,
                            activity_id,
                        } => {
                            undo::activity_id_only::handle(
                                actor_id,
                                activity_id,
                                follow_repository,
                                like_repository,
                                announce_repository,
                            )
                            .await
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Failed to handle Undo activity: {}", e);
                    Err(StatusCode::BAD_REQUEST)
                }
            }
        }
        InboxActivity::Create(create) => create::handle(create, &username).await,
        InboxActivity::Accept(accept) => accept::handle(accept, &username).await,
    }
}
