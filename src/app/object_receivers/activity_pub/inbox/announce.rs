use calmi_activity_streams::types::object::announce::Announce;

use crate::app::object_receivers::activity_pub::inbox::{
    extract_actor_id, extract_note_reference,
    types::{ActivityHandlerError, AnnounceActivityData},
};

pub async fn handle_announce(
    announce: Announce,
    base_url: &str,
) -> Result<AnnounceActivityData, ActivityHandlerError> {
    let actor = announce
        .actor
        .as_ref()
        .ok_or_else(|| ActivityHandlerError("Missing actor".to_string()))?
        .as_ref();
    let actor_id = extract_actor_id(actor)?;

    let object = announce
        .object
        .as_ref()
        .ok_or_else(|| ActivityHandlerError("Missing object in Announce activity".to_string()))?;

    let target = extract_note_reference(object.as_ref(), base_url)?;

    if let Some(activity_id) = announce.id {
        Ok(AnnounceActivityData {
            actor_id,
            target,
            activity_id,
        })
    } else {
        Err(ActivityHandlerError(
            "Announce activity missing id".to_string(),
        ))
    }
}
