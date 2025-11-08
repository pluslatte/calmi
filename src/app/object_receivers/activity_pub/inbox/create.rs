use calmi_activity_streams::types::object::create::Create;

use crate::app::object_receivers::activity_pub::inbox::{
    extract_actor_id, extract_object_info,
    types::{ActivityHandlerError, CreateActivityData},
};

pub async fn handle_create(
    create: Create,
    _target_username: &str,
) -> Result<CreateActivityData, ActivityHandlerError> {
    let actor = create
        .actor
        .as_ref()
        .ok_or_else(|| ActivityHandlerError("Missing actor".to_string()))?
        .as_ref();

    let actor_id = extract_actor_id(actor)?;

    let object = create
        .object
        .as_ref()
        .ok_or_else(|| ActivityHandlerError("Missing object in Create activity".to_string()))?;

    let (object_type, object_id) = extract_object_info(object.as_ref())?;
    let activity_id = create.id.clone();

    Ok(CreateActivityData {
        actor_id,
        object_type,
        object_id,
        activity_id,
    })
}
