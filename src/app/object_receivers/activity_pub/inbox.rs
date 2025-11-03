use calmi_activity_streams::types::object::accept::Accept;
use calmi_activity_streams::types::object::create::Create;
use calmi_activity_streams::types::object::follow::Follow;
use calmi_activity_streams::types::object::undo::Undo;

pub fn endpoint_uri_template() -> &'static str {
    "/users/{username}/inbox"
}

#[derive(Debug)]
pub enum ActivityHandlerError {
    InvalidActivity(String),
    StorageError(String),
}

pub struct FollowActivityData {
    pub follower_id: String,
    pub followee_username: String,
}

pub struct UndoFollowActivityData {
    pub follower_id: String,
    pub followee_username: String,
}

pub struct CreateActivityData {
    pub actor_id: String,
    pub object_type: String,
    pub object_id: Option<String>,
}

pub async fn handle_follow(
    follow: Follow,
    target_username: &str,
) -> Result<FollowActivityData, ActivityHandlerError> {
    let actor = follow
        .actor
        .ok_or_else(|| ActivityHandlerError::InvalidActivity("Missing actor".to_string()))?;

    let actor_id = extract_actor_id(&actor)?;

    Ok(FollowActivityData {
        follower_id: actor_id,
        followee_username: target_username.to_string(),
    })
}

pub async fn handle_undo(
    undo: Undo,
    target_username: &str,
) -> Result<UndoFollowActivityData, ActivityHandlerError> {
    let actor = undo
        .actor
        .ok_or_else(|| ActivityHandlerError::InvalidActivity("Missing actor".to_string()))?;

    let actor_id = extract_actor_id(&actor)?;

    Ok(UndoFollowActivityData {
        follower_id: actor_id,
        followee_username: target_username.to_string(),
    })
}

pub async fn handle_create(
    create: Create,
    _target_username: &str,
) -> Result<CreateActivityData, ActivityHandlerError> {
    let actor = create
        .actor
        .ok_or_else(|| ActivityHandlerError::InvalidActivity("Missing actor".to_string()))?;

    let actor_id = extract_actor_id(&actor)?;

    let object = create.object.ok_or_else(|| {
        ActivityHandlerError::InvalidActivity("Missing object in Create activity".to_string())
    })?;

    let (object_type, object_id) = extract_object_info(&object)?;

    Ok(CreateActivityData {
        actor_id,
        object_type,
        object_id,
    })
}

pub async fn handle_accept(
    _accept: Accept,
    _target_username: &str,
) -> Result<(), ActivityHandlerError> {
    Ok(())
}

fn extract_actor_id(
    actor: &calmi_activity_streams::types::properties::Actor,
) -> Result<String, ActivityHandlerError> {
    use calmi_activity_streams::types::enums::{ObjectOrLinkOrStringUrl, SingleOrMultiple};

    match actor {
        SingleOrMultiple::Single(obj_or_link) => match obj_or_link {
            ObjectOrLinkOrStringUrl::Str(id) => Ok(id.clone()),
            ObjectOrLinkOrStringUrl::Object(obj) => match obj {
                calmi_activity_streams::types::enums::ObjectBased::Person(person) => {
                    person.id.clone().ok_or_else(|| {
                        ActivityHandlerError::InvalidActivity("Person has no id".to_string())
                    })
                }
                _ => Err(ActivityHandlerError::InvalidActivity(
                    "Unsupported actor object type".to_string(),
                )),
            },
            ObjectOrLinkOrStringUrl::Link(link) => link.href.clone().ok_or_else(|| {
                ActivityHandlerError::InvalidActivity("Link has no href".to_string())
            }),
        },
        SingleOrMultiple::Multiple(_) => Err(ActivityHandlerError::InvalidActivity(
            "Multiple actors not supported".to_string(),
        )),
    }
}

fn extract_object_info(
    object: &calmi_activity_streams::types::properties::ObjectProperty,
) -> Result<(String, Option<String>), ActivityHandlerError> {
    use calmi_activity_streams::types::enums::{ObjectOrLinkOrStringUrl, SingleOrMultiple};

    match object {
        SingleOrMultiple::Single(obj_or_link_or_str) => match obj_or_link_or_str {
            ObjectOrLinkOrStringUrl::Str(id) => Ok(("Unknown".to_string(), Some(id.clone()))),
            ObjectOrLinkOrStringUrl::Object(obj) => match obj {
                calmi_activity_streams::types::enums::ObjectBased::Note(note) => {
                    Ok(("Note".to_string(), note.id.clone()))
                }
                calmi_activity_streams::types::enums::ObjectBased::Object(object) => Ok((
                    object.r#type.clone().unwrap_or("Object".to_string()),
                    object.id.clone(),
                )),
                _ => Ok(("Unknown".to_string(), None)),
            },
            ObjectOrLinkOrStringUrl::Link(_link) => Ok(("Link".to_string(), None)),
        },
        SingleOrMultiple::Multiple(_) => Err(ActivityHandlerError::InvalidActivity(
            "Multiple objects not supported".to_string(),
        )),
    }
}
