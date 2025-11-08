use calmi_activity_streams::types::object::undo::Undo;

use crate::app::object_receivers::activity_pub::inbox::{
    extract_actor_id, extract_note_reference,
    follow::extract_follow_target_username,
    types::{
        ActivityHandlerError, UndoActivityData, UndoAnnounceActivityData, UndoFollowActivityData,
        UndoLikeActivityData,
    },
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

    let actor_id = extract_actor_id(actor)?;

    let object = undo
        .object
        .ok_or_else(|| ActivityHandlerError("Missing object in Undo activity".to_string()))?;

    parse_undo_object(*object, base_url, target_username, actor_id)
}

fn parse_undo_object(
    object: calmi_activity_streams::types::properties::ObjectProperty,
    base_url: &str,
    target_username: &str,
    actor_id: String,
) -> Result<UndoActivityData, ActivityHandlerError> {
    use calmi_activity_streams::types::enums::{
        ObjectBased, ObjectOrLinkOrStringUrl, SingleOrMultiple,
    };

    match object {
        SingleOrMultiple::Single(value) => match value {
            ObjectOrLinkOrStringUrl::Str(id) => Ok(UndoActivityData::ActivityIdOnly {
                actor_id,
                activity_id: id,
            }),
            ObjectOrLinkOrStringUrl::Link(link) => {
                let id = link
                    .href
                    .clone()
                    .ok_or_else(|| ActivityHandlerError("Undo link missing href".to_string()))?;
                Ok(UndoActivityData::ActivityIdOnly {
                    actor_id,
                    activity_id: id,
                })
            }
            ObjectOrLinkOrStringUrl::Object(obj) => match obj {
                ObjectBased::Follow(follow) => {
                    let followee_username =
                        extract_follow_target_username(&follow, base_url, target_username)?;
                    Ok(UndoActivityData::Follow(UndoFollowActivityData {
                        follower_id: actor_id,
                        followee_username,
                        activity_id: follow.id,
                    }))
                }
                ObjectBased::Like(like) => {
                    let object_prop = like.object.as_ref().ok_or_else(|| {
                        ActivityHandlerError("Undo Like missing object".to_string())
                    })?;
                    let target = extract_note_reference(object_prop, base_url)?;
                    Ok(UndoActivityData::Like(UndoLikeActivityData {
                        actor_id,
                        target,
                        activity_id: like.id,
                    }))
                }
                ObjectBased::Announce(announce) => {
                    let object_prop = announce.object.as_ref().ok_or_else(|| {
                        ActivityHandlerError("Undo Announce missing object".to_string())
                    })?;
                    let target = extract_note_reference(object_prop, base_url)?;
                    Ok(UndoActivityData::Announce(UndoAnnounceActivityData {
                        actor_id,
                        target,
                        activity_id: announce.id,
                    }))
                }
                ObjectBased::Activity(activity) => {
                    parse_activity_based_undo(activity, base_url, target_username, actor_id)
                }
                ObjectBased::Object(object) => {
                    if let Some(id) = object.id.clone() {
                        Ok(UndoActivityData::ActivityIdOnly {
                            actor_id,
                            activity_id: id,
                        })
                    } else {
                        Err(ActivityHandlerError(
                            "Undo embedded object missing id".to_string(),
                        ))
                    }
                }
                _ => Err(ActivityHandlerError(
                    "Unsupported undo embedded object".to_string(),
                )),
            },
        },
        SingleOrMultiple::Multiple(_) => Err(ActivityHandlerError(
            "Multiple undo objects are not supported".to_string(),
        )),
    }
}

fn parse_activity_based_undo(
    activity: calmi_activity_streams::types::object::activity::Activity,
    base_url: &str,
    target_username: &str,
    actor_id: String,
) -> Result<UndoActivityData, ActivityHandlerError> {
    let activity_type = activity
        .r#type
        .clone()
        .ok_or_else(|| ActivityHandlerError("Activity missing type".to_string()))?;
    match activity_type.as_str() {
        "Follow" => Ok(UndoActivityData::Follow(UndoFollowActivityData {
            follower_id: actor_id,
            followee_username: target_username.to_string(),
            activity_id: activity.id,
        })),
        "Like" => {
            let target_object = activity
                .object
                .ok_or_else(|| ActivityHandlerError("Undo Like missing object".to_string()))?;
            let target = extract_note_reference(target_object.as_ref(), base_url)?;
            Ok(UndoActivityData::Like(UndoLikeActivityData {
                actor_id,
                target,
                activity_id: activity.id,
            }))
        }
        "Announce" => {
            let target_object = activity
                .object
                .ok_or_else(|| ActivityHandlerError("Undo Announce missing object".to_string()))?;
            let target = extract_note_reference(target_object.as_ref(), base_url)?;
            Ok(UndoActivityData::Announce(UndoAnnounceActivityData {
                actor_id,
                target,
                activity_id: activity.id,
            }))
        }
        other => Err(ActivityHandlerError(format!(
            "Unsupported undo activity type: {}",
            other
        ))),
    }
}
