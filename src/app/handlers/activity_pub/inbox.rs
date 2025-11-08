mod accept;
mod announce;
mod create;
mod follow;
mod like;
mod undo;

use crate::app::state::AppState;
use crate::app::types::InboxActivity;
use crate::domain::repositories::UsersRepository;
use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

pub fn endpoint_uri_template() -> &'static str {
    "/users/{username}/inbox"
}

pub async fn post(
    Path(username): Path<String>,
    State(state): State<AppState>,
    Json(activity): Json<InboxActivity>,
) -> Result<StatusCode, StatusCode> {
    let storage = &state.storage;

    let inbox_owner = UsersRepository::find_user_by_username(storage, &username)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    println!("Received activity for {}: {:?}", username, activity);

    let base_url = state.config.base_url.clone();

    match activity {
        InboxActivity::Follow(follow) => {
            follow::handle(follow, &base_url, &username, &inbox_owner, storage).await
        }
        InboxActivity::Like(like) => {
            like::handle(like, &base_url, &username, &inbox_owner, storage).await
        }
        InboxActivity::Announce(announce) => {
            announce::handle(announce, &base_url, &username, &inbox_owner, storage).await
        }
        InboxActivity::Undo(undo) => match undo::parse_undo(undo, &base_url, &username) {
            Ok(data) => {
                use undo::UndoActivityData;

                match data {
                    UndoActivityData::Follow(follow_data) => {
                        undo::follow::handle(follow_data, &username, &inbox_owner, storage).await
                    }
                    UndoActivityData::Like(like_data) => {
                        undo::like::handle(like_data, &username, &inbox_owner, storage).await
                    }
                    UndoActivityData::Announce(announce_data) => {
                        undo::announce::handle(announce_data, &username, &inbox_owner, storage)
                            .await
                    }
                    UndoActivityData::ActivityIdOnly {
                        actor_id,
                        activity_id,
                    } => undo::activity_id_only::handle(actor_id, activity_id, storage).await,
                }
            }
            Err(err) => {
                eprintln!("Failed to handle Undo activity: {}", err);
                Err(StatusCode::BAD_REQUEST)
            }
        },
        InboxActivity::Create(create) => create::handle(create, &username).await,
        InboxActivity::Accept(accept) => accept::handle(accept, &username).await,
    }
}
