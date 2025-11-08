use calmi_activity_streams::types::object::like::Like;

use crate::app::object_receivers::activity_pub::inbox::{
    extract_note_reference,
    types::{ActivityHandlerError, LikeActivityData},
};

pub async fn handle_like(
    like: Like,
    base_url: &str,
) -> Result<LikeActivityData, ActivityHandlerError> {
    let actor = like
        .actor
        .as_ref()
        .ok_or_else(|| ActivityHandlerError("Missing actor".to_string()))?
        .as_ref();
    let actor_id = actor
        .extract_id()
        .map_err(|e| ActivityHandlerError(format!("Failed to extract actor id in Like: {}", e)))?;

    let object = like
        .object
        .as_ref()
        .ok_or_else(|| ActivityHandlerError("Missing object in Like activity".to_string()))?;

    let target = extract_note_reference(object.as_ref(), base_url)?;

    if let Some(activity_id) = like.id {
        Ok(LikeActivityData {
            actor_id,
            target,
            activity_id,
        })
    } else {
        Err(ActivityHandlerError("Like activity missing id".to_string()))
    }
}
