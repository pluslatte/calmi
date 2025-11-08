use calmi_activity_streams::types::object::follow::Follow;

use crate::app::object_receivers::activity_pub::inbox::{
    extract_actor_id, extract_follow_target_username,
    types::{ActivityHandlerError, FollowActivityData},
};

pub async fn handle_follow(
    follow: Follow,
    base_url: &str,
    target_username: &str,
) -> Result<FollowActivityData, ActivityHandlerError> {
    let actor = follow
        .actor
        .as_ref()
        .ok_or_else(|| ActivityHandlerError("Missing actor".to_string()))?
        .as_ref();

    let actor_id = extract_actor_id(actor)?;

    let followee_username = extract_follow_target_username(&follow, base_url, target_username)?;
    if let Some(activity_id) = follow.id {
        Ok(FollowActivityData {
            follower_id: actor_id,
            followee_username,
            activity_id,
        })
    } else {
        Err(ActivityHandlerError(
            "Follow activity missing id".to_string(),
        ))
    }
}
