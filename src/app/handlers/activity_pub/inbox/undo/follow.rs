use super::UndoFollowActivityData;
use crate::domain::entities::user::Model as User;
use crate::domain::repositories::FollowRepository;
use axum::http::StatusCode;

pub async fn handle<T: FollowRepository>(
    follow_data: UndoFollowActivityData,
    username: &str,
    inbox_owner: &User,
    storage: &T,
) -> Result<StatusCode, StatusCode> {
    if follow_data.followee_username != username {
        eprintln!(
            "Undo Follow target mismatch: expected {}, received {}",
            username, follow_data.followee_username
        );
        return Err(StatusCode::BAD_REQUEST);
    }

    let mut removed = 0;
    if let Some(activity_id) = follow_data.activity_id.as_deref() {
        removed = storage
            .remove_follow_by_activity_id(activity_id)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    if removed == 0 {
        storage
            .remove_follow(inbox_owner.id, &follow_data.follower_id)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    println!(
        "Undo Follow processed for actor {}",
        follow_data.follower_id
    );
    Ok(StatusCode::ACCEPTED)
}
