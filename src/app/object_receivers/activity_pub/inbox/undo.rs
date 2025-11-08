use calmi_activity_streams::types::object::undo::Undo;

use crate::app::object_receivers::activity_pub::inbox::{
    parse_undo_object,
    types::{ActivityHandlerError, UndoActivityData},
};

pub async fn handle_undo(
    undo: Undo,
    base_url: &str,
    target_username: &str,
) -> Result<UndoActivityData, ActivityHandlerError> {
    let actor = undo
        .actor
        .as_ref()
        .ok_or_else(|| ActivityHandlerError("Missing actor".to_string()))?
        .as_ref();

    let actor_id = actor
        .extract_id()
        .map_err(|e| ActivityHandlerError(format!("Failed to extract actor id in Undo: {}", e)))?;

    let object = undo
        .object
        .ok_or_else(|| ActivityHandlerError("Missing object in Undo activity".to_string()))?;

    parse_undo_object(*object, base_url, target_username, actor_id)
}
