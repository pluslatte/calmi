use crate::domain::repositories::{FollowRepository, NoteAnnounceRepository, NoteLikeRepository};
use axum::http::StatusCode;

pub async fn handle(
    actor_id: String,
    activity_id: String,
    follow_repository: &dyn FollowRepository,
    like_repository: &dyn NoteLikeRepository,
    announce_repository: &dyn NoteAnnounceRepository,
) -> Result<StatusCode, StatusCode> {
    let removed = follow_repository
        .remove_follow_by_activity_id(&activity_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    if removed > 0 {
        return Ok(StatusCode::ACCEPTED);
    }
    let removed = like_repository
        .remove_like_by_activity_id(&activity_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    if removed > 0 {
        return Ok(StatusCode::ACCEPTED);
    }
    let removed = announce_repository
        .remove_announce_by_activity_id(&activity_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    if removed == 0 {
        eprintln!(
            "Undo ActivityIdOnly could not find local record for id {} from actor {}",
            activity_id, actor_id
        );
    }

    Ok(StatusCode::ACCEPTED)
}
