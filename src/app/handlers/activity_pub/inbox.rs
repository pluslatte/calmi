use crate::app::object_receivers;
use crate::app::state::AppState;
use crate::app::types::InboxActivity;
use crate::domain::repositories::user::UserRepository;
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
    let user_exists = state
        .storage
        .find_by_username(&username)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .is_some();

    if !user_exists {
        return Err(StatusCode::NOT_FOUND);
    }

    println!("Received activity for {}: {:?}", username, activity);

    match activity {
        InboxActivity::Follow(follow) => {
            match object_receivers::activity_pub::inbox::handle_follow(follow, &username).await {
                Ok(data) => {
                    println!(
                        "Follow request: {} wants to follow {}",
                        data.follower_id, data.followee_username
                    );
                    Ok(StatusCode::ACCEPTED)
                }
                Err(e) => {
                    eprintln!("Failed to handle Follow activity: {}", e);
                    Err(StatusCode::BAD_REQUEST)
                }
            }
        }
        InboxActivity::Undo(undo) => {
            match object_receivers::activity_pub::inbox::handle_undo(undo, &username).await {
                Ok(data) => {
                    println!(
                        "Undo request: {} unfollows {}",
                        data.follower_id, data.followee_username
                    );
                    Ok(StatusCode::ACCEPTED)
                }
                Err(e) => {
                    eprintln!("Failed to handle Undo activity: {}", e);
                    Err(StatusCode::BAD_REQUEST)
                }
            }
        }
        InboxActivity::Create(create) => {
            match object_receivers::activity_pub::inbox::handle_create(create, &username).await {
                Ok(data) => {
                    println!(
                        "Create activity: actor={}, object_type={}, object_id={:?}",
                        data.actor_id, data.object_type, data.object_id
                    );
                    Ok(StatusCode::ACCEPTED)
                }
                Err(e) => {
                    eprintln!("Failed to handle Create activity: {}", e);
                    Err(StatusCode::BAD_REQUEST)
                }
            }
        }
        InboxActivity::Accept(accept) => {
            match object_receivers::activity_pub::inbox::handle_accept(accept, &username).await {
                Ok(_) => {
                    println!("Accept activity processed");
                    Ok(StatusCode::ACCEPTED)
                }
                Err(e) => {
                    eprintln!("Failed to handle Accept activity: {}", e);
                    Err(StatusCode::BAD_REQUEST)
                }
            }
        }
    }
}
